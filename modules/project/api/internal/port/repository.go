package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
)

// ── Project Repository Port ─────────────────────────────

// ProjectRepository defines the outbound port for project data persistence.
type ProjectRepository interface {
	Create(ctx context.Context, project *model.Project) error
	GetByID(ctx context.Context, id string) (*model.Project, error)
	List(ctx context.Context, offset, limit int, filters map[string]interface{}) ([]model.Project, int64, error)
	Update(ctx context.Context, project *model.Project) error
	Delete(ctx context.Context, id string) error
	GetByCode(ctx context.Context, code string) (*model.Project, error)
}

// ── Product Repository Port ─────────────────────────────

// ProductRepository defines the outbound port for product/inventory data persistence.
type ProductRepository interface {
	Create(ctx context.Context, product *model.Product) error
	GetByID(ctx context.Context, id string) (*model.Product, error)
	ListByProject(ctx context.Context, projectID string, offset, limit int, filters map[string]interface{}) ([]model.Product, int64, error)
	Update(ctx context.Context, product *model.Product) error
	Delete(ctx context.Context, id string) error
	BulkCreate(ctx context.Context, products []model.Product) error
}

// ── Legal Document Repository Port ──────────────────────

// LegalDocRepository defines the outbound port for legal document persistence.
type LegalDocRepository interface {
	Create(ctx context.Context, doc *model.LegalDoc) error
	GetByID(ctx context.Context, id string) (*model.LegalDoc, error)
	ListByProject(ctx context.Context, projectID string) ([]model.LegalDoc, error)
	Update(ctx context.Context, doc *model.LegalDoc) error
	Delete(ctx context.Context, id string) error
}

// ── Audit Log Repository Port ───────────────────────────

// AuditLogRepository defines the outbound port for audit log persistence.
type AuditLogRepository interface {
	Create(ctx context.Context, log *model.AuditLog) error
	ListByEntity(ctx context.Context, entityType, entityID string) ([]model.AuditLog, error)
}
