package domain

import (
	"time"

	"gorm.io/gorm"
)

// PayrollRun represents a specific month's payroll execution cycle
type PayrollRun struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:255;not null" json:"title"`     // e.g., "Tháng 04/2026"
	CycleStart  time.Time      `json:"cycle_start"`                        // 2026-04-01
	CycleEnd    time.Time      `json:"cycle_end"`                          // 2026-04-30
	Status      string         `gorm:"size:50;default:'Draft'" json:"status"` // Draft, Processing, Approved, Paid
	ProcessedBy uint           `json:"processed_by"`                       // Admin ID
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (PayrollRun) TableName() string {
	return "hr_payroll_runs"
}

// Payslip represents an individual employee's salary calculation for a PayrollRun
type Payslip struct {
	ID           uint        `gorm:"primaryKey" json:"id"`
	PayrollRunID uint        `gorm:"index" json:"payroll_run_id"`
	PayrollRun   *PayrollRun `gorm:"foreignKey:PayrollRunID" json:"payroll_run,omitempty"`
	EmployeeID   uint        `gorm:"index" json:"employee_id"`
	Employee     *Employee   `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`

	// Calculation Variables
	StandardWorkDays float64 `json:"standard_work_days"`
	ActualWorkDays   float64 `json:"actual_work_days"`
	BaseSalary       float64 `json:"base_salary"`
	Allowances       float64 `json:"allowances"`
	Deductions       float64 `json:"deductions"` // Tax, Insurance, Penalty
	NetSalary        float64 `json:"net_salary"` // Final payable amount

	Status    string         `gorm:"size:50;default:'Generated'" json:"status"` // Generated, Sent, Paid
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (Payslip) TableName() string {
	return "hr_payslips"
}
