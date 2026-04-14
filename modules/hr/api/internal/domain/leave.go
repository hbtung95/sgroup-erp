package domain

import (
	"time"
)

// LeaveRequest represents an employee's application for taking time off.
type LeaveRequest struct {
	ID         string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID string    `json:"employee_id"`
	Employee   *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`

	// ═══ Chi tiết nghỉ ═══
	LeaveType    string    `gorm:"size:30;not null" json:"leave_type"` // ANNUAL, SICK, UNPAID, MATERNITY, PATERNITY, WEDDING, BEREAVEMENT, COMP_OFF
	StartDate    time.Time `gorm:"type:date;not null" json:"start_date"`
	EndDate      time.Time `gorm:"type:date;not null" json:"end_date"`
	TotalDays    float64   `gorm:"type:numeric(4,1);not null" json:"total_days"`
	IsHalfDay    bool      `gorm:"default:false" json:"is_half_day"`
	HalfDayPeriod string   `gorm:"size:10" json:"half_day_period"` // MORNING, AFTERNOON

	Reason        string `gorm:"type:text;not null" json:"reason"`
	AttachmentURL string `gorm:"size:500" json:"attachment_url"`

	// ═══ Phê duyệt đa cấp ═══
	Status string `gorm:"size:20;default:'PENDING'" json:"status"` // PENDING, LEADER_APPROVED, APPROVED, REJECTED, CANCELLED

	// Level 1: Team Leader
	LeaderID     *string    `json:"leader_id"`
	Leader       *Employee  `gorm:"foreignKey:LeaderID" json:"leader,omitempty"`
	LeaderStatus *string    `gorm:"size:20" json:"leader_status"`
	LeaderNote   string     `gorm:"type:text" json:"leader_note"`
	LeaderAt     *time.Time `json:"leader_at"`

	// Level 2: Manager / HR
	ApproverID     *string    `json:"approver_id"`
	Approver       *Employee  `gorm:"foreignKey:ApproverID" json:"approver,omitempty"`
	ApproverStatus *string    `gorm:"size:20" json:"approver_status"`
	ApproverNote   string     `gorm:"type:text" json:"approver_note"`
	ApprovedAt     *time.Time `json:"approved_at"`

	Version   int        `gorm:"default:1" json:"version"`
	CreatedBy *string    `json:"created_by"`
	UpdatedBy *string    `json:"updated_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName overrides the table name
func (LeaveRequest) TableName() string {
	return "hr_leave_requests"
}

// LeaveBalance tracks the remaining leave days for an employee per year.
type LeaveBalance struct {
	ID         string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID string    `json:"employee_id"`
	Employee   *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Year       int       `gorm:"not null;uniqueIndex:idx_emp_year" json:"year"`

	// ═══ Phép năm (Luật LĐ VN: 12 ngày + thâm niên) ═══
	AnnualEntitled float64 `gorm:"type:numeric(4,1);default:12" json:"annual_entitled"`
	AnnualUsed     float64 `gorm:"type:numeric(4,1);default:0" json:"annual_used"`
	AnnualPending  float64 `gorm:"type:numeric(4,1);default:0" json:"annual_pending"`
	AnnualCarried  float64 `gorm:"type:numeric(4,1);default:0" json:"annual_carried"` // Phép năm trước chuyển sang

	// ═══ Nghỉ ốm ═══
	SickEntitled float64 `gorm:"type:numeric(4,1);default:30" json:"sick_entitled"`
	SickUsed     float64 `gorm:"type:numeric(4,1);default:0" json:"sick_used"`

	// ═══ Nghỉ không lương ═══
	UnpaidUsed float64 `gorm:"type:numeric(4,1);default:0" json:"unpaid_used"`

	// ═══ Nghỉ bù ═══
	CompOffEntitled float64 `gorm:"type:numeric(4,1);default:0" json:"comp_off_entitled"`
	CompOffUsed     float64 `gorm:"type:numeric(4,1);default:0" json:"comp_off_used"`

	Version   int        `gorm:"default:1" json:"version"`
	CreatedBy *string    `json:"created_by"`
	UpdatedBy *string    `json:"updated_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName overrides the table name
func (LeaveBalance) TableName() string {
	return "hr_leave_balances"
}
