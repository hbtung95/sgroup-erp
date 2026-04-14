package usecase

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/repository"
)

// PayrollEngineUseCase handles payroll generation with VN labor law compliance.
type PayrollEngineUseCase interface {
	GeneratePayrollRun(ctx context.Context, title string, periodMonth, periodYear int, cycleStart, cycleEnd time.Time, standardDays float64, adminID string) (*domain.PayrollRun, error)
	ListRuns(ctx context.Context, offset, limit int) ([]domain.PayrollRun, int64, error)
	GetPayslips(ctx context.Context, runID string) ([]domain.Payslip, error)
}

type payrollEngineUseCase struct {
	payrollRepo    repository.PayrollRepository
	attendanceRepo repository.AttendanceRepository
}

func NewPayrollEngineUseCase(pr repository.PayrollRepository, ar repository.AttendanceRepository) PayrollEngineUseCase {
	return &payrollEngineUseCase{
		payrollRepo:    pr,
		attendanceRepo: ar,
	}
}

func (pe *payrollEngineUseCase) GeneratePayrollRun(
	ctx context.Context,
	title string,
	periodMonth, periodYear int,
	cycleStart, cycleEnd time.Time,
	standardDays float64,
	adminID string,
) (*domain.PayrollRun, error) {

	if standardDays <= 0 {
		return nil, errors.New("standard days must be > 0")
	}
	if periodMonth < 1 || periodMonth > 12 {
		return nil, errors.New("period_month must be between 1 and 12")
	}

	// ═══ STEP 1: Create PayrollRun within Transaction ═══
	tx := pe.payrollRepo.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	txRepo := pe.payrollRepo.WithTx(tx)

	now := time.Now()
	run := &domain.PayrollRun{
		Title:        title,
		PeriodMonth:  periodMonth,
		PeriodYear:   periodYear,
		CycleStart:   cycleStart,
		CycleEnd:     cycleEnd,
		Status:       "CALCULATING",
		CalculatedBy: &adminID,
		CalculatedAt: &now,
	}

	if err := txRepo.CreateRun(ctx, run); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create payroll run: %v", err)
	}

	// ═══ STEP 2: Fetch insurance config for this year ═══
	config, err := pe.payrollRepo.GetInsuranceConfig(ctx, periodYear)
	if err != nil || config == nil {
		// Fallback to hardcoded defaults if no config exists
		config = &domain.InsuranceConfig{
			BaseSalary:         2340000,
			CeilingMultiplier:  20,
			BHXHEmpRate:        8.0,
			BHYTEmpRate:        1.5,
			BHTNEmpRate:        1.0,
			BHXHCoRate:         17.5,
			BHYTCoRate:         3.0,
			BHTNCoRate:         1.0,
			PersonalDeduction:  11000000,
			DependentDeduction: 4400000,
		}
	}
	ceiling := config.InsuranceCeiling()

	// ═══ STEP 3: Fetch tax brackets ═══
	taxBrackets, err := pe.payrollRepo.GetTaxBrackets(ctx, periodYear)
	if err != nil || len(taxBrackets) == 0 {
		return nil, errors.New("tax brackets not found — cannot calculate payroll")
	}

	// ═══ STEP 4: Fetch active contracts with employee data ═══
	contracts, err := pe.payrollRepo.GetActiveContracts(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch active contracts: %v", err)
	}

	// ═══ STEP 5: Batch fetch attendance data ═══
	employeeIDs := make([]string, 0, len(contracts))
	for _, c := range contracts {
		employeeIDs = append(employeeIDs, c.EmployeeID)
	}

	sd := cycleStart.Format("2006-01-02")
	ed := cycleEnd.Format("2006-01-02")

	records, _ := pe.attendanceRepo.ListByEmployeeIDs(ctx, employeeIDs, sd, ed)

	// Group attendance by employee
	type empAttendance struct {
		WorkDays    float64
		LateCount   int
		OTHours     float64
	}
	attendanceMap := make(map[string]*empAttendance)
	for _, rec := range records {
		ea, ok := attendanceMap[rec.EmployeeID]
		if !ok {
			ea = &empAttendance{}
			attendanceMap[rec.EmployeeID] = ea
		}
		switch rec.Status {
		case "PRESENT":
			ea.WorkDays += 1.0
		case "LATE":
			ea.WorkDays += 1.0
			ea.LateCount++
		case "HALF_DAY":
			ea.WorkDays += 0.5
		case "WFH", "BUSINESS_TRIP":
			ea.WorkDays += 1.0
		}
	}

	// ═══ STEP 6: Fetch dependent counts per employee ═══
	dependentMap, _ := pe.payrollRepo.GetDependentCounts(ctx, employeeIDs)
	if dependentMap == nil {
		dependentMap = make(map[string]int)
	}

	// ═══ STEP 7: Calculate payslips ═══
	var payslips []domain.Payslip
	var totalGross, totalNet, totalCost float64

	for _, contract := range contracts {
		emp := contract.Employee
		if emp == nil {
			continue
		}

		baseSalary := contract.BaseSalary
		if contract.Status == "ACTIVE" && contract.ContractType == "PROBATION" && contract.ProbationSalary != nil {
			baseSalary = *contract.ProbationSalary
		}

		ea := attendanceMap[contract.EmployeeID]
		actualDays := 0.0
		lateCount := 0
		if ea != nil {
			actualDays = ea.WorkDays
			lateCount = ea.LateCount
		}

		// ── 7a: Prorated salary ──
		proratedSalary := roundVND(baseSalary / standardDays * actualDays)

		// ── 7b: Overtime pay ──
		overtimePay, _ := pe.payrollRepo.GetOvertimePay(ctx, contract.EmployeeID, periodYear, periodMonth, baseSalary, standardDays)

		// ── 7c: Allowances from benefit plans ──
		allowancesTotal, _ := pe.payrollRepo.GetBenefitsPay(ctx, contract.EmployeeID, periodYear, periodMonth)

		// ── 7d: Gross income ──
		grossIncome := proratedSalary + overtimePay + allowancesTotal

		// ── 7e: Insurance (NV) — capped at ceiling ──
		insBase := math.Min(baseSalary, ceiling)
		bhxhEmp := roundVND(insBase * config.BHXHEmpRate / 100)
		bhytEmp := roundVND(insBase * config.BHYTEmpRate / 100)
		bhtnEmp := roundVND(insBase * config.BHTNEmpRate / 100)
		totalInsEmp := bhxhEmp + bhytEmp + bhtnEmp

		// ── 7f: Thuế TNCN lũy tiến ──
		dependentCount := dependentMap[contract.EmployeeID]
		personalDed := config.PersonalDeduction
		dependentDed := config.DependentDeduction * float64(dependentCount)

		taxableIncome := grossIncome - totalInsEmp
		assessableIncome := taxableIncome - personalDed - dependentDed
		if assessableIncome < 0 {
			assessableIncome = 0
		}
		taxAmount := calculateProgressiveTax(assessableIncome, taxBrackets)

		// ── 7g: Other deductions ──
		otherDeductions := 0.0

		// ── 7h: Total deductions + Net salary ──
		totalDeductions := totalInsEmp + taxAmount + otherDeductions
		netSalary := grossIncome - totalDeductions
		if netSalary < 0 {
			netSalary = 0
		}

		// ── 7i: Insurance (DN) ──
		bhxhCo := roundVND(insBase * config.BHXHCoRate / 100)
		bhytCo := roundVND(insBase * config.BHYTCoRate / 100)
		bhtnCo := roundVND(insBase * config.BHTNCoRate / 100)
		totalInsCo := bhxhCo + bhytCo + bhtnCo

		// ── 7j: Total company cost ──
		companyCost := grossIncome + totalInsCo

		// ── 7k: Snapshot employee info ──
		empDept := ""
		empPos := ""
		if emp.Department != nil {
			empDept = emp.Department.Name
		}
		if emp.Position != nil {
			empPos = emp.Position.Title
		}

		payslip := domain.Payslip{
			PayrollRunID: run.ID,
			EmployeeID:  contract.EmployeeID,

			// Snapshot
			EmpCode:        emp.Code,
			EmpFullName:    emp.FullName,
			EmpDepartment:  empDept,
			EmpPosition:    empPos,
			EmpBankAccount: emp.BankAccount,
			EmpBankName:    emp.BankName,

			// Work days
			StandardWorkDays: standardDays,
			ActualWorkDays:   actualDays,
			OvertimeHours:    0,
			LateCount:        lateCount,

			// Income
			BaseSalary:      baseSalary,
			ProratedSalary:  proratedSalary,
			OvertimePay:     overtimePay,
			AllowancesTotal: allowancesTotal,
			GrossIncome:     grossIncome,

			// Employee insurance
			BHXHEmployee:      bhxhEmp,
			BHYTEmployee:      bhytEmp,
			BHTNEmployee:      bhtnEmp,
			TotalInsuranceEmp: totalInsEmp,

			// Tax
			TaxableIncome:      taxableIncome,
			PersonalDeduction:  personalDed,
			DependentDeduction: dependentDed,
			DependentCount:     dependentCount,
			TaxAmount:          taxAmount,

			// Deductions
			OtherDeductions: otherDeductions,
			TotalDeductions: totalDeductions,

			// Company insurance
			BHXHCompany:      bhxhCo,
			BHYTCompany:      bhytCo,
			BHTNCompany:      bhtnCo,
			TotalInsuranceCo: totalInsCo,

			// Net
			NetSalary:       netSalary,
			TotalCompanyCost: companyCost,

			Status: "CALCULATED",
		}

		payslips = append(payslips, payslip)
		totalGross += grossIncome
		totalNet += netSalary
		totalCost += companyCost
	}

	// ═══ STEP 8: Bulk insert payslips ═══
	if err := txRepo.BulkCreatePayslips(ctx, payslips); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to save payslips: %v", err)
	}

	// ═══ STEP 9: Update run summary ═══
	run.TotalEmployees = len(payslips)
	run.TotalGross = roundVND(totalGross)
	run.TotalNet = roundVND(totalNet)
	run.TotalCompanyCost = roundVND(totalCost)
	run.Status = "REVIEW"

	if err := txRepo.UpdateRun(ctx, run); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to finalize run: %v", err)
	}

	tx.Commit()
	return run, nil
}

// calculateProgressiveTax implements Vietnam's 7-bracket progressive PIT.
// Input: assessableIncome = Thu nhập tính thuế (đã trừ BH + giảm trừ)
func calculateProgressiveTax(assessableIncome float64, brackets []domain.TaxBracket) float64 {
	if assessableIncome <= 0 {
		return 0
	}

	totalTax := 0.0
	remaining := assessableIncome

	for _, b := range brackets {
		if remaining <= 0 {
			break
		}

		bracketSize := 0.0
		if b.MaxIncome != nil {
			bracketSize = *b.MaxIncome - b.MinIncome
		} else {
			bracketSize = remaining // Bậc cuối — không giới hạn
		}

		taxable := math.Min(remaining, bracketSize)
		totalTax += taxable * b.TaxRate / 100
		remaining -= taxable
	}

	return roundVND(totalTax)
}

// roundVND rounds to nearest VND (no decimals for Vietnamese Dong).
func roundVND(amount float64) float64 {
	return math.Round(amount)
}

func (pe *payrollEngineUseCase) ListRuns(ctx context.Context, offset, limit int) ([]domain.PayrollRun, int64, error) {
	return pe.payrollRepo.ListRuns(ctx, offset, limit)
}

func (pe *payrollEngineUseCase) GetPayslips(ctx context.Context, runID string) ([]domain.Payslip, error) {
	return pe.payrollRepo.GetPayslipsByRunID(ctx, runID)
}
