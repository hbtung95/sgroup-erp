package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
)

// ═══════════════════════════════════════════════════════════
// REPOSITORY INTERFACES — Clean Architecture Contracts
// ═══════════════════════════════════════════════════════════

// TransactionRepository defines persistence operations for transactions.
type TransactionRepository interface {
	Create(ctx context.Context, tx *model.Transaction) error
	GetByID(ctx context.Context, id string) (*model.Transaction, error)
	UpdateStatus(ctx context.Context, id string, status model.TransactionStatus, approvedBy *string) error
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	FindBySalesStaff(ctx context.Context, staffID string, page, limit int) ([]model.Transaction, int64, error)
	FindByTeam(ctx context.Context, teamID string, page, limit int) ([]model.Transaction, int64, error)
	FindByFilter(ctx context.Context, filter model.ListFilter) ([]model.Transaction, int64, error)
	CountByStatus(ctx context.Context, status model.TransactionStatus) (int64, error)
	GetPipelineValue(ctx context.Context) (float64, error)
}

// CustomerRepository defines persistence operations for customers.
type CustomerRepository interface {
	Create(ctx context.Context, c *model.Customer) error
	GetByID(ctx context.Context, id string) (*model.Customer, error)
	Update(ctx context.Context, id string, dto *model.UpdateCustomerDTO, updatedBy string) error
	Delete(ctx context.Context, id string) error
	FindByAssignedTo(ctx context.Context, staffID string, page, limit int) ([]model.Customer, int64, error)
	FindByFilter(ctx context.Context, filter model.ListFilter) ([]model.Customer, int64, error)
	Count(ctx context.Context) (int64, error)
	CountByStatus(ctx context.Context, status model.CustomerStatus) (int64, error)
}

// CommissionRepository defines persistence operations for commissions.
type CommissionRepository interface {
	Create(ctx context.Context, c *model.Commission) error
	CreateBatch(ctx context.Context, commissions []model.Commission) error
	FindByTransaction(ctx context.Context, txID string) ([]model.Commission, error)
	FindByEarnedBy(ctx context.Context, staffID string, page, limit int) ([]model.Commission, int64, error)
	GetTotalUnpaid(ctx context.Context, staffID string) (float64, error)
}

// CommissionRuleRepository defines persistence operations for commission rules.
type CommissionRuleRepository interface {
	FindByProjectAndRole(ctx context.Context, projectID *string, role string) (*model.CommissionRule, error)
	FindDefaults(ctx context.Context) ([]model.CommissionRule, error)
	Create(ctx context.Context, rule *model.CommissionRule) error
	Update(ctx context.Context, id string, updates map[string]interface{}) error
}

// DealRepository defines persistence operations for deals.
type DealRepository interface {
	Create(ctx context.Context, deal *model.SalesDeal) error
	GetByID(ctx context.Context, id string) (*model.SalesDeal, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	FindByFilter(ctx context.Context, filter model.ListFilter) ([]model.SalesDeal, int64, error)
	CountByStage(ctx context.Context, stage model.DealStage) (int64, error)
}

// BookingRepository defines persistence operations for bookings.
type BookingRepository interface {
	Create(ctx context.Context, b *model.SalesBooking) error
	GetByID(ctx context.Context, id string) (*model.SalesBooking, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	FindByFilter(ctx context.Context, filter model.ListFilter) ([]model.SalesBooking, int64, error)
	CountByStatus(ctx context.Context, status string) (int64, error)
}

// DepositRepository defines persistence operations for deposits.
type DepositRepository interface {
	Create(ctx context.Context, d *model.SalesDeposit) error
	GetByID(ctx context.Context, id string) (*model.SalesDeposit, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	FindByFilter(ctx context.Context, filter model.ListFilter) ([]model.SalesDeposit, int64, error)
}

// TeamRepository defines persistence operations for sales teams.
type TeamRepository interface {
	Create(ctx context.Context, team *model.SalesTeam) error
	GetByID(ctx context.Context, id string) (*model.SalesTeam, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	Delete(ctx context.Context, id string) error
	FindAll(ctx context.Context, filter model.ListFilter) ([]model.SalesTeam, int64, error)
	CountActive(ctx context.Context) (int64, error)
}

// StaffRepository defines persistence operations for sales staff.
type StaffRepository interface {
	Create(ctx context.Context, staff *model.SalesStaff) error
	GetByID(ctx context.Context, id string) (*model.SalesStaff, error)
	GetByCode(ctx context.Context, code string) (*model.SalesStaff, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	Delete(ctx context.Context, id string) error
	FindByTeam(ctx context.Context, teamID string) ([]model.SalesStaff, error)
	FindByFilter(ctx context.Context, filter model.ListFilter) ([]model.SalesStaff, int64, error)
	CountActive(ctx context.Context) (int64, error)
}

// TargetRepository defines persistence operations for sales targets.
type TargetRepository interface {
	Create(ctx context.Context, t *model.SalesTarget) error
	Upsert(ctx context.Context, t *model.SalesTarget) error
	FindByPeriod(ctx context.Context, year, month int, teamID, staffID string) ([]model.SalesTarget, error)
	FindByYear(ctx context.Context, year int) ([]model.SalesTarget, error)
}

// ProjectRepository defines persistence operations for dimension projects.
type ProjectRepository interface {
	Create(ctx context.Context, p *model.DimProject) error
	GetByID(ctx context.Context, id string) (*model.DimProject, error)
	GetByIDOrName(ctx context.Context, id, name string) (*model.DimProject, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	FindActive(ctx context.Context) ([]model.DimProject, error)
	FindByFilter(ctx context.Context, filter model.ListFilter) ([]model.DimProject, int64, error)
}

// DashboardRepository defines aggregation queries for the dashboard.
type DashboardRepository interface {
	GetKPIs(ctx context.Context, role, teamID, staffID string) (*model.DashboardKPIResponse, error)
	GetMonthlyRevenue(ctx context.Context, year int, teamID string) ([]model.MonthlyRevenueData, error)
	GetRecentTransactions(ctx context.Context, limit int, teamID string) ([]model.Transaction, error)
}

// TransactionHistoryRepository defines persistence for audit trail.
type TransactionHistoryRepository interface {
	Create(ctx context.Context, h *model.TransactionHistory) error
	FindByTransaction(ctx context.Context, txID string) ([]model.TransactionHistory, error)
}

// FactRepository defines persistence for fact/analytics tables.
type FactRepository interface {
	UpsertDailyFact(ctx context.Context, fact *model.FactSalesDaily) error
	GetDailyFacts(ctx context.Context, from, to string, teamID string) ([]model.FactSalesDaily, error)
	CreatePipelineSnapshot(ctx context.Context, snap *model.FactPipelineSnapshot) error
	GetLatestSnapshot(ctx context.Context) (*model.FactPipelineSnapshot, error)
}
