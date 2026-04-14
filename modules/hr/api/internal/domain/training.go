package domain

import (
	"time"

	"gorm.io/gorm"
)

// Course represents a training course or program.
type Course struct {
	ID              string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Title           string    `gorm:"size:255;not null" json:"title"`
	Code            string    `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Description     string    `gorm:"type:text" json:"description"`
	Category        string    `gorm:"size:50;index" json:"category"` // ONBOARDING, TECHNICAL, SOFT_SKILL, COMPLIANCE, MANAGEMENT
	Instructor      string    `gorm:"size:200" json:"instructor"`
	DurationHours   *int      `json:"duration_hours"`
	MaxParticipants *int      `json:"max_participants"`
	Location        string    `gorm:"size:255" json:"location"`
	IsMandatory     bool      `gorm:"default:false" json:"is_mandatory"`
	IsOnline        bool      `gorm:"default:false" json:"is_online"`
	ContentURL      string    `gorm:"size:500" json:"content_url"`
	StartDate       *time.Time `gorm:"type:date" json:"start_date"`
	EndDate         *time.Time `gorm:"type:date" json:"end_date"`
	CostPerPerson   float64   `gorm:"type:decimal(18,4);default:0" json:"cost_per_person"`
	Status          string    `gorm:"size:20;default:'DRAFT';index" json:"status"` // DRAFT, OPEN, IN_PROGRESS, COMPLETED, CANCELLED
	CreatedBy       *string   `json:"created_by"`

	Enrollments []CourseEnrollment `gorm:"foreignKey:CourseID" json:"enrollments,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Course) TableName() string {
	return "hr_courses"
}

// CourseEnrollment represents an employee's enrollment in a training course.
type CourseEnrollment struct {
	ID            string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	CourseID      string    `gorm:"index;uniqueIndex:uq_course_emp;not null" json:"course_id"`
	Course        *Course   `gorm:"foreignKey:CourseID" json:"course,omitempty"`
	EmployeeID    string    `gorm:"index;uniqueIndex:uq_course_emp;not null" json:"employee_id"`
	Employee      *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Status        string    `gorm:"size:20;default:'ENROLLED';index" json:"status"` // ENROLLED, IN_PROGRESS, COMPLETED, DROPPED, FAILED
	EnrolledAt    time.Time `gorm:"default:NOW()" json:"enrolled_at"`
	CompletedAt   *time.Time `json:"completed_at"`
	Score         *float64  `gorm:"type:numeric(5,2)" json:"score"` // 0-100
	CertificateURL string  `gorm:"size:500" json:"certificate_url"`
	Feedback      string    `gorm:"type:text" json:"feedback"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (CourseEnrollment) TableName() string {
	return "hr_course_enrollments"
}
