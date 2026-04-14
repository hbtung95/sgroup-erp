package domain

import (
	"time"
)

// TransferHistory records organizational movements of an employee.
type TransferHistory struct {
	ID               string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	EmployeeID       string    `gorm:"index;not null" json:"employee_id"`
	Employee         *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	FromDepartmentID *string   `json:"from_department_id"`
	FromTeamID       *string   `json:"from_team_id"`
	FromPositionID   *string   `json:"from_position_id"`
	ToDepartmentID   *string   `json:"to_department_id"`
	ToTeamID         *string   `json:"to_team_id"`
	ToPositionID     *string   `json:"to_position_id"`
	TransferType     string    `gorm:"size:30;not null" json:"transfer_type"` // PROMOTION, LATERAL, DEMOTION, RESTRUCTURE
	EffectiveDate    time.Time `gorm:"type:date;not null;index" json:"effective_date"`
	Reason           string    `gorm:"type:text" json:"reason"`
	DecisionNumber   string    `gorm:"size:100" json:"decision_number"` // Số quyết định
	ApprovedBy       *string   `json:"approved_by"`
	CreatedAt        time.Time `json:"created_at"`
}

func (TransferHistory) TableName() string {
	return "hr_transfer_history"
}
