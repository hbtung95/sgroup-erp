package domain

import (
	"time"

	"gorm.io/gorm"
)

// AttendanceRecord stores check-ins and time logs for employees.
type AttendanceRecord struct {
	ID         string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID string    `gorm:"index:idx_employee_date" json:"employee_id"`
	Employee   *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`

	Date     time.Time  `gorm:"type:date;not null;index:idx_employee_date;uniqueIndex:uq_emp_date" json:"date"`
	CheckIn  *time.Time `json:"check_in"`
	CheckOut *time.Time `json:"check_out"`

	TotalHours   float64 `gorm:"type:numeric(5,2)" json:"total_hours"`
	LateMinutes  int     `gorm:"default:0" json:"late_minutes"`
	EarlyLeaveMin int    `gorm:"default:0" json:"early_leave_min"`

	Status  string `gorm:"size:30;not null;default:'PRESENT'" json:"status"` // PRESENT, ABSENT, LATE, HALF_DAY, HOLIDAY, LEAVE, WFH
	Source  string `gorm:"size:30;default:'MANUAL'" json:"source"`           // MANUAL, FINGERPRINT, FACE_ID, QR_CODE, GPS
	Remarks string `gorm:"type:text" json:"remarks"`

	CreatedBy *string    `json:"created_by"`
	UpdatedBy *string    `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (AttendanceRecord) TableName() string {
	return "hr_attendance_records"
}
