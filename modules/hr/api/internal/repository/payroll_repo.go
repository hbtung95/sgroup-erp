package repository

import (
	"context"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"gorm.io/gorm"
)

type PayrollRepository interface {
	// PayrollRun CRUD
	CreateRun(ctx context.Context, run *domain.PayrollRun) error
	GetRunByID(ctx context.Context, id string) (*domain.PayrollRun, error)
	ListRuns(ctx context.Context, offset, limit int) ([]domain.PayrollRun, int64, error)
	UpdateRunStatus(ctx context.Context, id string, status string) error
	UpdateRun(ctx context.Context, run *domain.PayrollRun) error

	// Payslips
	BulkCreatePayslips(ctx context.Context, payslips []domain.Payslip) error
	GetPayslipsByRunID(ctx context.Context, runID string) ([]domain.Payslip, error)

	// Calculation helpers
	GetActiveContracts(ctx context.Context) ([]domain.EmploymentContract, error)
	GetInsuranceConfig(ctx context.Context, year int) (*domain.InsuranceConfig, error)
	GetTaxBrackets(ctx context.Context, year int) ([]domain.TaxBracket, error)
	GetDependentCounts(ctx context.Context, employeeIDs []string) (map[string]int, error)
	GetOvertimePay(ctx context.Context, employeeID string, year, month int, baseSalary, standardDays float64) (float64, error)
	GetBenefitsPay(ctx context.Context, employeeID string, year, month int) (float64, error)

	// Transaction support
	DB() *gorm.DB
	WithTx(tx *gorm.DB) PayrollRepository
}

type payrollRepository struct {
	db *gorm.DB
}

func NewPayrollRepository(db *gorm.DB) PayrollRepository {
	return &payrollRepository{db: db}
}

func (r *payrollRepository) DB() *gorm.DB {
	return r.db
}

func (r *payrollRepository) WithTx(tx *gorm.DB) PayrollRepository {
	return &payrollRepository{db: tx}
}

func (r *payrollRepository) CreateRun(ctx context.Context, run *domain.PayrollRun) error {
	return r.db.WithContext(ctx).Create(run).Error
}

func (r *payrollRepository) GetRunByID(ctx context.Context, id string) (*domain.PayrollRun, error) {
	var run domain.PayrollRun
	err := r.db.WithContext(ctx).First(&run, "id = ?", id).Error
	return &run, err
}

func (r *payrollRepository) ListRuns(ctx context.Context, offset, limit int) ([]domain.PayrollRun, int64, error) {
	var runs []domain.PayrollRun
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.PayrollRun{})
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Order("period_year DESC, period_month DESC").Offset(offset).Limit(limit).Find(&runs).Error
	return runs, total, err
}

func (r *payrollRepository) UpdateRunStatus(ctx context.Context, id string, status string) error {
	return r.db.WithContext(ctx).Model(&domain.PayrollRun{}).Where("id = ?", id).Update("status", status).Error
}

func (r *payrollRepository) UpdateRun(ctx context.Context, run *domain.PayrollRun) error {
	return r.db.WithContext(ctx).Save(run).Error
}

func (r *payrollRepository) BulkCreatePayslips(ctx context.Context, payslips []domain.Payslip) error {
	if len(payslips) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&payslips).Error
}

func (r *payrollRepository) GetPayslipsByRunID(ctx context.Context, runID string) ([]domain.Payslip, error) {
	var slips []domain.Payslip
	err := r.db.WithContext(ctx).
		Preload("Employee").
		Preload("Employee.Department").
		Preload("Employee.Position").
		Where("payroll_run_id = ?", runID).
		Find(&slips).Error
	return slips, err
}

func (r *payrollRepository) GetActiveContracts(ctx context.Context) ([]domain.EmploymentContract, error) {
	var contracts []domain.EmploymentContract
	err := r.db.WithContext(ctx).
		Preload("Employee").
		Preload("Employee.Department").
		Preload("Employee.Position").
		Where("status = ?", "ACTIVE").
		Find(&contracts).Error
	return contracts, err
}

func (r *payrollRepository) GetInsuranceConfig(ctx context.Context, year int) (*domain.InsuranceConfig, error) {
	var config domain.InsuranceConfig
	err := r.db.WithContext(ctx).
		Where("year = ?", year).
		First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func (r *payrollRepository) GetTaxBrackets(ctx context.Context, year int) ([]domain.TaxBracket, error) {
	var brackets []domain.TaxBracket
	refDate := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	err := r.db.WithContext(ctx).
		Where("effective_from <= ?", refDate).
		Where("effective_to IS NULL OR effective_to >= ?", refDate).
		Order("bracket_level ASC").
		Find(&brackets).Error
	return brackets, err
}

func (r *payrollRepository) GetDependentCounts(ctx context.Context, employeeIDs []string) (map[string]int, error) {
	if len(employeeIDs) == 0 {
		return make(map[string]int), nil
	}

	type result struct {
		EmployeeID string
		Count      int
	}
	var results []result

	err := r.db.WithContext(ctx).
		Model(&domain.EmployeeContact{}).
		Select("employee_id, COUNT(*) as count").
		Where("employee_id IN ?", employeeIDs).
		Where("is_dependent = ?", true).
		Group("employee_id").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	m := make(map[string]int, len(results))
	for _, r := range results {
		m[r.EmployeeID] = r.Count
	}
	return m, nil
}

func (r *payrollRepository) GetOvertimePay(ctx context.Context, employeeID string, year, month int, baseSalary, standardDays float64) (float64, error) {
	var records []domain.OvertimeRecord
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, -1)

	err := r.db.WithContext(ctx).
		Where("employee_id = ?", employeeID).
		Where("status = ?", "APPROVED").
		Where("date >= ? AND date <= ?", startDate, endDate).
		Find(&records).Error
	if err != nil {
		return 0, err
	}

	totalOvertimePay := 0.0
	// Calculation: hourlyRate = baseSalary / (standardDays * 8 hours)
	// Or dynamically standardDays, but let's assume 8 hours/day for now.
	hourlyRate := baseSalary / (standardDays * 8.0)
	for _, rec := range records {
		totalOvertimePay += hourlyRate * rec.TotalHours * rec.Multiplier
	}
	return totalOvertimePay, nil
}

func (r *payrollRepository) GetBenefitsPay(ctx context.Context, employeeID string, year, month int) (float64, error) {
	var activeBenefits []domain.EmployeeBenefit
	refDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)

	err := r.db.WithContext(ctx).
		Preload("Plan").
		Where("employee_id = ?", employeeID).
		Where("status = ?", "ACTIVE").
		Where("start_date <= ?", refDate).
		Where("end_date IS NULL OR end_date >= ?", refDate).
		Find(&activeBenefits).Error
	if err != nil {
		return 0, err
	}

	totalBenefits := 0.0
	for _, benefit := range activeBenefits {
		if benefit.Plan == nil || !benefit.Plan.IsActive {
			continue
		}
		// Calculate appropriate fraction for MONTHLY frequency
		if benefit.Plan.Frequency == "MONTHLY" {
			if benefit.CustomAmount != nil {
				totalBenefits += *benefit.CustomAmount
			} else {
				totalBenefits += benefit.Plan.Amount
			}
		}
		// Handle other frequencies if needed...
	}
	return totalBenefits, nil
}
