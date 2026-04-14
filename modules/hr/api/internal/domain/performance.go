package domain

import (
	"time"
)

// ReviewCycle represents a performance evaluation period.
type ReviewCycle struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"size:255;not null" json:"name"` // "Đánh giá Q1/2026"
	CycleType   string    `gorm:"size:20;not null" json:"cycle_type"` // MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL
	StartDate   time.Time `gorm:"type:date;not null" json:"start_date"`
	EndDate     time.Time `gorm:"type:date;not null" json:"end_date"`
	Deadline    time.Time `gorm:"type:date;not null" json:"deadline"`
	Status      string    `gorm:"size:20;default:'DRAFT';index" json:"status"` // DRAFT, OPEN, IN_PROGRESS, CLOSED
	Description string    `gorm:"type:text" json:"description"`
	CreatedBy   *string   `json:"created_by"`

	Reviews []PerformanceReview `gorm:"foreignKey:CycleID" json:"reviews,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (ReviewCycle) TableName() string {
	return "hr_review_cycles"
}

// PerformanceReview represents an individual employee's performance evaluation.
type PerformanceReview struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	CycleID     string    `gorm:"index;uniqueIndex:uq_cycle_emp;not null" json:"cycle_id"`
	Cycle       *ReviewCycle `gorm:"foreignKey:CycleID" json:"cycle,omitempty"`
	EmployeeID  string    `gorm:"index;uniqueIndex:uq_cycle_emp;not null" json:"employee_id"`
	Employee    *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	ReviewerID  *string   `json:"reviewer_id"`
	Reviewer    *Employee `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`

	SelfRating      *float64 `gorm:"type:numeric(3,1)" json:"self_rating"`    // 1.0-5.0
	ManagerRating   *float64 `gorm:"type:numeric(3,1)" json:"manager_rating"` // 1.0-5.0
	FinalRating     *float64 `gorm:"type:numeric(3,1)" json:"final_rating"`
	Grade           string   `gorm:"size:10;index" json:"grade"` // A+, A, B+, B, C, D, F

	SelfComment     string `gorm:"type:text" json:"self_comment"`
	ManagerComment  string `gorm:"type:text" json:"manager_comment"`
	ImprovementPlan string `gorm:"type:text" json:"improvement_plan"`

	Status      string     `gorm:"size:20;default:'PENDING';index" json:"status"` // PENDING, SELF_REVIEWED, MANAGER_REVIEWED, COMPLETED, CALIBRATED
	CompletedAt *time.Time `json:"completed_at"`

	KPIs []ReviewKPI `gorm:"foreignKey:ReviewID" json:"kpis,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (PerformanceReview) TableName() string {
	return "hr_performance_reviews"
}

// ReviewKPI represents a specific KPI metric within a performance review.
type ReviewKPI struct {
	ID           string  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ReviewID     string  `gorm:"index;not null" json:"review_id"`
	KPIName      string  `gorm:"size:255;not null" json:"kpi_name"`
	KPICategory  string  `gorm:"size:50;index" json:"kpi_category"` // RESULT, COMPETENCY, BEHAVIOR, DEVELOPMENT
	Weight       float64 `gorm:"type:numeric(5,2);not null;default:0" json:"weight"` // % weight
	Target       string  `gorm:"size:500" json:"target"`
	ActualResult string  `gorm:"size:500" json:"actual_result"`
	SelfScore    *float64 `gorm:"type:numeric(3,1)" json:"self_score"`
	ManagerScore *float64 `gorm:"type:numeric(3,1)" json:"manager_score"`
	FinalScore   *float64 `gorm:"type:numeric(3,1)" json:"final_score"`
	Notes        string  `gorm:"type:text" json:"notes"`

	CreatedAt time.Time `json:"created_at"`
}

func (ReviewKPI) TableName() string {
	return "hr_review_kpis"
}

// RewardDiscipline records an employee reward or disciplinary action.
type RewardDiscipline struct {
	ID             string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID     string    `gorm:"index;not null" json:"employee_id"`
	Employee       *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Type           string    `gorm:"size:20;not null;index" json:"type"`     // REWARD, DISCIPLINE
	Category       string    `gorm:"size:50;not null" json:"category"` // BONUS, CERTIFICATE, WARNING, SUSPENSION, TERMINATION
	Title          string    `gorm:"size:255;not null" json:"title"`
	Description    string    `gorm:"type:text" json:"description"`
	DecisionNumber string    `gorm:"size:100" json:"decision_number"`
	EffectiveDate  time.Time `gorm:"type:date;not null;index" json:"effective_date"`
	Amount         float64   `gorm:"type:decimal(18,4);default:0" json:"amount"`
	IssuedBy       *string   `json:"issued_by"`
	ApprovedBy     *string   `json:"approved_by"`
	DocumentURL    string    `gorm:"size:500" json:"document_url"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (RewardDiscipline) TableName() string {
	return "hr_rewards_disciplines"
}
