package domain

import (
	"time"
)

// AuditLog captures critical changes across the system for security tracing
type AuditLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TargetTable string    `gorm:"size:100;index;column:table_name" json:"table_name"`
	RecordID  uint      `gorm:"index" json:"record_id"`
	Action    string    `gorm:"size:20" json:"action"` // CREATE, UPDATE, DELETE
	OldValues string    `gorm:"type:text" json:"old_values"` // JSON string representation
	NewValues string    `gorm:"type:text" json:"new_values"` // JSON string representation
	ChangedBy uint      `gorm:"index" json:"changed_by"` // Admin EmployeeID who made the change
	IPAddress string    `gorm:"size:45" json:"ip_address"`
	CreatedAt time.Time `gorm:"index" json:"created_at"`
}

// TableName overrides the table name
func (AuditLog) TableName() string {
	return "hr_audit_logs"
}
