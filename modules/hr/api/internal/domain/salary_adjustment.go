package domain

import (
	"time"
)

// SalaryAdjustment records a change in an employee's salary over time.
type SalaryAdjustment struct {
	ID             string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID     string    `gorm:"index;not null" json:"employee_id"`
	Employee       *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	ContractID     *string   `json:"contract_id"`
	OldSalary      float64   `gorm:"type:decimal(18,4);not null" json:"old_salary"`
	NewSalary      float64   `gorm:"type:decimal(18,4);not null" json:"new_salary"`
	AdjustmentType string    `gorm:"size:30;not null" json:"adjustment_type"` // PROMOTION, ANNUAL_REVIEW, PROBATION_END, MARKET_ADJUSTMENT, DEMOTION, OTHER
	EffectiveDate  time.Time `gorm:"type:date;not null;index" json:"effective_date"`
	Reason         string    `gorm:"type:text" json:"reason"`
	ApprovedBy     *string   `json:"approved_by"`
	ApprovedAt     *time.Time `json:"approved_at"`
	Status         string    `gorm:"size:20;default:'PENDING';index" json:"status"` // PENDING, APPROVED, REJECTED
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (SalaryAdjustment) TableName() string {
	return "hr_salary_adjustments"
}
