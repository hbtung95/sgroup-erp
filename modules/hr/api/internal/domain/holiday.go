package domain

import (
	"time"
)

// Holiday represents a company or national holiday.
type Holiday struct {
	ID          string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name        string     `gorm:"size:255;not null" json:"name"`
	Date        time.Time  `gorm:"type:date;not null;index;uniqueIndex:uq_date_type" json:"date"`
	EndDate     *time.Time `gorm:"type:date" json:"end_date"`
	HolidayType string    `gorm:"size:30;not null;uniqueIndex:uq_date_type" json:"holiday_type"` // NATIONAL, COMPANY, SPECIAL
	IsPaid      bool       `gorm:"default:true" json:"is_paid"`
	Year        int        `gorm:"not null;index" json:"year"`
	Description string     `gorm:"type:text" json:"description"`
	CreatedBy   *string    `json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (Holiday) TableName() string {
	return "hr_holidays"
}
