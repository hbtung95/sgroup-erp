package domain

import (
	"time"

	"gorm.io/gorm"
)

// OvertimeRecord represents an employee's overtime work request.
type OvertimeRecord struct {
	ID           string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID   string    `gorm:"index;not null" json:"employee_id"`
	Employee     *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Date         time.Time `gorm:"type:date;not null;index" json:"date"`
	StartTime    string    `gorm:"size:10;not null" json:"start_time"` // HH:MM format
	EndTime      string    `gorm:"size:10;not null" json:"end_time"`
	TotalHours   float64   `gorm:"type:numeric(5,2);not null" json:"total_hours"`
	OvertimeType string    `gorm:"size:30;not null" json:"overtime_type"` // WEEKDAY (150%), WEEKEND (200%), HOLIDAY (300%), NIGHT (+30%)
	Multiplier   float64   `gorm:"type:numeric(3,2);not null;default:1.50" json:"multiplier"`
	Reason       string    `gorm:"type:text" json:"reason"`
	Status       string    `gorm:"size:20;default:'PENDING';index" json:"status"` // PENDING, APPROVED, REJECTED
	ApprovedBy   *string   `json:"approved_by"`
	ApprovedAt   *time.Time `json:"approved_at"`
	RejectionNote string   `gorm:"type:text" json:"rejection_note"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (OvertimeRecord) TableName() string {
	return "hr_overtime_records"
}
