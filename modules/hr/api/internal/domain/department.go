package domain

import (
	"time"
)

// Department represents a unit within the organization structure.
type Department struct {
	ID          string       `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name        string       `gorm:"size:255;not null" json:"name"`
	Code        string       `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Description string       `gorm:"type:text" json:"description"`
	ParentID    *string      `json:"parent_id"`
	Parent      *Department  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	SubDepts    []Department `gorm:"foreignKey:ParentID" json:"sub_departments,omitempty"`
	ManagerID   *string      `json:"manager_id"`
	Status      string       `gorm:"size:20;default:'ACTIVE'" json:"status"` // ACTIVE, INACTIVE
	SortOrder   int          `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

// TableName overrides the table name
func (Department) TableName() string {
	return "hr_departments"
}
