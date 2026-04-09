package domain

import (
	"time"
)

// EmploymentContract represents the labor contract for an employee.
type EmploymentContract struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ContractNumber string    `gorm:"size:100;uniqueIndex;not null" json:"contract_number"`
	EmployeeID     uint      `json:"employee_id"`
	Employee       *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`

	// Contract details
	ContractType string     `gorm:"size:50;not null" json:"contract_type"` // Probation, Fixed-term, Indefinite
	StartDate    time.Time  `json:"start_date"`
	EndDate      *time.Time `json:"end_date"`
	Status       string     `gorm:"size:50;default:'Active'" json:"status"` // Active, Expired, Terminated

	// Financials (basic representation)
	BaseSalary   float64 `json:"base_salary"`
	Currency     string  `gorm:"size:10;default:'VND'" json:"currency"`
	WorkingHours int     `json:"working_hours"` // e.g., 40 hours/week

	// Document reference
	DocumentURL string `gorm:"size:500" json:"document_url"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName overrides the table name
func (EmploymentContract) TableName() string {
	return "hr_employment_contracts"
}
