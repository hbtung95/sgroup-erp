package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
)

// ── Sales Team Repository Port ──────────────────────────

// SalesTeamRepository defines the outbound port for sales team persistence.
type SalesTeamRepository interface {
	Create(ctx context.Context, team *model.SalesTeam) error
	GetByID(ctx context.Context, id string) (*model.SalesTeam, error)
	List(ctx context.Context, offset, limit int) ([]model.SalesTeam, int64, error)
	Update(ctx context.Context, team *model.SalesTeam) error
	Delete(ctx context.Context, id string) error
}

// ── Customer Repository Port ────────────────────────────

// CustomerRepository defines the outbound port for customer data persistence.
type CustomerRepository interface {
	Create(ctx context.Context, customer *model.Customer) error
	GetByID(ctx context.Context, id string) (*model.Customer, error)
	List(ctx context.Context, offset, limit int, filters map[string]interface{}) ([]model.Customer, int64, error)
	Update(ctx context.Context, customer *model.Customer) error
	Delete(ctx context.Context, id string) error
	GetByPhone(ctx context.Context, phone string) (*model.Customer, error)
}

// ── Transaction Repository Port ─────────────────────────

// TransactionRepository defines the outbound port for transaction persistence.
type TransactionRepository interface {
	Create(ctx context.Context, tx *model.Transaction) error
	GetByID(ctx context.Context, id string) (*model.Transaction, error)
	List(ctx context.Context, offset, limit int, filters map[string]interface{}) ([]model.Transaction, int64, error)
	Update(ctx context.Context, tx *model.Transaction) error
	GetByProductID(ctx context.Context, productID string) ([]model.Transaction, error)
}

// ── Commission Repository Port ──────────────────────────

// CommissionRepository defines the outbound port for commission data persistence.
type CommissionRepository interface {
	Create(ctx context.Context, commission *model.Commission) error
	ListByTransaction(ctx context.Context, txID string) ([]model.Commission, error)
	ListByStaff(ctx context.Context, staffID string) ([]model.Commission, error)
	BulkCreate(ctx context.Context, commissions []model.Commission) error
	MarkAsPaid(ctx context.Context, ids []string) error
}
