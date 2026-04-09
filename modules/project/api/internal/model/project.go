package model

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectStatus string

const (
	ProjectStatusActive ProjectStatus = "ACTIVE"
	ProjectStatusPaused ProjectStatus = "PAUSED"
	ProjectStatusClosed ProjectStatus = "CLOSED"
)

type Project struct {
	ID         string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Code       string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	Name       string         `gorm:"type:varchar(255);not null" json:"name"`
	Developer  string         `gorm:"type:varchar(255)" json:"developer"`
	Location   string         `gorm:"type:text" json:"location"`
	Type       string         `gorm:"type:varchar(50)" json:"type"`
	FeeRate    float64        `gorm:"type:decimal(5,2)" json:"feeRate"`
	AvgPrice   float64        `gorm:"type:decimal(18,4)" json:"avgPrice"`
	TotalUnits int            `gorm:"type:integer;default:0" json:"totalUnits"`
	SoldUnits  int            `gorm:"type:integer;default:0" json:"soldUnits"`
	Status     ProjectStatus  `gorm:"type:varchar(20);default:'ACTIVE'" json:"status"`
	StartDate  *time.Time     `json:"startDate"`
	EndDate    *time.Time     `json:"endDate"`
	CreatedAt  time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	Products   []Product      `gorm:"foreignKey:ProjectID" json:"products,omitempty"`
}

func (p *Project) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		uuidV7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		p.ID = uuidV7.String()
	}
	return
}
