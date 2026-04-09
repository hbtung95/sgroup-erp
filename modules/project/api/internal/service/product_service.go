package service

import (
	"context"
	"errors"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/repository"
)

type ProductService interface {
	CreateProduct(ctx context.Context, req *model.Product) (*model.Product, error)
	ListProjectProducts(ctx context.Context, projectID string, page, limit int) ([]model.Product, int64, error)
	LockProduct(ctx context.Context, id string, bookedBy string, lockDurationHours int) error
	UnlockProduct(ctx context.Context, id string, requestedBy string, isAdmin bool) error
	DepositProduct(ctx context.Context, id string, requestedBy string) error
	SoldProduct(ctx context.Context, id string, requestedBy string) error
	UpdateProductStatus(ctx context.Context, id string, status model.ProductStatus) error
	DeleteProduct(ctx context.Context, id string) error
	CleanupLocks(ctx context.Context) (int64, error)
}

type productService struct {
	productRepo repository.ProductRepository
	auditRepo   repository.AuditLogRepository
}

func NewProductService(productRepo repository.ProductRepository, auditRepo repository.AuditLogRepository) ProductService {
	return &productService{
		productRepo: productRepo,
		auditRepo:   auditRepo,
	}
}

func (s *productService) CreateProduct(ctx context.Context, req *model.Product) (*model.Product, error) {
	err := s.productRepo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	return req, nil
}

func (s *productService) ListProjectProducts(ctx context.Context, projectID string, page, limit int) ([]model.Product, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 500 {
		limit = 50
	}
	return s.productRepo.FindByProjectID(ctx, projectID, page, limit)
}

func (s *productService) LockProduct(ctx context.Context, id string, bookedBy string, lockDurationHours int) error {
	lockedUntil := time.Now().Add(time.Duration(lockDurationHours) * time.Hour)
	err := s.productRepo.LockProduct(ctx, id, bookedBy, lockedUntil)
	if err == nil && s.auditRepo != nil {
		_ = s.auditRepo.Create(ctx, &model.AuditLog{
			UserID:     bookedBy,
			Action:     "LOCK",
			EntityType: "Product",
			EntityID:   id,
			Details:    "Locked product for 24h",
		})
	}
	return err
}

func (s *productService) UnlockProduct(ctx context.Context, id string, requestedBy string, isAdmin bool) error {
	product, err := s.productRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if product.Status != model.ProductStatusLocked {
		return errors.New("căn không ở trạng thái khoá")
	}
	if !isAdmin && product.BookedBy != nil && *product.BookedBy != requestedBy {
		return errors.New("không có quyền mở khoá căn của người khác")
	}

	err = s.productRepo.UnlockProduct(ctx, id)
	if err == nil && s.auditRepo != nil {
		_ = s.auditRepo.Create(ctx, &model.AuditLog{
			UserID:     requestedBy,
			Action:     "UNLOCK",
			EntityType: "Product",
			EntityID:   id,
			Details:    "Unlocked product",
		})
	}
	return err
}

func (s *productService) DepositProduct(ctx context.Context, id string, requestedBy string) error {
	product, err := s.productRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if product.Status != model.ProductStatusLocked {
		return errors.New("căn phải đang bị khoá mới có thể vào cọc")
	}

	err = s.productRepo.UpdateStatus(ctx, id, model.ProductStatusDeposit)
	if err == nil && s.auditRepo != nil {
		_ = s.auditRepo.Create(ctx, &model.AuditLog{
			UserID:     requestedBy,
			Action:     "DEPOSIT",
			EntityType: "Product",
			EntityID:   id,
			Details:    "Vào cọc sản phẩm",
		})
	}
	return err
}

func (s *productService) SoldProduct(ctx context.Context, id string, requestedBy string) error {
	product, err := s.productRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if product.Status != model.ProductStatusDeposit {
		return errors.New("căn phải đang ở trạng thái đặt cọc mới có thể giao dịch Thành công (Đã Bán)")
	}

	err = s.productRepo.UpdateStatus(ctx, id, model.ProductStatusSold)
	if err == nil && s.auditRepo != nil {
		_ = s.auditRepo.Create(ctx, &model.AuditLog{
			UserID:     requestedBy,
			Action:     "SOLD",
			EntityType: "Product",
			EntityID:   id,
			Details:    "Giao dịch đã bán/Hợp đồng",
		})
	}
	return err
}

func (s *productService) UpdateProductStatus(ctx context.Context, id string, status model.ProductStatus) error {
	return s.productRepo.UpdateStatus(ctx, id, status)
}

func (s *productService) DeleteProduct(ctx context.Context, id string) error {
	return s.productRepo.Delete(ctx, id)
}

func (s *productService) CleanupLocks(ctx context.Context) (int64, error) {
	return s.productRepo.CleanupExpiredLocks(ctx)
}
