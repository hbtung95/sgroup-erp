package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
)

// ── Project Service Port (Inbound) ──────────────────────

// ProjectService defines the inbound port for project management operations.
type ProjectService interface {
	CreateProject(ctx context.Context, project *model.Project) error
	GetProject(ctx context.Context, id string) (*model.Project, error)
	ListProjects(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]model.Project, int64, error)
	UpdateProject(ctx context.Context, project *model.Project) error
	DeleteProject(ctx context.Context, id string) error
}

// ── Product Service Port (Inbound) ──────────────────────

// ProductService defines the inbound port for product/inventory operations.
type ProductService interface {
	CreateProduct(ctx context.Context, product *model.Product) error
	GetProduct(ctx context.Context, id string) (*model.Product, error)
	ListProductsByProject(ctx context.Context, projectID string, page, pageSize int, filters map[string]interface{}) ([]model.Product, int64, error)
	UpdateProduct(ctx context.Context, product *model.Product) error
	DeleteProduct(ctx context.Context, id string) error
	BulkImportProducts(ctx context.Context, projectID string, products []model.Product) error
}

// ── Legal Doc Service Port (Inbound) ────────────────────

// LegalDocService defines the inbound port for legal document operations.
type LegalDocService interface {
	CreateDoc(ctx context.Context, doc *model.LegalDoc) error
	GetDoc(ctx context.Context, id string) (*model.LegalDoc, error)
	ListDocsByProject(ctx context.Context, projectID string) ([]model.LegalDoc, error)
	UpdateDoc(ctx context.Context, doc *model.LegalDoc) error
	DeleteDoc(ctx context.Context, id string) error
}
