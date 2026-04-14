package domain

import (
	"time"
)

// InsuranceConfig stores the social insurance rates and ceilings per year.
// Theo Luật BHXH Việt Nam — tỷ lệ đóng + mức trần lương đóng BH.
type InsuranceConfig struct {
	ID                 string  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Year               int     `gorm:"not null;uniqueIndex" json:"year"`
	BaseSalary         float64 `gorm:"type:decimal(18,4);not null" json:"base_salary"`          // Lương cơ sở
	CeilingMultiplier  int     `gorm:"not null;default:20" json:"ceiling_multiplier"`            // Trần = 20 × lương cơ sở

	// Tỷ lệ NV (%)
	BHXHEmpRate float64 `gorm:"type:numeric(5,2);not null;default:8.0" json:"bhxh_emp_rate"`
	BHYTEmpRate float64 `gorm:"type:numeric(5,2);not null;default:1.5" json:"bhyt_emp_rate"`
	BHTNEmpRate float64 `gorm:"type:numeric(5,2);not null;default:1.0" json:"bhtn_emp_rate"`

	// Tỷ lệ DN (%)
	BHXHCoRate float64 `gorm:"type:numeric(5,2);not null;default:17.5" json:"bhxh_co_rate"`
	BHYTCoRate float64 `gorm:"type:numeric(5,2);not null;default:3.0" json:"bhyt_co_rate"`
	BHTNCoRate float64 `gorm:"type:numeric(5,2);not null;default:1.0" json:"bhtn_co_rate"`

	// Giảm trừ thuế TNCN
	PersonalDeduction  float64 `gorm:"type:decimal(18,4);not null;default:11000000" json:"personal_deduction"`   // 11 triệu
	DependentDeduction float64 `gorm:"type:decimal(18,4);not null;default:4400000" json:"dependent_deduction"`    // 4.4 triệu/người

	EffectiveFrom time.Time  `gorm:"type:date;not null" json:"effective_from"`
	EffectiveTo   *time.Time `gorm:"type:date" json:"effective_to"`
	Notes         string     `gorm:"type:text" json:"notes"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (InsuranceConfig) TableName() string {
	return "hr_insurance_configs"
}

// InsuranceCeiling returns the max salary for insurance calculation.
func (c *InsuranceConfig) InsuranceCeiling() float64 {
	return c.BaseSalary * float64(c.CeilingMultiplier)
}

// WorkSchedule defines working hours and grace periods for a shift.
type WorkSchedule struct {
	ID            string  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name          string  `gorm:"size:100;not null" json:"name"`
	Code          string  `gorm:"size:30;uniqueIndex;not null" json:"code"`
	CheckInTime   string  `gorm:"type:time;not null;default:'08:00'" json:"check_in_time"`
	CheckOutTime  string  `gorm:"type:time;not null;default:'17:00'" json:"check_out_time"`
	BreakMinutes  int     `gorm:"not null;default:60" json:"break_minutes"`
	LateGraceMin  int     `gorm:"not null;default:15" json:"late_grace_min"`
	EarlyGraceMin int     `gorm:"not null;default:0" json:"early_grace_min"`
	WorkingHours  float64 `gorm:"type:numeric(4,2);not null;default:8.0" json:"working_hours"`
	IsDefault     bool    `gorm:"default:false" json:"is_default"`
	IsActive      bool    `gorm:"default:true" json:"is_active"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (WorkSchedule) TableName() string {
	return "hr_work_schedules"
}
