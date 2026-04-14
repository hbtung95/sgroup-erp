package domain

import (
	"time"

	"gorm.io/gorm"
)

// PayrollRun represents a specific month's payroll execution cycle.
type PayrollRun struct {
	ID          string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Title       string `gorm:"size:255;not null" json:"title"` // "Bảng lương Tháng 04/2026"
	PeriodMonth int    `gorm:"not null;uniqueIndex:uq_payroll_period" json:"period_month"`
	PeriodYear  int    `gorm:"not null;uniqueIndex:uq_payroll_period" json:"period_year"`

	CycleStart time.Time `gorm:"type:date;not null" json:"cycle_start"`
	CycleEnd   time.Time `gorm:"type:date;not null" json:"cycle_end"`

	// ═══ Tổng hợp ═══
	TotalEmployees  int     `gorm:"default:0" json:"total_employees"`
	TotalGross      float64 `gorm:"type:decimal(18,4);default:0" json:"total_gross"`
	TotalNet        float64 `gorm:"type:decimal(18,4);default:0" json:"total_net"`
	TotalCompanyCost float64 `gorm:"type:decimal(18,4);default:0" json:"total_company_cost"`

	// ═══ Lifecycle ═══
	Status string `gorm:"size:30;default:'DRAFT'" json:"status"` // DRAFT, CALCULATING, REVIEW, APPROVED, PAID, CANCELLED

	CalculatedAt *time.Time `json:"calculated_at"`
	CalculatedBy *string    `json:"calculated_by"`
	ApprovedAt   *time.Time `json:"approved_at"`
	ApprovedBy   *string    `json:"approved_by"`
	PaidAt       *time.Time `json:"paid_at"`

	Notes string `gorm:"type:text" json:"notes"`

	Version   int        `gorm:"default:1" json:"version"`
	CreatedBy *string    `json:"created_by"`
	UpdatedBy *string    `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (PayrollRun) TableName() string {
	return "hr_payroll_runs"
}

// Payslip represents an individual employee's salary calculation for a PayrollRun.
// Tuân thủ Luật Lao động Việt Nam: BHXH/BHYT/BHTN + Thuế TNCN lũy tiến.
type Payslip struct {
	ID           string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	PayrollRunID string      `gorm:"index;uniqueIndex:uq_run_emp" json:"payroll_run_id"`
	PayrollRun   *PayrollRun `gorm:"foreignKey:PayrollRunID" json:"payroll_run,omitempty"`
	EmployeeID   string      `gorm:"index;uniqueIndex:uq_run_emp" json:"employee_id"`
	Employee     *Employee   `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`

	// ═══ Snapshot NV tại thời điểm tính lương (Denormalization) ═══
	EmpCode        string `gorm:"size:50" json:"emp_code"`
	EmpFullName    string `gorm:"size:200" json:"emp_full_name"`
	EmpDepartment  string `gorm:"size:255" json:"emp_department"`
	EmpPosition    string `gorm:"size:255" json:"emp_position"`
	EmpBankAccount string `gorm:"size:50" json:"emp_bank_account"`
	EmpBankName    string `gorm:"size:100" json:"emp_bank_name"`

	// ═══ Ngày công ═══
	StandardWorkDays float64 `gorm:"type:numeric(5,2);not null;default:22" json:"standard_work_days"`
	ActualWorkDays   float64 `gorm:"type:numeric(5,2);not null;default:0" json:"actual_work_days"`
	LeaveDaysPaid    float64 `gorm:"type:numeric(4,1);default:0" json:"leave_days_paid"`
	LeaveDaysUnpaid  float64 `gorm:"type:numeric(4,1);default:0" json:"leave_days_unpaid"`
	OvertimeHours    float64 `gorm:"type:numeric(5,2);default:0" json:"overtime_hours"`
	LateCount        int     `gorm:"default:0" json:"late_count"`

	// ═══ Thu nhập ═══
	BaseSalary     float64 `gorm:"type:decimal(18,4);not null" json:"base_salary"`
	ProratedSalary float64 `gorm:"type:decimal(18,4);not null" json:"prorated_salary"` // Lương theo ngày công
	OvertimePay    float64 `gorm:"type:decimal(18,4);default:0" json:"overtime_pay"`
	AllowancesTotal float64 `gorm:"type:decimal(18,4);default:0" json:"allowances_total"`
	BonusTotal     float64 `gorm:"type:decimal(18,4);default:0" json:"bonus_total"`
	GrossIncome    float64 `gorm:"type:decimal(18,4);not null" json:"gross_income"`

	// ═══ Khấu trừ NV (Luật VN) ═══
	BHXHEmployee      float64 `gorm:"type:decimal(18,4);default:0" json:"bhxh_employee"`       // 8%
	BHYTEmployee      float64 `gorm:"type:decimal(18,4);default:0" json:"bhyt_employee"`       // 1.5%
	BHTNEmployee      float64 `gorm:"type:decimal(18,4);default:0" json:"bhtn_employee"`       // 1%
	TotalInsuranceEmp float64 `gorm:"type:decimal(18,4);default:0" json:"total_insurance_emp"` // 10.5%

	// ═══ Thuế TNCN ═══
	TaxableIncome      float64 `gorm:"type:decimal(18,4);default:0" json:"taxable_income"`
	PersonalDeduction  float64 `gorm:"type:decimal(18,4);default:11000000" json:"personal_deduction"`   // 11 triệu
	DependentDeduction float64 `gorm:"type:decimal(18,4);default:0" json:"dependent_deduction"`
	DependentCount     int     `gorm:"default:0" json:"dependent_count"`
	TaxAmount          float64 `gorm:"type:decimal(18,4);default:0" json:"tax_amount"`

	// ═══ Khấu trừ khác ═══
	OtherDeductions float64 `gorm:"type:decimal(18,4);default:0" json:"other_deductions"`
	TotalDeductions float64 `gorm:"type:decimal(18,4);default:0" json:"total_deductions"`

	// ═══ BHXH phía Doanh nghiệp ═══
	BHXHCompany      float64 `gorm:"type:decimal(18,4);default:0" json:"bhxh_company"`       // 17.5%
	BHYTCompany      float64 `gorm:"type:decimal(18,4);default:0" json:"bhyt_company"`       // 3%
	BHTNCompany      float64 `gorm:"type:decimal(18,4);default:0" json:"bhtn_company"`       // 1%
	TotalInsuranceCo float64 `gorm:"type:decimal(18,4);default:0" json:"total_insurance_co"` // 21.5%

	// ═══ Thực lĩnh ═══
	NetSalary       float64 `gorm:"type:decimal(18,4);not null" json:"net_salary"`
	TotalCompanyCost float64 `gorm:"type:decimal(18,4);default:0" json:"total_company_cost"`

	// ═══ Trạng thái ═══
	Status string     `gorm:"size:20;default:'DRAFT'" json:"status"` // DRAFT, CALCULATED, CONFIRMED, PAID
	PaidAt *time.Time `json:"paid_at"`

	Version   int        `gorm:"default:1" json:"version"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (Payslip) TableName() string {
	return "hr_payslips"
}

// PayslipItem represents a specific line item in a payslip (allowance, bonus, deduction).
type PayslipItem struct {
	ID        string  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	PayslipID string  `gorm:"index" json:"payslip_id"`
	Payslip   *Payslip `gorm:"foreignKey:PayslipID" json:"payslip,omitempty"`

	Category string  `gorm:"size:30;not null" json:"category"` // ALLOWANCE, BONUS, DEDUCTION, REIMBURSEMENT
	ItemCode string  `gorm:"size:50;not null" json:"item_code"` // VD: "ALW-MEAL", "BNS-KPI"
	ItemName string  `gorm:"size:200;not null" json:"item_name"`
	Amount   float64 `gorm:"type:decimal(18,4);not null" json:"amount"`
	Quantity float64 `gorm:"type:numeric(5,2);default:1" json:"quantity"`
	Notes    string  `gorm:"type:text" json:"notes"`

	CreatedAt time.Time `json:"created_at"`
}

// TableName overrides the table name
func (PayslipItem) TableName() string {
	return "hr_payslip_items"
}

// TaxBracket represents a Vietnamese PIT (Personal Income Tax) progressive bracket.
type TaxBracket struct {
	ID           string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	BracketLevel int        `gorm:"not null" json:"bracket_level"` // 1-7
	MinIncome    float64    `gorm:"type:decimal(18,4);not null" json:"min_income"`
	MaxIncome    *float64   `gorm:"type:decimal(18,4)" json:"max_income"` // NULL = unlimited
	TaxRate      float64    `gorm:"type:numeric(5,2);not null" json:"tax_rate"`
	EffectiveFrom time.Time `gorm:"type:date;not null" json:"effective_from"`
	EffectiveTo  *time.Time `gorm:"type:date" json:"effective_to"`
	Notes        string     `gorm:"type:text" json:"notes"`
	CreatedAt    time.Time  `json:"created_at"`
}

// TableName overrides the table name
func (TaxBracket) TableName() string {
	return "hr_tax_brackets"
}
