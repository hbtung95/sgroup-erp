package domain

import (
	"time"
)

// Position represents a job title or role within the company.
type Position struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:255;not null" json:"title"`
	Code        string    `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Description string    `gorm:"type:text" json:"description"`
	Level       string    `gorm:"size:50;default:'Junior'" json:"level"` // e.g., Junior, Mid, Senior, Lead, Manager
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName overrides the table name
func (Position) TableName() string {
	return "hr_positions"
}
