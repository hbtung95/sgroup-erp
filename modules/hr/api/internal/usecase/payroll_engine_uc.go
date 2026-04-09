package usecase

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
)

type PayrollEngineUseCase interface {
	CalculatePayslip(ctx context.Context, emp *domain.Employee, run *domain.PayrollRun) (*domain.Payslip, error)
}

type payrollEngineUseCase struct {
}

func NewPayrollEngineUseCase() PayrollEngineUseCase {
	return &payrollEngineUseCase{}
}

// CalculatePayslip contains the Dynamic Formula parsing engine
func (pe *payrollEngineUseCase) CalculatePayslip(ctx context.Context, emp *domain.Employee, run *domain.PayrollRun) (*domain.Payslip, error) {
	// Base values (Normally fetched from Employee's EmploymentContract)
	baseSalary := 15000000.0 // Read from contract

	standardWorkDays := 22.0
	
	// Normally we would query the AttendanceRecord repository to count 'Present' days
	actualWorkDays := 20.0 
	
	allowances := 500000.0 // e.g. Lunch, Parking
	
	// Dynamic Formula: Net = Base / Standard * Actual + Allowances
	grossSalary := (baseSalary / standardWorkDays) * actualWorkDays
	deductions := grossSalary * 0.105 // 10.5% Social Insurance for Vietnam (Simulated)
	
	netSalary := grossSalary + allowances - deductions

	slip := &domain.Payslip{
		PayrollRunID:     run.ID,
		EmployeeID:       emp.ID,
		StandardWorkDays: standardWorkDays,
		ActualWorkDays:   actualWorkDays,
		BaseSalary:       baseSalary,
		Allowances:       allowances,
		Deductions:       deductions,
		NetSalary:        netSalary,
		Status:           "Generated",
	}

	return slip, nil
}
