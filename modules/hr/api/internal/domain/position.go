package domain

import (
	"time"
)

// Position represents a job title or role within the company.
type Position struct {
	ID           string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Title        string      `gorm:"size:255;not null" json:"title"`
	Code         string      `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Description  string      `gorm:"type:text" json:"description"`
	Level        string      `gorm:"size:50;default:'Junior'" json:"level"` // Intern, Junior, Mid, Senior, Lead, Manager, Director, C-Level
	MinSalary    *float64    `gorm:"type:decimal(18,4)" json:"min_salary"`
	MaxSalary    *float64    `gorm:"type:decimal(18,4)" json:"max_salary"`
	DepartmentID *string     `json:"department_id"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	IsActive     bool        `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

// TableName overrides the table name
func (Position) TableName() string {
	return "hr_positions"
}
