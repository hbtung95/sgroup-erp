package model

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductStatus string

const (
	ProductStatusAvailable     ProductStatus = "AVAILABLE"
	ProductStatusLocked        ProductStatus = "LOCKED"
	ProductStatusBooked        ProductStatus = "BOOKED"
	ProductStatusPendingDeposit ProductStatus = "PENDING_DEPOSIT"
	ProductStatusDeposit       ProductStatus = "DEPOSIT"
	ProductStatusSold          ProductStatus = "SOLD"
	ProductStatusCompleted     ProductStatus = "COMPLETED"
)

type Product struct {
	ID            string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProjectID     string         `gorm:"type:uuid;not null;index" json:"projectId"`
	Code          string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	Block         string         `gorm:"type:varchar(50)" json:"block"`
	Floor         int            `gorm:"type:integer" json:"floor"`
	Area          float64        `gorm:"type:decimal(10,2)" json:"area"`
	Price         float64        `gorm:"type:decimal(18,4)" json:"price"`
	Direction     string         `gorm:"type:varchar(50)" json:"direction"`
	Bedrooms      int            `gorm:"type:integer" json:"bedrooms"`
	Status        ProductStatus  `gorm:"type:varchar(30);default:'AVAILABLE'" json:"status"`
	BookedBy      *string        `gorm:"type:varchar(255)" json:"bookedBy"`
	LockedUntil   *time.Time     `json:"lockedUntil"`
	CustomerPhone *string        `gorm:"type:varchar(20)" json:"customerPhone"`
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	Project       *Project       `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		uuidV7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		p.ID = uuidV7.String()
	}
	return
}
