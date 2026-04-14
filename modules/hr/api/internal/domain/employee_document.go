package domain

import (
	"time"

	"gorm.io/gorm"
)

// EmployeeDocument represents a file/document associated with an employee's profile.
type EmployeeDocument struct {
	ID           string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID   string    `gorm:"index;not null" json:"employee_id"`
	Employee     *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	DocumentType string    `gorm:"size:50;not null;index" json:"document_type"` // CV, ID_CARD, DEGREE, CERTIFICATE, CONTRACT, HEALTH_CHECK, PHOTO, OTHER
	Title        string    `gorm:"size:255;not null" json:"title"`
	FileURL      string    `gorm:"size:500;not null" json:"file_url"`
	FileSize     *int64    `json:"file_size"`
	MimeType     string    `gorm:"size:100" json:"mime_type"`
	Notes        string    `gorm:"type:text" json:"notes"`
	UploadedBy   *string   `json:"uploaded_by"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (EmployeeDocument) TableName() string {
	return "hr_employee_documents"
}
