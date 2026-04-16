package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ═══════════════════════════════════════════════════════════
// CORE MODELS — Sales Module
// ═══════════════════════════════════════════════════════════

// SalesTeam represents a sales team/division within the organization.
type SalesTeam struct {
	ID          string         `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null;uniqueIndex" json:"name"`
	Code        string         `gorm:"type:varchar(20);uniqueIndex" json:"code"`
	ManagerID   string         `gorm:"type:varchar(100);not null;index" json:"managerId"`
	ManagerName string         `gorm:"type:varchar(100)" json:"managerName"`
	ParentID    *string        `gorm:"type:uuid;index" json:"parentId"`
	Status      string         `gorm:"type:varchar(20);default:'ACTIVE';index" json:"status"` // ACTIVE, INACTIVE
	SortOrder   int            `gorm:"default:0" json:"sortOrder"`
	Version     int            `gorm:"default:1" json:"version"` // Optimistic locking
	CreatedBy   string         `gorm:"type:varchar(100)" json:"createdBy"`
	UpdatedBy   string         `gorm:"type:varchar(100)" json:"updatedBy"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Associations
	Members []SalesStaff `gorm:"foreignKey:TeamID" json:"members,omitempty"`
}

func (t *SalesTeam) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		t.ID = v7.String()
	}
	return nil
}

// CustomerSource represents how a customer was acquired.
type CustomerSource string

const (
	SourceMarketing  CustomerSource = "MARKETING"
	SourceSelfGen    CustomerSource = "SELF_GEN"
	SourceReferral   CustomerSource = "REFERRAL"
	SourceWalkIn     CustomerSource = "WALK_IN"
	SourceBizflyCRM  CustomerSource = "BIZFLY_CRM"
	SourceOther      CustomerSource = "OTHER"
)

// CustomerStatus represents the lead temperature/status.
type CustomerStatus string

const (
	CustStatusHot       CustomerStatus = "HOT"
	CustStatusWarm      CustomerStatus = "WARM"
	CustStatusCold      CustomerStatus = "COLD"
	CustStatusCompleted CustomerStatus = "COMPLETED"
	CustStatusLost      CustomerStatus = "LOST"
)

// Customer represents a sales lead/customer in the CRM pipeline.
type Customer struct {
	ID              string         `gorm:"type:uuid;primaryKey" json:"id"`
	FullName        string         `gorm:"type:varchar(100);not null;index" json:"fullName" binding:"required,min=2,max=100"`
	Phone           string         `gorm:"type:varchar(20);not null;index" json:"phone" binding:"required"`
	Email           string         `gorm:"type:varchar(100);index" json:"email" binding:"omitempty,email"`
	IDCardNo        string         `gorm:"type:varchar(20)" json:"idCardNo"`
	Address         string         `gorm:"type:varchar(500)" json:"address"`
	Source          CustomerSource `gorm:"type:varchar(30);default:'OTHER';index" json:"source"`
	AssignedTo      string         `gorm:"type:varchar(100);index" json:"assignedTo"`
	AssignedToName  string         `gorm:"type:varchar(100)" json:"assignedToName"`
	TeamID          *string        `gorm:"type:uuid;index" json:"teamId"`
	Status          CustomerStatus `gorm:"type:varchar(50);default:'HOT';index" json:"status"`
	Notes           string         `gorm:"type:text" json:"notes"`
	LastInteraction string         `gorm:"type:varchar(500)" json:"lastInteraction"`
	LastContactAt   *time.Time     `json:"lastContactAt"`
	BizflyCrmID     *string        `gorm:"type:varchar(100);index" json:"bizflyCrmId"` // External CRM reference
	Version         int            `gorm:"default:1" json:"version"`
	CreatedBy       string         `gorm:"type:varchar(100)" json:"createdBy"`
	UpdatedBy       string         `gorm:"type:varchar(100)" json:"updatedBy"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Customer) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		c.ID = v7.String()
	}
	return nil
}

// TransactionStatus represents the lifecycle stage of a real estate transaction.
type TransactionStatus string

const (
	TxStatusPendingLock TransactionStatus = "PENDING_LOCK"
	TxStatusLocked      TransactionStatus = "LOCKED"
	TxStatusDeposit     TransactionStatus = "DEPOSIT"
	TxStatusSold        TransactionStatus = "SOLD"
	TxStatusCancelled   TransactionStatus = "CANCELLED"
	TxStatusRejected    TransactionStatus = "REJECTED"
)

// Transaction represents a real estate sales transaction (Lock → Deposit → Sold).
type Transaction struct {
	ID           string            `gorm:"type:uuid;primaryKey" json:"id"`
	ProductID    string            `gorm:"type:varchar(100);not null;index" json:"productId" binding:"required"`
	ProductCode  string            `gorm:"type:varchar(50)" json:"productCode"`
	ProjectID    *string           `gorm:"type:uuid;index" json:"projectId"`
	ProjectName  string            `gorm:"type:varchar(200)" json:"projectName"`
	CustomerID   string            `gorm:"type:uuid;not null;index" json:"customerId" binding:"required"`
	SalesStaffID string            `gorm:"type:varchar(100);not null;index" json:"salesStaffId"`
	SalesTeamID  string            `gorm:"type:uuid;index" json:"salesTeamId"`
	Status       TransactionStatus `gorm:"type:varchar(50);not null;default:'PENDING_LOCK';index" json:"status"`
	PriceAtLock  float64           `gorm:"type:decimal(15,2)" json:"priceAtLock"`
	Notes        string            `gorm:"type:text" json:"notes"`
	ApprovedBy   *string           `gorm:"type:varchar(100)" json:"approvedBy"`
	ApprovedAt   *time.Time        `json:"approvedAt"`
	LockedAt     *time.Time        `json:"lockedAt"`
	DepositAt    *time.Time        `json:"depositAt"`
	SoldAt       *time.Time        `json:"soldAt"`
	CancelledAt  *time.Time        `json:"cancelledAt"`
	CancelReason string            `gorm:"type:text" json:"cancelReason"`
	Version      int               `gorm:"default:1" json:"version"`
	CreatedBy    string            `gorm:"type:varchar(100)" json:"createdBy"`
	UpdatedBy    string            `gorm:"type:varchar(100)" json:"updatedBy"`
	CreatedAt    time.Time         `json:"createdAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`

	// Associations
	Customer *Customer  `gorm:"foreignKey:CustomerID;constraint:OnUpdate:CASCADE" json:"customer,omitempty"`
	Team     *SalesTeam `gorm:"foreignKey:SalesTeamID;constraint:OnUpdate:CASCADE" json:"team,omitempty"`
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		t.ID = v7.String()
	}
	return nil
}

// CommissionRole defines who earns the commission.
type CommissionRole string

const (
	CommRoleStaff    CommissionRole = "STAFF"
	CommRoleManager  CommissionRole = "MANAGER"
	CommRoleDirector CommissionRole = "DIRECTOR"
)

// Commission represents a single commission payout for a transaction.
type Commission struct {
	ID            string         `gorm:"type:uuid;primaryKey" json:"id"`
	TransactionID string         `gorm:"type:uuid;not null;index" json:"transactionId"`
	DealID        *string        `gorm:"type:uuid;index" json:"dealId"`
	Role          CommissionRole `gorm:"type:varchar(50);not null" json:"role"`
	EarnedBy      string         `gorm:"type:varchar(100);not null;index" json:"earnedBy"`
	EarnedByName  string         `gorm:"type:varchar(100)" json:"earnedByName"`
	Amount        float64        `gorm:"type:decimal(15,2);not null" json:"amount"`
	Percentage    float64        `gorm:"type:decimal(5,2)" json:"percentage"`
	IsPaid        bool           `gorm:"default:false;index" json:"isPaid"`
	PaidAt        *time.Time     `json:"paidAt"`
	PaymentRef    string         `gorm:"type:varchar(100)" json:"paymentRef"`
	CreatedBy     string         `gorm:"type:varchar(100)" json:"createdBy"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`

	// Associations
	Transaction *Transaction `gorm:"foreignKey:TransactionID;constraint:OnUpdate:CASCADE" json:"transaction,omitempty"`
}

func (c *Commission) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		c.ID = v7.String()
	}
	return nil
}

// CommissionRule defines configurable commission rates per role and project.
type CommissionRule struct {
	ID         string  `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID  *string `gorm:"type:uuid;index" json:"projectId"` // NULL = global default
	Role       string  `gorm:"type:varchar(50);not null" json:"role"`
	Percentage float64 `gorm:"type:decimal(5,2);not null" json:"percentage"`
	MinDeal    float64 `gorm:"type:decimal(15,2);default:0" json:"minDeal"` // Min deal value for this tier
	MaxDeal    float64 `gorm:"type:decimal(15,2);default:0" json:"maxDeal"` // Max deal value (0 = unlimited)
	IsActive   bool    `gorm:"default:true" json:"isActive"`
	CreatedBy  string  `gorm:"type:varchar(100)" json:"createdBy"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func (r *CommissionRule) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		r.ID = v7.String()
	}
	return nil
}

// TransactionHistory records state changes for audit trail.
type TransactionHistory struct {
	ID            string `gorm:"type:uuid;primaryKey" json:"id"`
	TransactionID string `gorm:"type:uuid;not null;index" json:"transactionId"`
	FromStatus    string `gorm:"type:varchar(50)" json:"fromStatus"`
	ToStatus      string `gorm:"type:varchar(50);not null" json:"toStatus"`
	ChangedBy     string `gorm:"type:varchar(100);not null" json:"changedBy"`
	ChangedByName string `gorm:"type:varchar(100)" json:"changedByName"`
	Reason        string `gorm:"type:text" json:"reason"`
	CreatedAt     time.Time `json:"createdAt"`
}

func (h *TransactionHistory) BeforeCreate(tx *gorm.DB) error {
	if h.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		h.ID = v7.String()
	}
	return nil
}
