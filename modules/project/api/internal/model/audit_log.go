package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuditLog struct {
	ID         string         `gorm:"type:uuid;primaryKey" json:"id"`
	UserID     string         `gorm:"type:varchar(100);not null" json:"userId"`
	Action     string         `gorm:"type:varchar(50);not null" json:"action"`
	EntityType string         `gorm:"type:varchar(50);not null" json:"entityType"`
	EntityID   string         `gorm:"type:varchar(100);not null;index" json:"entityId"`
	Details    string         `gorm:"type:text" json:"details"`
	CreatedAt  time.Time      `json:"createdAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (a *AuditLog) BeforeCreate(tx *gorm.DB) error {
	v7, err := uuid.NewV7()
	if err != nil {
		return err
	}
	a.ID = v7.String()
	return nil
}
