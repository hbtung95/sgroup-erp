package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
)

// ═══════════════════════════════════════════════════════════
// SERVICE INTERFACES — Business Logic Contracts
// ═══════════════════════════════════════════════════════════

// UserContext carries authenticated user information through the service layer.
type UserContext struct {
	ID        string
	Name      string
	TeamID    *string
	Role      string  // system role: admin, user
	SalesRole string  // sales-specific: sales_staff, sales_manager, sales_director, ceo
	StaffID   *string
}

// IsReviewer checks if the user has approval/review permissions.
func (u UserContext) IsReviewer() bool {
	return u.Role == "admin" ||
		u.SalesRole == "sales_director" ||
		u.SalesRole == "sales_manager" ||
		u.SalesRole == "ceo" ||
		u.SalesRole == "sales_admin"
}

// IsDirector checks if the user has director-level access.
func (u UserContext) IsDirector() bool {
	return u.Role == "admin" ||
		u.SalesRole == "sales_director" ||
		u.SalesRole == "ceo"
}

// TransactionService defines business logic for the Lock → Deposit → Sold pipeline.
type TransactionService interface {
	RequestLock(ctx context.Context, req *model.Transaction, user UserContext) (*model.Transaction, error)
	ApproveLock(ctx context.Context, txID string, user UserContext) error
	RejectLock(ctx context.Context, txID string, reason string, user UserContext) error
	MarkDeposit(ctx context.Context, txID string, user UserContext) error
	MarkSold(ctx context.Context, txID string, user UserContext) error
	CancelTransaction(ctx context.Context, txID string, reason string, user UserContext) error
	GetTransaction(ctx context.Context, id string) (*model.Transaction, error)
	ListTransactions(ctx context.Context, filter model.ListFilter, user UserContext) ([]model.Transaction, int64, error)
	GetHistory(ctx context.Context, txID string) ([]model.TransactionHistory, error)
}

// CustomerService defines business logic for CRM customer management.
type CustomerService interface {
	CreateCustomer(ctx context.Context, c *model.Customer, user UserContext) (*model.Customer, error)
	UpdateCustomer(ctx context.Context, id string, dto *model.UpdateCustomerDTO, user UserContext) error
	DeleteCustomer(ctx context.Context, id string, user UserContext) error
	GetCustomer(ctx context.Context, id string) (*model.Customer, error)
	ListCustomers(ctx context.Context, filter model.ListFilter, user UserContext) ([]model.Customer, int64, error)
}

// DealService defines business logic for deal lifecycle management.
type DealService interface {
	CreateDeal(ctx context.Context, deal *model.SalesDeal, user UserContext) error
	UpdateDeal(ctx context.Context, id string, dto *model.UpdateDealDTO, user UserContext) error
	AdvanceStage(ctx context.Context, id string, newStage model.DealStage, user UserContext) error
	CloseDeal(ctx context.Context, id string, user UserContext) error
	LoseDeal(ctx context.Context, id string, reason string, user UserContext) error
	GetDeal(ctx context.Context, id string) (*model.SalesDeal, error)
	ListDeals(ctx context.Context, filter model.ListFilter, user UserContext) ([]model.SalesDeal, int64, error)
}

// BookingService defines business logic for booking management.
type BookingService interface {
	CreateBooking(ctx context.Context, b *model.SalesBooking, user UserContext) error
	UpdateBooking(ctx context.Context, id string, updates map[string]interface{}, user UserContext) error
	ApproveBooking(ctx context.Context, id string, user UserContext) error
	RejectBooking(ctx context.Context, id string, user UserContext) error
	GetBooking(ctx context.Context, id string) (*model.SalesBooking, error)
	ListBookings(ctx context.Context, filter model.ListFilter, user UserContext) ([]model.SalesBooking, int64, error)
}

// DepositService defines business logic for deposit management.
type DepositService interface {
	CreateDeposit(ctx context.Context, d *model.SalesDeposit, user UserContext) error
	UpdateDeposit(ctx context.Context, id string, updates map[string]interface{}, user UserContext) error
	ConfirmDeposit(ctx context.Context, id string, user UserContext) error
	CancelDeposit(ctx context.Context, id string, user UserContext) error
	GetDeposit(ctx context.Context, id string) (*model.SalesDeposit, error)
	ListDeposits(ctx context.Context, filter model.ListFilter, user UserContext) ([]model.SalesDeposit, int64, error)
}

// TeamService defines business logic for team management.
type TeamService interface {
	CreateTeam(ctx context.Context, team *model.SalesTeam, user UserContext) error
	UpdateTeam(ctx context.Context, id string, updates map[string]interface{}, user UserContext) error
	DeleteTeam(ctx context.Context, id string, user UserContext) error
	GetTeam(ctx context.Context, id string) (*model.SalesTeam, error)
	ListTeams(ctx context.Context, filter model.ListFilter) ([]model.SalesTeam, int64, error)
}

// StaffService defines business logic for staff management.
type StaffService interface {
	CreateStaff(ctx context.Context, staff *model.SalesStaff, user UserContext) error
	UpdateStaff(ctx context.Context, id string, updates map[string]interface{}, user UserContext) error
	DeleteStaff(ctx context.Context, id string, user UserContext) error
	GetStaff(ctx context.Context, id string) (*model.SalesStaff, error)
	ListStaff(ctx context.Context, filter model.ListFilter) ([]model.SalesStaff, int64, error)
	AssignToTeam(ctx context.Context, staffID, teamID string, user UserContext) error
}

// DashboardService defines business logic for the KPI dashboard.
type DashboardService interface {
	GetKPIs(ctx context.Context, user UserContext) (*model.DashboardKPIResponse, error)
	GetMonthlyRevenue(ctx context.Context, year int, user UserContext) ([]model.MonthlyRevenueData, error)
	GetRecentTransactions(ctx context.Context, limit int, user UserContext) ([]model.Transaction, error)
}

// CommissionService defines business logic for commission calculation and management.
type CommissionService interface {
	CalculateCommissions(ctx context.Context, txID string, dealValue float64, projectID *string) ([]model.Commission, error)
	GetCommissionsByTransaction(ctx context.Context, txID string) ([]model.Commission, error)
	GetMyCommissions(ctx context.Context, user UserContext, page, limit int) ([]model.Commission, int64, error)
	GetRules(ctx context.Context) ([]model.CommissionRule, error)
	UpdateRule(ctx context.Context, id string, updates map[string]interface{}, user UserContext) error
}

// ReportService defines business logic for analytics and reporting.
type ReportService interface {
	GetPlanVsActual(ctx context.Context, year, month int, teamID string) (interface{}, error)
	GetTeamPerformance(ctx context.Context, year, month int) (interface{}, error)
	GetStaffRanking(ctx context.Context, year, month int, teamID string) (interface{}, error)
	GetProjectPerformance(ctx context.Context, year int) (interface{}, error)
}

// EventBus defines the interface for the internal event system.
type EventBus interface {
	Subscribe(eventType string, handler func(data interface{}))
	Publish(eventType string, data interface{})
}
