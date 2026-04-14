package domain

import (
	"time"

	"gorm.io/gorm"
)

// Job represents an open position for recruitment.
type Job struct {
	ID              string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Title           string    `gorm:"size:255;not null" json:"title"`
	Code            string    `gorm:"size:50;uniqueIndex;not null" json:"code"`
	DepartmentID    *string   `json:"department_id"`
	Department      *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	PositionID      *string   `json:"position_id"`
	Position        *Position `gorm:"foreignKey:PositionID" json:"position,omitempty"`
	Description     string    `gorm:"type:text" json:"description"`
	Requirements    string    `gorm:"type:text" json:"requirements"`
	Benefits        string    `gorm:"type:text" json:"benefits"`
	EmploymentType  string    `gorm:"size:30;default:'FULL_TIME'" json:"employment_type"`
	ExperienceMin   *int      `json:"experience_min"`
	SalaryMin       *float64  `gorm:"type:decimal(18,4)" json:"salary_min"`
	SalaryMax       *float64  `gorm:"type:decimal(18,4)" json:"salary_max"`
	Headcount       int       `gorm:"default:1" json:"headcount"`
	Status          string    `gorm:"size:20;default:'DRAFT';index" json:"status"` // DRAFT, OPEN, ON_HOLD, CLOSED, CANCELLED
	Priority        string    `gorm:"size:10;default:'NORMAL'" json:"priority"`
	OpenedAt        *time.Time `json:"opened_at"`
	ClosedAt        *time.Time `json:"closed_at"`
	Deadline        *time.Time `gorm:"type:date" json:"deadline"`
	RecruiterID     *string   `json:"recruiter_id"`
	Recruiter       *Employee `gorm:"foreignKey:RecruiterID" json:"recruiter,omitempty"`
	HiringManagerID *string   `json:"hiring_manager_id"`
	HiringManager   *Employee `gorm:"foreignKey:HiringManagerID" json:"hiring_manager,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Job) TableName() string {
	return "hr_jobs"
}

// Candidate represents a job applicant in the recruitment pipeline.
type Candidate struct {
	ID              string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	JobID           *string   `json:"job_id"`
	Job             *Job      `gorm:"foreignKey:JobID" json:"job,omitempty"`
	FullName        string    `gorm:"size:200;not null" json:"full_name"`
	Email           string    `gorm:"size:255;not null;index" json:"email"`
	Phone           string    `gorm:"size:20" json:"phone"`
	DateOfBirth     *time.Time `json:"date_of_birth"`
	CVURL           string    `gorm:"size:500;column:cv_url" json:"cv_url"`
	CoverLetter     string    `gorm:"type:text" json:"cover_letter"`
	PortfolioURL    string    `gorm:"size:500" json:"portfolio_url"`
	Source          string    `gorm:"size:50" json:"source"` // LINKEDIN, REFERRAL, WEBSITE, JOB_BOARD, HEAD_HUNTER
	ReferredBy      *string   `json:"referred_by"`
	ExperienceYears *int      `json:"experience_years"`
	CurrentSalary   *float64  `gorm:"type:decimal(18,4)" json:"current_salary"`
	ExpectedSalary  *float64  `gorm:"type:decimal(18,4)" json:"expected_salary"`
	Stage           string    `gorm:"size:30;default:'NEW';index" json:"stage"` // NEW, SCREENING, PHONE_SCREEN, INTERVIEW, TECHNICAL_TEST, OFFER, HIRED, REJECTED, WITHDRAWN
	Rating          *int      `json:"rating"` // 1-5
	RejectionReason string    `gorm:"type:text" json:"rejection_reason"`
	Notes           string    `gorm:"type:text" json:"notes"`
	HiredEmployeeID *string   `json:"hired_employee_id"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Candidate) TableName() string {
	return "hr_candidates"
}

// InterviewSchedule represents a scheduled interview for a candidate.
type InterviewSchedule struct {
	ID             string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	CandidateID    string    `gorm:"index;not null" json:"candidate_id"`
	Candidate      *Candidate `gorm:"foreignKey:CandidateID" json:"candidate,omitempty"`
	Round          int       `gorm:"default:1" json:"round"`
	InterviewType  string    `gorm:"size:30;default:'ONSITE'" json:"interview_type"` // ONSITE, ONLINE, PHONE
	ScheduledAt    time.Time `gorm:"not null;index" json:"scheduled_at"`
	DurationMinutes int     `gorm:"default:60" json:"duration_minutes"`
	Location       string    `gorm:"size:255" json:"location"`
	Status         string    `gorm:"size:20;default:'SCHEDULED';index" json:"status"` // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
	OverallRating  *int      `json:"overall_rating"` // 1-5
	Feedback       string    `gorm:"type:text" json:"feedback"`
	Result         string    `gorm:"size:20" json:"result"` // PASS, FAIL, ON_HOLD

	Interviewers []InterviewInterviewer `gorm:"foreignKey:InterviewID" json:"interviewers,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (InterviewSchedule) TableName() string {
	return "hr_interview_schedules"
}

// InterviewInterviewer is a junction table linking interviews to interviewers.
type InterviewInterviewer struct {
	ID            string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	InterviewID   string    `gorm:"index;uniqueIndex:uq_interview_interviewer" json:"interview_id"`
	InterviewerID string    `gorm:"index;uniqueIndex:uq_interview_interviewer" json:"interviewer_id"`
	Interviewer   *Employee `gorm:"foreignKey:InterviewerID" json:"interviewer,omitempty"`
	Feedback      string    `gorm:"type:text" json:"feedback"`
	Rating        *int      `json:"rating"` // 1-5
	CreatedAt     time.Time `json:"created_at"`
}

func (InterviewInterviewer) TableName() string {
	return "hr_interview_interviewers"
}
