package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LegalDoc struct {
	ID        string         `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID string         `gorm:"type:uuid;not null;index" json:"projectId"`
	Name      string         `gorm:"type:varchar(255);not null" json:"name"`
	DocType   string         `gorm:"type:varchar(50);not null" json:"docType"` // e.g. 1/500, GPXD
	FileURL   string         `gorm:"type:varchar(500);not null" json:"fileUrl"`
	UploadedBy string        `gorm:"type:varchar(100);not null" json:"uploadedBy"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (d *LegalDoc) BeforeCreate(tx *gorm.DB) error {
	v7, err := uuid.NewV7()
	if err != nil {
		return err
	}
	d.ID = v7.String()
	return nil
}
