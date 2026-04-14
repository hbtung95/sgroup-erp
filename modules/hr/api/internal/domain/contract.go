package domain

import (
	"time"

	"gorm.io/gorm"
)

// EmploymentContract represents the labor contract for an employee.
type EmploymentContract struct {
	ID              string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ContractNumber  string    `gorm:"size:100;uniqueIndex;not null" json:"contract_number"`
	EmployeeID      string    `json:"employee_id"`
	Employee        *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`

	// ═══ Loại & thời hạn ═══
	ContractType string     `gorm:"size:50;not null" json:"contract_type"` // PROBATION, FIXED_TERM, INDEFINITE, SEASONAL
	StartDate    time.Time  `gorm:"type:date;not null" json:"start_date"`
	EndDate      *time.Time `gorm:"type:date" json:"end_date"`
	SigningDate  *time.Time `gorm:"type:date" json:"signing_date"`

	// ═══ Lifecycle ═══
	Status             string  `gorm:"size:30;default:'ACTIVE'" json:"status"` // DRAFT, ACTIVE, EXPIRED, TERMINATED, RENEWED
	TerminatedDate     *time.Time `gorm:"type:date" json:"terminated_date"`
	TerminatedReason   string     `gorm:"type:text" json:"terminated_reason"`
	PreviousContractID *string    `json:"previous_contract_id"`

	// ═══ Tài chính ═══
	BaseSalary      float64  `gorm:"type:decimal(18,4);not null" json:"base_salary"`
	ProbationSalary *float64 `gorm:"type:decimal(18,4)" json:"probation_salary"` // Thường 85% base
	Currency        string   `gorm:"size:10;default:'VND'" json:"currency"`
	SalaryType      string   `gorm:"size:20;default:'GROSS'" json:"salary_type"` // GROSS or NET

	// ═══ Điều kiện làm việc ═══
	WorkingHours int    `gorm:"default:8" json:"working_hours"`  // Giờ/ngày
	WorkingDays  int    `gorm:"default:22" json:"working_days"`  // Ngày/tháng
	WorkLocation string `gorm:"size:255" json:"work_location"`

	// ═══ Tài liệu ═══
	DocumentURL string `gorm:"size:500" json:"document_url"`
	Notes       string `gorm:"type:text" json:"notes"`

	// ═══ Người ký ═══
	SignedBy *string `json:"signed_by"`

	Version   int        `gorm:"default:1" json:"version"`
	CreatedBy *string    `json:"created_by"`
	UpdatedBy *string    `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (EmploymentContract) TableName() string {
	return "hr_employment_contracts"
}
