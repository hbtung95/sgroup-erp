package domain

import (
	"time"
)

// Department represents a unit within the organization structure.
type Department struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	Name        string       `gorm:"size:255;not null" json:"name"`
	Code        string       `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Description string       `gorm:"type:text" json:"description"`
	ParentID    *uint        `json:"parent_id"` // Defines hierarchy (Branch -> Dept -> Team)
	Parent      *Department  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	SubDepts    []Department `gorm:"foreignKey:ParentID" json:"sub_departments,omitempty"`
	ManagerID   *uint        `json:"manager_id"` // ID of the Employee managing this department
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

// TableName overrides the table name
func (Department) TableName() string {
	return "hr_departments"
}
