package domain

import (
	"time"

	"gorm.io/gorm"
)

// AttendanceRecord stores check-ins and time logs for employees.
type AttendanceRecord struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	EmployeeID uint           `gorm:"index:idx_employee_date" json:"employee_id"`
	Employee   *Employee      `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Date       string         `gorm:"size:10;index:idx_employee_date" json:"date"` // Format: YYYY-MM-DD
	CheckIn    *time.Time     `json:"check_in"`
	CheckOut   *time.Time     `json:"check_out"`
	TotalHours float64        `json:"total_hours"`
	Status     string         `gorm:"size:50" json:"status"` // Present, Absent, Late, Half-day
	Remarks    string         `gorm:"type:text" json:"remarks"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (AttendanceRecord) TableName() string {
	return "hr_attendance_records"
}
