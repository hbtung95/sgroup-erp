package domain

import (
	"strings"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/utils"
	"gorm.io/gorm"
)

// Employee represents a person working for the company.
type Employee struct {
	ID string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`

	// ═══ Mã định danh ═══
	Code string `gorm:"size:50;uniqueIndex;not null" json:"code"` // VD: "NV-2026-0042"

	// ═══ Thông tin cá nhân ═══
	FirstName     string     `gorm:"size:100;not null" json:"first_name"`
	LastName      string     `gorm:"size:100;not null" json:"last_name"`
	FullName      string     `gorm:"size:200" json:"full_name"` // Computed at app layer: LastName + FirstName
	EnglishName   string     `gorm:"size:200" json:"english_name"`
	DateOfBirth   *time.Time `json:"date_of_birth"`
	Gender        string     `gorm:"size:10" json:"gender"`          // Male, Female, Other
	MaritalStatus string     `gorm:"size:20" json:"marital_status"`  // Single, Married, Divorced
	Nationality   string     `gorm:"size:50;default:'Việt Nam'" json:"nationality"`
	Ethnicity     string     `gorm:"size:50" json:"ethnicity"` // Dân tộc
	Religion      string     `gorm:"size:50" json:"religion"`  // Tôn giáo
	AvatarURL     string     `gorm:"size:500" json:"avatar_url"`

	// ═══ Giấy tờ tùy thân (VN-specific) ═══
	IdentityCard   string     `gorm:"size:50;uniqueIndex" json:"identity_card"` // CMND/CCCD cũ
	VnId           string     `gorm:"size:20;uniqueIndex" json:"vn_id"`         // Căn cước công dân mới (12 số)
	IdIssueDate    *time.Time `json:"id_issue_date"`
	IdIssuePlace   string     `gorm:"size:255" json:"id_issue_place"`
	PassportNumber string     `gorm:"size:50" json:"passport_number"`
	PassportExpiry *time.Time `json:"passport_expiry"`

	// ═══ Thuế & Bảo hiểm ═══
	TaxCode           string `gorm:"size:20" json:"tax_code"`
	InsuranceBookNo   string `gorm:"size:30" json:"insurance_book_no"`
	HealthInsuranceNo string `gorm:"size:30" json:"health_insurance_no"`

	// ═══ Ngân hàng ═══
	BankName        string `gorm:"size:100" json:"bank_name"`
	BankBranch      string `gorm:"size:200" json:"bank_branch"`
	BankAccount     string `gorm:"size:50" json:"bank_account"`
	BankAccountName string `gorm:"size:200" json:"bank_account_name"`

	// ═══ Liên hệ ═══
	Email            string `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PersonalEmail    string `gorm:"size:255" json:"personal_email"`
	Phone            string `gorm:"size:20" json:"phone"`
	RelativePhone    string `gorm:"size:20" json:"relative_phone"`
	RelativeName     string `gorm:"size:200" json:"relative_name"`
	RelativeRelation string `gorm:"size:50" json:"relative_relation"` // Cha/Mẹ/Vợ/Chồng

	// ═══ Địa chỉ ═══
	PermanentAddress string `gorm:"type:text" json:"permanent_address"` // Hộ khẩu thường trú
	CurrentAddress   string `gorm:"type:text" json:"current_address"`   // Địa chỉ tạm trú

	// ═══ Vị trí công việc ═══
	DepartmentID *string     `json:"department_id"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	TeamID       *string     `json:"team_id"`
	Team         *Team       `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	PositionID   *string     `json:"position_id"`
	Position     *Position   `gorm:"foreignKey:PositionID" json:"position,omitempty"`
	ManagerID    *string     `json:"manager_id"`
	Manager      *Employee   `gorm:"foreignKey:ManagerID" json:"manager,omitempty"`

	// ═══ Ca làm việc ═══
	WorkScheduleID *string       `json:"work_schedule_id"`
	WorkSchedule   *WorkSchedule `gorm:"foreignKey:WorkScheduleID" json:"work_schedule,omitempty"`

	// ═══ Trạng thái ═══
	Status           string     `gorm:"size:30;default:'ACTIVE'" json:"status"` // ACTIVE, ON_LEAVE, PROBATION, SUSPENDED, TERMINATED, RESIGNED
	EmploymentType   string     `gorm:"size:30;default:'FULL_TIME'" json:"employment_type"` // FULL_TIME, PART_TIME, CONTRACTOR, INTERN
	JoinDate         *time.Time `json:"join_date"`
	ProbationEndDate *time.Time `json:"probation_end_date"`
	LeaveDate        *time.Time `json:"leave_date"`
	LeaveReason      string     `gorm:"type:text" json:"leave_reason"`

	// ═══ Học vấn ═══
	EducationLevel string `gorm:"size:50" json:"education_level"` // Tiến sĩ, Thạc sĩ, Cử nhân, Cao đẳng, Trung cấp
	University     string `gorm:"size:200" json:"university"`
	Major          string `gorm:"size:200" json:"major"`
	GraduationYear *int   `json:"graduation_year"`

	// ═══ Metadata ═══
	Version   int        `gorm:"default:1" json:"version"`
	CreatedBy *string    `json:"created_by"`
	UpdatedBy *string    `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (Employee) TableName() string {
	return "hr_employees"
}

// encryptPII encrypts sensitive fields if they aren't already encrypted
func (e *Employee) encryptPII() {
	encryptField := func(val string) string {
		if val == "" || strings.HasPrefix(val, "ENC:") {
			return val
		}
		if enc, err := utils.EncryptPII(val); err == nil {
			return "ENC:" + enc
		}
		return val
	}

	e.IdentityCard = encryptField(e.IdentityCard)
	e.VnId = encryptField(e.VnId)
	e.PassportNumber = encryptField(e.PassportNumber)
	e.TaxCode = encryptField(e.TaxCode)
	e.InsuranceBookNo = encryptField(e.InsuranceBookNo)
	e.HealthInsuranceNo = encryptField(e.HealthInsuranceNo)
	e.BankAccount = encryptField(e.BankAccount)
}

// decryptPII decrypts sensitive fields after reading from DB
func (e *Employee) decryptPII() {
	decryptField := func(val string) string {
		if !strings.HasPrefix(val, "ENC:") {
			return val
		}
		if dec, err := utils.DecryptPII(strings.TrimPrefix(val, "ENC:")); err == nil {
			return dec
		}
		return val // fallback to encrypted value if fails
	}

	e.IdentityCard = decryptField(e.IdentityCard)
	e.VnId = decryptField(e.VnId)
	e.PassportNumber = decryptField(e.PassportNumber)
	e.TaxCode = decryptField(e.TaxCode)
	e.InsuranceBookNo = decryptField(e.InsuranceBookNo)
	e.HealthInsuranceNo = decryptField(e.HealthInsuranceNo)
	e.BankAccount = decryptField(e.BankAccount)
}

// BeforeCreate hook to compute FullName and encrypt PII
func (e *Employee) BeforeCreate(tx *gorm.DB) error {
	if e.FullName == "" && e.LastName != "" && e.FirstName != "" {
		e.FullName = e.LastName + " " + e.FirstName
	}
	e.encryptPII()
	return nil
}

// BeforeUpdate hook to recompute FullName and encrypt PII
func (e *Employee) BeforeUpdate(tx *gorm.DB) error {
	if e.LastName != "" && e.FirstName != "" {
		e.FullName = e.LastName + " " + e.FirstName
	}
	e.encryptPII()
	return nil
}

// AfterFind hook to decrypt PII
func (e *Employee) AfterFind(tx *gorm.DB) error {
	e.decryptPII()
	return nil
}
