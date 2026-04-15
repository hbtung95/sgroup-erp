package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
)

// ── Sales Team Service Port (Inbound) ───────────────────

// SalesTeamService defines the inbound port for sales team operations.
type SalesTeamService interface {
	CreateTeam(ctx context.Context, team *model.SalesTeam) error
	GetTeam(ctx context.Context, id string) (*model.SalesTeam, error)
	ListTeams(ctx context.Context, page, pageSize int) ([]model.SalesTeam, int64, error)
	UpdateTeam(ctx context.Context, team *model.SalesTeam) error
	DeleteTeam(ctx context.Context, id string) error
}

// ── Customer Service Port (Inbound) ─────────────────────

// CustomerService defines the inbound port for customer management operations.
type CustomerService interface {
	CreateCustomer(ctx context.Context, customer *model.Customer) error
	GetCustomer(ctx context.Context, id string) (*model.Customer, error)
	ListCustomers(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]model.Customer, int64, error)
	UpdateCustomer(ctx context.Context, customer *model.Customer) error
	DeleteCustomer(ctx context.Context, id string) error
}

// ── Transaction Service Port (Inbound) ──────────────────

// TransactionService defines the inbound port for deal/transaction operations.
type TransactionService interface {
	CreateTransaction(ctx context.Context, tx *model.Transaction) error
	GetTransaction(ctx context.Context, id string) (*model.Transaction, error)
	ListTransactions(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]model.Transaction, int64, error)
	ApproveTransaction(ctx context.Context, id, approverID string) error
	RejectTransaction(ctx context.Context, id, approverID, reason string) error
	CancelTransaction(ctx context.Context, id, reason string) error
}

// ── Commission Service Port (Inbound) ───────────────────

// CommissionService defines the inbound port for commission calculation.
type CommissionService interface {
	CalculateCommission(ctx context.Context, txID string) ([]model.Commission, error)
	GetCommissionsByStaff(ctx context.Context, staffID string) ([]model.Commission, error)
	MarkCommissionsAsPaid(ctx context.Context, ids []string) error
}
