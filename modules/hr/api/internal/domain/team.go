package domain

import (
	"time"
)

// Team represents a group of employees within a department.
type Team struct {
	ID           string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name         string      `gorm:"size:255;not null" json:"name"`
	Code         string      `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Description  string      `gorm:"type:text" json:"description"`
	DepartmentID string      `json:"department_id"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	LeaderID     *string     `json:"leader_id"`
	Leader       *Employee   `gorm:"foreignKey:LeaderID" json:"leader,omitempty"`
	Employees    []Employee  `gorm:"foreignKey:TeamID" json:"employees,omitempty"`
	Status       string      `gorm:"size:20;default:'ACTIVE'" json:"status"` // ACTIVE, INACTIVE
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

// TableName overrides the table name
func (Team) TableName() string {
	return "hr_teams"
}
