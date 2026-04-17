package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ═══════════════════════════════════════════════════════════
// SALES OPS MODELS — Staff, Projects, Deals, Bookings, Deposits, Targets
// ═══════════════════════════════════════════════════════════

// SalesStaff represents a sales employee profile linked to the HR module.
type SalesStaff struct {
	ID             string     `gorm:"type:uuid;primaryKey" json:"id"`
	HREmployeeID   *string    `gorm:"type:varchar(100);index" json:"hrEmployeeId"`
	EmployeeCode   string     `gorm:"type:varchar(50);uniqueIndex" json:"employeeCode" binding:"required"`
	FullName       string     `gorm:"type:varchar(100);not null" json:"fullName" binding:"required"`
	Phone          string     `gorm:"type:varchar(20)" json:"phone"`
	Email          string     `gorm:"type:varchar(100)" json:"email"`
	Role           string     `gorm:"type:varchar(50);index" json:"role"` // sales, senior_sales, sales_manager, sales_director
	Status         string     `gorm:"type:varchar(20);default:'ACTIVE';index" json:"status"`
	LeadsCapacity  int        `gorm:"default:30" json:"leadsCapacity"`
	PersonalTarget float64    `gorm:"type:decimal(15,2);default:0" json:"personalTarget"`
	TeamID         *string    `gorm:"type:uuid;index" json:"teamId"`
	Team           *SalesTeam `gorm:"foreignKey:TeamID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"team,omitempty"`
	JoinDate       *time.Time `json:"joinDate"`
	Version        int        `gorm:"default:1" json:"version"`
	CreatedBy      string     `gorm:"type:varchar(100)" json:"createdBy"`
	UpdatedBy      string     `gorm:"type:varchar(100)" json:"updatedBy"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *SalesStaff) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		s.ID = v7.String()
	}
	return nil
}

// DimProject is a dimension table for real estate projects being sold.
type DimProject struct {
	ID         string  `gorm:"type:uuid;primaryKey" json:"id"`
	Name       string  `gorm:"type:varchar(200);not null;index" json:"name" binding:"required"`
	Code       string  `gorm:"type:varchar(50);uniqueIndex" json:"code"`
	Developer  string  `gorm:"type:varchar(200)" json:"developer"`
	Location   string  `gorm:"type:varchar(255)" json:"location"`
	Type       string  `gorm:"type:varchar(50);index" json:"type"` // APARTMENT, VILLA, TOWNHOUSE, LAND, COMMERCIAL
	FeeRate    float64 `gorm:"type:decimal(5,2)" json:"feeRate"`
	AvgPrice   float64 `gorm:"type:decimal(15,2)" json:"avgPrice"`
	TotalUnits int     `gorm:"default:0" json:"totalUnits"`
	SoldUnits  int     `gorm:"default:0" json:"soldUnits"`
	Status     string  `gorm:"type:varchar(20);default:'ACTIVE';index" json:"status"` // ACTIVE, COMPLETED, PAUSED
	StartDate  *time.Time `json:"startDate"`
	EndDate    *time.Time `json:"endDate"`
	CreatedBy  string  `gorm:"type:varchar(100)" json:"createdBy"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func (p *DimProject) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		p.ID = v7.String()
	}
	return nil
}

// DealStage represents the lifecycle stage of a sales deal.
type DealStage string

const (
	DealStageProspecting DealStage = "PROSPECTING"
	DealStageQualified   DealStage = "QUALIFIED"
	DealStageBooking     DealStage = "BOOKING"
	DealStageDeposit     DealStage = "DEPOSIT"
	DealStageContract    DealStage = "CONTRACT"
	DealStageClosed      DealStage = "CLOSED"
	DealStageLost        DealStage = "LOST"
)

// SalesDeal tracks a complete sales deal from prospect to close.
type SalesDeal struct {
	ID            string    `gorm:"type:uuid;primaryKey" json:"id"`
	DealCode      string    `gorm:"type:varchar(50);uniqueIndex" json:"dealCode"`
	ProjectID     *string   `gorm:"type:uuid;index" json:"projectId"`
	ProjectName   string    `gorm:"type:varchar(200)" json:"projectName"`
	StaffID       *string   `gorm:"type:uuid;index" json:"staffId"`
	StaffName     string    `gorm:"type:varchar(100)" json:"staffName"`
	TeamID        *string   `gorm:"type:uuid;index" json:"teamId"`
	TeamName      string    `gorm:"type:varchar(100)" json:"teamName"`
	CustomerID    *string   `gorm:"type:uuid;index" json:"customerId"`
	CustomerName  string    `gorm:"type:varchar(100)" json:"customerName"`
	CustomerPhone string    `gorm:"type:varchar(20)" json:"customerPhone"`
	ProductCode   string    `gorm:"type:varchar(50);index" json:"productCode"`
	ProductType   string    `gorm:"type:varchar(50)" json:"productType"`
	DealValue     float64   `gorm:"type:decimal(15,2)" json:"dealValue"`
	FeeRate       float64   `gorm:"type:decimal(5,2)" json:"feeRate"`
	Commission    float64   `gorm:"type:decimal(15,2)" json:"commission"`
	Source        string    `gorm:"type:varchar(50);index" json:"source"`
	Year          int       `gorm:"index" json:"year"`
	Month         int       `gorm:"index" json:"month"`
	Stage         DealStage `gorm:"type:varchar(50);default:'PROSPECTING';index" json:"stage"`
	Priority      string    `gorm:"type:varchar(20);default:'MEDIUM'" json:"priority"` // HIGH, MEDIUM, LOW
	ExpectedClose *time.Time `json:"expectedClose"`
	ClosedAt      *time.Time `json:"closedAt"`
	LostReason    string    `gorm:"type:text" json:"lostReason"`
	Note          string    `gorm:"type:text" json:"note"`
	Version       int       `gorm:"default:1" json:"version"`
	CreatedBy     string    `gorm:"type:varchar(100)" json:"createdBy"`
	UpdatedBy     string    `gorm:"type:varchar(100)" json:"updatedBy"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Associations
	Customer *Customer   `gorm:"foreignKey:CustomerID;constraint:OnUpdate:CASCADE" json:"customer,omitempty"`
	Staff    *SalesStaff `gorm:"foreignKey:StaffID;constraint:OnUpdate:CASCADE" json:"staff,omitempty"`
	Project  *DimProject `gorm:"foreignKey:ProjectID;constraint:OnUpdate:CASCADE" json:"project,omitempty"`
}

func (d *SalesDeal) BeforeCreate(tx *gorm.DB) error {
	if d.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		d.ID = v7.String()
	}
	return nil
}

// SalesBooking records a customer reservation/hold on a property unit.
type SalesBooking struct {
	ID               string         `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID        string         `gorm:"type:uuid;index" json:"projectId"`
	ProjectName      string         `gorm:"type:varchar(200)" json:"projectName"`
	UnitCode         string         `gorm:"type:varchar(50)" json:"unitCode"`
	CustomerID       *string        `gorm:"type:uuid;index" json:"customerId"`
	CustomerName     string         `gorm:"type:varchar(100)" json:"customerName"`
	CustomerPhone    string         `gorm:"type:varchar(20)" json:"customerPhone"`
	BookingAmount    float64        `gorm:"type:decimal(15,2)" json:"bookingAmount"`
	BookingCount     int            `gorm:"default:1" json:"bookingCount"`
	StaffID          *string        `gorm:"type:uuid;index" json:"staffId"`
	StaffName        *string        `gorm:"type:varchar(100)" json:"staffName"`
	TeamID           *string        `gorm:"type:uuid;index" json:"teamId"`
	TeamName         *string        `gorm:"type:varchar(100)" json:"teamName"`
	Status           string         `gorm:"type:varchar(50);default:'PENDING';index" json:"status"` // PENDING, APPROVED, REJECTED, CANCELLED
	BookingDate      time.Time      `json:"bookingDate"`
	ExpiresAt        *time.Time     `json:"expiresAt"`
	Note             *string        `gorm:"type:text" json:"note"`
	CreatedByUserID  *string        `gorm:"type:varchar(100)" json:"createdByUserId"`
	CreatedByName    *string        `gorm:"type:varchar(100)" json:"createdByName"`
	ReviewedByUserID *string        `gorm:"type:varchar(100)" json:"reviewedByUserId"`
	ReviewedByName   *string        `gorm:"type:varchar(100)" json:"reviewedByName"`
	ReviewedAt       *time.Time     `json:"reviewedAt"`
	Year             int            `gorm:"index" json:"year"`
	Month            int            `gorm:"index" json:"month"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
}

func (b *SalesBooking) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		b.ID = v7.String()
	}
	return nil
}

// SalesDeposit records a customer deposit payment on a property unit.
type SalesDeposit struct {
	ID               string         `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID        string         `gorm:"type:uuid;index" json:"projectId"`
	ProjectName      string         `gorm:"type:varchar(200)" json:"projectName"`
	UnitCode         string         `gorm:"type:varchar(50)" json:"unitCode"`
	CustomerID       *string        `gorm:"type:uuid;index" json:"customerId"`
	CustomerName     string         `gorm:"type:varchar(100)" json:"customerName"`
	CustomerPhone    string         `gorm:"type:varchar(20)" json:"customerPhone"`
	DepositAmount    float64        `gorm:"type:decimal(15,2)" json:"depositAmount"`
	StaffID          *string        `gorm:"type:uuid;index" json:"staffId"`
	StaffName        *string        `gorm:"type:varchar(100)" json:"staffName"`
	TeamID           *string        `gorm:"type:uuid;index" json:"teamId"`
	TeamName         *string        `gorm:"type:varchar(100)" json:"teamName"`
	PaymentMethod    *string        `gorm:"type:varchar(50)" json:"paymentMethod"` // CASH, BANK_TRANSFER, CHECK
	ReceiptNo        *string        `gorm:"type:varchar(50)" json:"receiptNo"`
	Notes            *string        `gorm:"type:text" json:"notes"`
	Status           string         `gorm:"type:varchar(50);default:'PENDING';index" json:"status"` // PENDING, CONFIRMED, CANCELLED, REFUNDED
	DepositDate      time.Time      `json:"depositDate"`
	ConfirmedAt      *time.Time     `json:"confirmedAt"`
	CreatedByUserID  *string        `gorm:"type:varchar(100)" json:"createdByUserId"`
	CreatedByName    *string        `gorm:"type:varchar(100)" json:"createdByName"`
	ReviewedByUserID *string        `gorm:"type:varchar(100)" json:"reviewedByUserId"`
	ReviewedByName   *string        `gorm:"type:varchar(100)" json:"reviewedByName"`
	ReviewedAt       *time.Time     `json:"reviewedAt"`
	Year             int            `gorm:"index" json:"year"`
	Month            int            `gorm:"index" json:"month"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
}

func (d *SalesDeposit) BeforeCreate(tx *gorm.DB) error {
	if d.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		d.ID = v7.String()
	}
	return nil
}

// SalesTarget defines monthly KPI targets for teams and individuals.
type SalesTarget struct {
	ID             string    `gorm:"type:uuid;primaryKey" json:"id"`
	Year           int       `gorm:"index;not null" json:"year"`
	Month          int       `gorm:"index;not null" json:"month"`
	TeamID         string    `gorm:"type:uuid;index" json:"teamId"`
	StaffID        string    `gorm:"type:uuid;index" json:"staffId"`
	ScenarioKey    string    `gorm:"type:varchar(50);default:'BASE'" json:"scenarioKey"` // BASE, OPTIMISTIC, PESSIMISTIC
	TargetGMV      float64   `gorm:"type:decimal(15,2)" json:"targetGMV"`
	TargetRevenue  float64   `gorm:"type:decimal(15,2)" json:"targetRevenue"`
	TargetPoints   int       `gorm:"default:0" json:"targetPoints"`
	TargetDeals    int       `json:"targetDeals"`
	TargetLeads    int       `json:"targetLeads"`
	TargetMeetings int       `json:"targetMeetings"`
	TargetBookings int       `json:"targetBookings"`
	CreatedBy      string    `gorm:"type:varchar(100)" json:"createdBy"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

func (t *SalesTarget) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		t.ID = v7.String()
	}
	return nil
}

// SalesActivity records daily actions/interactions by staff to track performance points.
type SalesActivity struct {
	ID           string    `gorm:"type:uuid;primaryKey" json:"id"`
	StaffID      string    `gorm:"type:uuid;not null;index" json:"staffId"`
	StaffName    string    `gorm:"type:varchar(100)" json:"staffName"`
	TeamID       *string   `gorm:"type:uuid;index" json:"teamId"`
	PostsCount   int       `gorm:"default:0" json:"postsCount"`
	CallsCount   int       `gorm:"default:0" json:"callsCount"`
	NewLeads     int       `gorm:"default:0" json:"newLeads"`
	MeetingsMade int       `gorm:"default:0" json:"meetingsMade"`
	SiteVisits   int       `gorm:"default:0" json:"siteVisits"`
	Points       int       `gorm:"default:0" json:"points"`
	ActivityDate time.Time `gorm:"type:date;not null;index" json:"activityDate"`
	Note         string    `gorm:"type:text" json:"note"`
	Year         int       `gorm:"index" json:"year"`
	Month        int       `gorm:"index" json:"month"`
	CreatedBy    string    `gorm:"type:varchar(100)" json:"createdBy"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	Staff *SalesStaff `gorm:"foreignKey:StaffID;constraint:OnUpdate:CASCADE" json:"staff,omitempty"`
}

func (s *SalesActivity) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		s.ID = v7.String()
	}
	return nil
}

// ═══════════════════════════════════════════════════════════
// FACT TABLES — For analytics and reporting
// ═══════════════════════════════════════════════════════════

// FactSalesDaily aggregates daily sales metrics (synced from CRM).
type FactSalesDaily struct {
	ID           string    `gorm:"type:uuid;primaryKey" json:"id"`
	Date         time.Time `gorm:"type:date;not null;index" json:"date"`
	Year         int       `gorm:"index" json:"year"`
	Month        int       `gorm:"index" json:"month"`
	TeamID       *string   `gorm:"type:uuid;index" json:"teamId"`
	StaffID      *string   `gorm:"type:uuid;index" json:"staffId"`
	NewLeads     int       `json:"newLeads"`
	Meetings     int       `json:"meetings"`
	Bookings     int       `json:"bookings"`
	Deposits     int       `json:"deposits"`
	DealsWon     int       `json:"dealsWon"`
	DealsLost    int       `json:"dealsLost"`
	GMV          float64   `gorm:"type:decimal(15,2)" json:"gmv"`
	Revenue      float64   `gorm:"type:decimal(15,2)" json:"revenue"`
	Source       string    `gorm:"type:varchar(50)" json:"source"` // MANUAL, BIZFLY_SYNC, SYSTEM
	CreatedAt    time.Time `json:"createdAt"`
}

func (f *FactSalesDaily) BeforeCreate(tx *gorm.DB) error {
	if f.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		f.ID = v7.String()
	}
	return nil
}

// FactPipelineSnapshot captures the CRM funnel state at a point in time.
type FactPipelineSnapshot struct {
	ID              string    `gorm:"type:uuid;primaryKey" json:"id"`
	SnapshotDate    time.Time `gorm:"type:date;not null;index" json:"snapshotDate"`
	Year            int       `gorm:"index" json:"year"`
	Month           int       `gorm:"index" json:"month"`
	TeamID          *string   `gorm:"type:uuid;index" json:"teamId"`
	TotalLeads      int       `json:"totalLeads"`
	Contacted       int       `json:"contacted"`
	Meeting         int       `json:"meeting"`
	Booking         int       `json:"booking"`
	Deposit         int       `json:"deposit"`
	Contract        int       `json:"contract"`
	Closed          int       `json:"closed"`
	Lost            int       `json:"lost"`
	PipelineValue   float64   `gorm:"type:decimal(15,2)" json:"pipelineValue"`
	Source          string    `gorm:"type:varchar(50)" json:"source"`
	CreatedAt       time.Time `json:"createdAt"`
}

func (f *FactPipelineSnapshot) BeforeCreate(tx *gorm.DB) error {
	if f.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil { return err }
		f.ID = v7.String()
	}
	return nil
}

// ═══════════════════════════════════════════════════════════
// DTOs — Request/Response types for API
// ═══════════════════════════════════════════════════════════

// UpdateCustomerDTO is a typed update request for customers.
type UpdateCustomerDTO struct {
	FullName        *string         `json:"fullName,omitempty"`
	Phone           *string         `json:"phone,omitempty"`
	Email           *string         `json:"email,omitempty"`
	IDCardNo        *string         `json:"idCardNo,omitempty"`
	Address         *string         `json:"address,omitempty"`
	Source          *CustomerSource `json:"source,omitempty"`
	Status          *CustomerStatus `json:"status,omitempty"`
	AssignedTo      *string         `json:"assignedTo,omitempty"`
	Notes           *string         `json:"notes,omitempty"`
	LastInteraction *string         `json:"lastInteraction,omitempty"`
}

// UpdateDealDTO is a typed update request for deals.
type UpdateDealDTO struct {
	Stage         *DealStage `json:"stage,omitempty"`
	Priority      *string    `json:"priority,omitempty"`
	DealValue     *float64   `json:"dealValue,omitempty"`
	FeeRate       *float64   `json:"feeRate,omitempty"`
	Note          *string    `json:"note,omitempty"`
	ExpectedClose *time.Time `json:"expectedClose,omitempty"`
	LostReason    *string    `json:"lostReason,omitempty"`
}

// DashboardKPIResponse is the structured response for the KPI dashboard.
type DashboardKPIResponse struct {
	TotalLeads          int64   `json:"totalLeads"`
	TotalDeals          int64   `json:"totalDeals"`
	ClosedDeals         int64   `json:"closedDeals"`
	PendingApprovals    int64   `json:"pendingApprovals"`
	Revenue             float64 `json:"revenue"`
	PipelineValue       float64 `json:"pipelineValue"`
	ConversionRate      float64 `json:"conversionRate"`
	AvgDealSize         float64 `json:"avgDealSize"`
	ActiveStaff         int64   `json:"activeStaff"`
	TeamCount           int64   `json:"teamCount"`
	TotalActivityPoints float64 `json:"totalActivityPoints"`
	PointsKPI           float64 `json:"pointsKPI"`
	RevenueKPI          float64 `json:"revenueKPI"`
}

// MonthlyRevenueData for charts.
type MonthlyRevenueData struct {
	Year    int     `json:"year"`
	Month   int     `json:"month"`
	Label   string  `json:"label"`
	GMV     float64 `json:"gmv"`
	Revenue float64 `json:"revenue"`
	Deals   int     `json:"deals"`
}

// PaginationMeta for list endpoints.
type PaginationMeta struct {
	Total   int64 `json:"total"`
	Page    int   `json:"page"`
	Limit   int   `json:"limit"`
	Pages   int   `json:"pages"`
}

// ListFilter for querying with search, status, date range.
type ListFilter struct {
	Search    string `form:"search"`
	Status    string `form:"status"`
	TeamID    string `form:"teamId"`
	StaffID   string `form:"staffId"`
	ProjectID string `form:"projectId"`
	DateFrom  string `form:"dateFrom"`
	DateTo    string `form:"dateTo"`
	SortBy    string `form:"sortBy"`
	SortDir   string `form:"sortDir"`
	Page      int    `form:"page,default=1"`
	Limit     int    `form:"limit,default=20"`
}
