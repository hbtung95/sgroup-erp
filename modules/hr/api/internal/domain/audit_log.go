package domain

import (
	"time"
)

// AuditLog captures critical changes across the system for security tracing.
type AuditLog struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	TargetTable string    `gorm:"size:100;index;column:table_name" json:"table_name"`
	RecordID    string    `gorm:"type:uuid;index" json:"record_id"`
	Action      string    `gorm:"size:20;index" json:"action"` // CREATE, UPDATE, DELETE, STATUS_CHANGE
	OldValues   string    `gorm:"type:jsonb" json:"old_values"`
	NewValues   string    `gorm:"type:jsonb" json:"new_values"`
	ChangedBy   string    `gorm:"type:uuid;index" json:"changed_by"`
	IPAddress   string    `gorm:"size:45" json:"ip_address"`
	UserAgent   string    `gorm:"size:500" json:"user_agent"`
	CreatedAt   time.Time `gorm:"index" json:"created_at"`
}

// TableName overrides the table name
func (AuditLog) TableName() string {
	return "hr_audit_logs"
}
