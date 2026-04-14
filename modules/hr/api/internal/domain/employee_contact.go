package domain

import (
	"time"
)

// EmployeeContact represents a family member or dependent of an employee.
// Dependents are critical for calculating PIT (Personal Income Tax) deductions in Vietnam.
type EmployeeContact struct {
	ID           string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID   string    `gorm:"index;not null" json:"employee_id"`
	Employee     *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Relationship string    `gorm:"size:50;not null" json:"relationship"` // SPOUSE, CHILD, PARENT, SIBLING
	FullName     string    `gorm:"size:200;not null" json:"full_name"`
	DateOfBirth  *time.Time `json:"date_of_birth"`
	IdentityCard string    `gorm:"size:50" json:"identity_card"`
	Phone        string    `gorm:"size:20" json:"phone"`

	// ═══ Người phụ thuộc (giảm trừ thuế TNCN: 4.4 triệu/người/tháng) ═══
	IsDependent   bool       `gorm:"default:false" json:"is_dependent"`
	DependentFrom *time.Time `gorm:"type:date" json:"dependent_from"`
	DependentTo   *time.Time `gorm:"type:date" json:"dependent_to"`

	Notes     string    `gorm:"type:text" json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (EmployeeContact) TableName() string {
	return "hr_employee_contacts"
}
