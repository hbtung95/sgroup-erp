package domain

import (
	"time"

	"gorm.io/gorm"
)

// StatusTransition represents an atomic lifecycle event for entities like Employee, Contract, LeaveRequest.
type StatusTransition struct {
	ID         string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EntityType string    `gorm:"size:50;not null" json:"entity_type"`
	EntityID   string    `gorm:"type:uuid;not null;index" json:"entity_id"`
	FromStatus string    `gorm:"size:30" json:"from_status"`
	ToStatus   string    `gorm:"size:30;not null" json:"to_status"`
	ChangedBy  *string   `json:"changed_by"`
	Reason     string    `gorm:"type:text" json:"reason"`
	Metadata   string    `gorm:"type:jsonb" json:"metadata"`
	CreatedAt  time.Time `json:"created_at"`
}

func (StatusTransition) TableName() string { return "hr_status_transitions" }

// Notification represents an alert for HR events.
type Notification struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID    string    `gorm:"type:uuid;not null;index" json:"user_id"`
	Type      string    `gorm:"size:50;not null" json:"type"`
	Title     string    `gorm:"size:255;not null" json:"title"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ActionURL string    `gorm:"size:500" json:"action_url"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

func (Notification) TableName() string { return "hr_notifications" }

// ApprovalFlow represents the workflow rules for multi-level approvals.
type ApprovalFlow struct {
	ID           string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	FlowType     string    `gorm:"size:50;not null" json:"flow_type"` // LEAVE, OVERTIME, SALARY_ADJUSTMENT
	StepOrder    int       `gorm:"not null" json:"step_order"`
	ApproverType string    `gorm:"size:30;not null" json:"approver_type"` // DIRECT_MANAGER, DEPT_MANAGER, HR, CFO
	MinAmount    *float64  `gorm:"type:decimal(18,4)" json:"min_amount"`  // Threshold e.g. > 5 days for Leave
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (ApprovalFlow) TableName() string { return "hr_approval_flows" }

// PayrollAdjustment represents a post-close payroll modification.
type PayrollAdjustment struct {
	ID             string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	PayrollRunID   string      `gorm:"type:uuid;not null" json:"payroll_run_id"`
	PayrollRun     *PayrollRun `gorm:"foreignKey:PayrollRunID" json:"payroll_run,omitempty"`
	EmployeeID     string      `gorm:"type:uuid;not null" json:"employee_id"`
	Employee       *Employee   `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	AdjustmentType string      `gorm:"size:20;not null" json:"adjustment_type"` // ADDITION, DEDUCTION
	Amount         float64     `gorm:"type:decimal(18,4);not null" json:"amount"`
	Reason         string      `gorm:"type:text;not null" json:"reason"`
	Status         string      `gorm:"size:20;default:'PENDING'" json:"status"` // PENDING, APPROVED, REJECTED
	ApprovedBy     *string     `json:"approved_by"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

func (PayrollAdjustment) TableName() string { return "hr_payroll_adjustments" }

// EmployeeSkill represents an item in the skills matrix.
type EmployeeSkill struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID  string    `gorm:"type:uuid;not null;index" json:"employee_id"`
	Employee    *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	SkillName   string    `gorm:"size:100;not null" json:"skill_name"`
	Proficiency int       `gorm:"not null" json:"proficiency"` // 1-5
	Verified    bool      `gorm:"default:false" json:"verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (EmployeeSkill) TableName() string { return "hr_employee_skills" }

// CompanyPolicy is dynamic settings for hr rules.
type CompanyPolicy struct {
	ID          string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Key         string         `gorm:"size:100;uniqueIndex;not null" json:"key"`
	Value       string         `gorm:"type:jsonb;not null" json:"value"`
	Description string         `gorm:"type:text" json:"description"`
	UpdatedBy   *string        `json:"updated_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (CompanyPolicy) TableName() string { return "hr_company_policies" }
