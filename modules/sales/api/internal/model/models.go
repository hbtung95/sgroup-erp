package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SalesTeam struct {
	ID        string         `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null" json:"name"`
	ManagerID string         `gorm:"type:varchar(100);not null" json:"managerId"` // Usually from HR module
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (t *SalesTeam) BeforeCreate(tx *gorm.DB) error {
	v7, err := uuid.NewV7()
	if err != nil {
		return err
	}
	t.ID = v7.String()
	return nil
}

type Customer struct {
	ID          string         `gorm:"type:uuid;primaryKey" json:"id"`
	FullName    string         `gorm:"type:varchar(100);not null" json:"fullName"`
	Phone       string         `gorm:"type:varchar(20);not null" json:"phone"`
	Email       string         `gorm:"type:varchar(100)" json:"email"`
	IDCardNo    string         `gorm:"type:varchar(20)" json:"idCardNo"` // CCCD
	AssignedTo  string         `gorm:"type:varchar(100)" json:"assignedTo"` // Sales ID
	Status      string         `gorm:"type:varchar(50);default:'HOT'" json:"status"` // HOT, WARM, COLD, COMPLETED
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Customer) BeforeCreate(tx *gorm.DB) error {
	v7, err := uuid.NewV7()
	if err != nil {
		return err
	}
	c.ID = v7.String()
	return nil
}

type TransactionStatus string

const (
	TxStatusPendingLock   TransactionStatus = "PENDING_LOCK" // Waiting for Manager approval
	TxStatusLocked        TransactionStatus = "LOCKED"       // Approved, effectively locked
	TxStatusDeposit       TransactionStatus = "DEPOSIT"
	TxStatusSold          TransactionStatus = "SOLD"
	TxStatusCancelled     TransactionStatus = "CANCELLED"
	TxStatusRejected      TransactionStatus = "REJECTED"
)

type Transaction struct {
	ID            string            `gorm:"type:uuid;primaryKey" json:"id"`
	ProductID     string            `gorm:"type:varchar(100);not null" json:"productId"`
	CustomerID    string            `gorm:"type:uuid;not null" json:"customerId"`
	SalesStaffID  string            `gorm:"type:varchar(100);not null" json:"salesStaffId"`
	SalesTeamID   string            `gorm:"type:uuid" json:"salesTeamId"`
	Status        TransactionStatus `gorm:"type:varchar(50);not null;default:'PENDING_LOCK'" json:"status"`
	PriceAtLock   float64           `gorm:"type:decimal(15,2)" json:"priceAtLock"`
	Notes         string            `gorm:"type:text" json:"notes"`
	ApprovedBy    *string           `gorm:"type:varchar(100)" json:"approvedBy"` // Manager ID who approved
	CreatedAt     time.Time         `json:"createdAt"`
	UpdatedAt     time.Time         `json:"updatedAt"`
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	v7, err := uuid.NewV7()
	if err != nil {
		return err
	}
	t.ID = v7.String()
	return nil
}

type Commission struct {
	ID            string         `gorm:"type:uuid;primaryKey" json:"id"`
	TransactionID string         `gorm:"type:uuid;not null;index" json:"transactionId"`
	Role          string         `gorm:"type:varchar(50);not null" json:"role"` // STAFF, MANAGER, DIRECTOR
	EarnedBy      string         `gorm:"type:varchar(100);not null" json:"earnedBy"`
	Amount        float64        `gorm:"type:decimal(15,2);not null" json:"amount"`
	Percentage    float64        `gorm:"type:decimal(5,2)" json:"percentage"`
	IsPaid        bool           `gorm:"default:false" json:"isPaid"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
}

func (c *Commission) BeforeCreate(tx *gorm.DB) error {
	v7, err := uuid.NewV7()
	if err != nil {
		return err
	}
	c.ID = v7.String()
	return nil
}
