package domain

import (
	"time"
)

// BenefitPlan represents a company benefit package.
type BenefitPlan struct {
	ID                 string  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name               string  `gorm:"size:255;not null" json:"name"`
	Code               string  `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Category           string  `gorm:"size:50;not null;index" json:"category"` // HEALTH_INSURANCE, LIFE_INSURANCE, MEAL, TRANSPORT, PHONE, HOUSING, EDUCATION, GYM
	Description        string  `gorm:"type:text" json:"description"`
	Amount             float64 `gorm:"type:decimal(18,4);default:0" json:"amount"`
	Frequency          string  `gorm:"size:20;default:'MONTHLY'" json:"frequency"` // MONTHLY, QUARTERLY, YEARLY, ONE_TIME
	IsTaxable          bool    `gorm:"default:false" json:"is_taxable"`
	IsActive           bool    `gorm:"default:true;index" json:"is_active"`
	EligibleAfterMonths int    `gorm:"default:0" json:"eligible_after_months"`
	EligibleLevels     string  `gorm:"size:255" json:"eligible_levels"` // "Senior,Lead,Manager" or "ALL"
	Provider           string  `gorm:"size:255" json:"provider"`
	ContractURL        string  `gorm:"size:500" json:"contract_url"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (BenefitPlan) TableName() string {
	return "hr_benefit_plans"
}

// EmployeeBenefit assigns a benefit plan to an employee.
type EmployeeBenefit struct {
	ID           string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID   string      `gorm:"index;uniqueIndex:uq_emp_plan;not null" json:"employee_id"`
	Employee     *Employee   `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	PlanID       string      `gorm:"index;uniqueIndex:uq_emp_plan;not null" json:"plan_id"`
	Plan         *BenefitPlan `gorm:"foreignKey:PlanID" json:"plan,omitempty"`
	StartDate    time.Time   `gorm:"type:date;not null" json:"start_date"`
	EndDate      *time.Time  `gorm:"type:date" json:"end_date"`
	Status       string      `gorm:"size:20;default:'ACTIVE';index" json:"status"` // ACTIVE, EXPIRED, CANCELLED
	CustomAmount *float64    `gorm:"type:decimal(18,4)" json:"custom_amount"` // Override plan amount
	Notes        string      `gorm:"type:text" json:"notes"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

func (EmployeeBenefit) TableName() string {
	return "hr_employee_benefits"
}

// EmployeeAsset represents equipment or property assigned to an employee.
type EmployeeAsset struct {
	ID             string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID     string    `gorm:"index;not null" json:"employee_id"`
	Employee       *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	AssetType      string    `gorm:"size:50;not null;index" json:"asset_type"` // LAPTOP, PHONE, MONITOR, KEYBOARD, BADGE, KEY, PARKING, SIM_CARD, OTHER
	AssetName      string    `gorm:"size:255;not null" json:"asset_name"`
	AssetCode      string    `gorm:"size:100" json:"asset_code"`
	SerialNumber   string    `gorm:"size:100" json:"serial_number"`
	PurchaseValue  *float64  `gorm:"type:decimal(18,4)" json:"purchase_value"`
	CurrentValue   *float64  `gorm:"type:decimal(18,4)" json:"current_value"`
	AssignedDate   time.Time `gorm:"type:date;not null" json:"assigned_date"`
	ExpectedReturn *time.Time `gorm:"type:date" json:"expected_return"`
	ReturnedDate   *time.Time `gorm:"type:date" json:"returned_date"`
	ConditionOut   string    `gorm:"size:30;default:'NEW'" json:"condition_out"` // NEW, GOOD, FAIR, POOR
	ConditionIn    string    `gorm:"size:30" json:"condition_in"`
	Status         string    `gorm:"size:20;default:'ASSIGNED';index" json:"status"` // ASSIGNED, RETURNED, LOST, DAMAGED
	Notes          string    `gorm:"type:text" json:"notes"`
	AssignedBy     *string   `json:"assigned_by"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (EmployeeAsset) TableName() string {
	return "hr_employee_assets"
}

// OnboardingTask represents a checklist item for employee onboarding/offboarding.
type OnboardingTask struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID  string    `gorm:"index;not null" json:"employee_id"`
	Employee    *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	TaskType    string    `gorm:"size:30;not null;index" json:"task_type"` // ONBOARDING, OFFBOARDING
	Category    string    `gorm:"size:50;not null" json:"category"` // DOCUMENTS, IT_SETUP, TRAINING, ACCESS, EQUIPMENT, ADMIN
	Title       string    `gorm:"size:255;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"size:20;default:'PENDING';index" json:"status"` // PENDING, IN_PROGRESS, COMPLETED, SKIPPED
	DueDate     *time.Time `gorm:"type:date" json:"due_date"`
	CompletedAt *time.Time `json:"completed_at"`
	CompletedBy *string   `json:"completed_by"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	IsMandatory bool      `gorm:"default:true" json:"is_mandatory"`
	Notes       string    `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (OnboardingTask) TableName() string {
	return "hr_onboarding_tasks"
}
