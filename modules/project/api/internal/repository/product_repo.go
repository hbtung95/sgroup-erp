package repository

import (
	"context"
	"errors"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"gorm.io/gorm"
)

type ProductRepository interface {
	Create(ctx context.Context, product *model.Product) error
	GetByID(ctx context.Context, id string) (*model.Product, error)
	FindByProjectID(ctx context.Context, projectID string, page, limit int) ([]model.Product, int64, error)
	LockProduct(ctx context.Context, id string, bookedBy string, lockedUntil time.Time) error
	UnlockProduct(ctx context.Context, id string) error
	UpdateStatus(ctx context.Context, id string, status model.ProductStatus) error
	Delete(ctx context.Context, id string) error
	CountByProjectID(ctx context.Context, projectID string) (int64, error)
	CountSoldByProjectID(ctx context.Context, projectID string) (int64, error)
	CleanupExpiredLocks(ctx context.Context) (int64, error)
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(ctx context.Context, product *model.Product) error {
	return r.db.WithContext(ctx).Create(product).Error
}

func (r *productRepository) GetByID(ctx context.Context, id string) (*model.Product, error) {
	var product model.Product
	err := r.db.WithContext(ctx).First(&product, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) FindByProjectID(ctx context.Context, projectID string, page, limit int) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Product{}).Where("project_id = ?", projectID)
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Offset(offset).Limit(limit).Order("code ASC").Find(&products).Error
	return products, total, err
}

// LockProduct applies an atomic update to lock a product mitigating race conditions.
func (r *productRepository) LockProduct(ctx context.Context, id string, bookedBy string, lockedUntil time.Time) error {
	result := r.db.WithContext(ctx).Model(&model.Product{}).
		Where("id = ? AND status = ?", id, model.ProductStatusAvailable).
		Updates(map[string]interface{}{
			"status":       model.ProductStatusLocked,
			"booked_by":    bookedBy,
			"locked_until": lockedUntil,
		})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("căn đã bị khoá bởi người khác hoặc không ở trạng thái mở bán")
	}
	return nil
}

func (r *productRepository) UnlockProduct(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Model(&model.Product{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":       model.ProductStatusAvailable,
			"booked_by":    nil,
			"locked_until": nil,
		})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("không tìm thấy căn để mở khoá")
	}
	return nil
}

func (r *productRepository) UpdateStatus(ctx context.Context, id string, status model.ProductStatus) error {
	return r.db.WithContext(ctx).Model(&model.Product{}).Where("id = ?", id).Update("status", status).Error
}

func (r *productRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.Product{}, "id = ?", id).Error
}

func (r *productRepository) CountByProjectID(ctx context.Context, projectID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.Product{}).Where("project_id = ?", projectID).Count(&count).Error
	return count, err
}

func (r *productRepository) CountSoldByProjectID(ctx context.Context, projectID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.Product{}).
		Where("project_id = ? AND status IN ?", projectID, []model.ProductStatus{
			model.ProductStatusSold, model.ProductStatusCompleted,
		}).Count(&count).Error
	return count, err
}

func (r *productRepository) CleanupExpiredLocks(ctx context.Context) (int64, error) {
	result := r.db.WithContext(ctx).Model(&model.Product{}).
		Where("status = ? AND locked_until < ?", model.ProductStatusLocked, time.Now()).
		Updates(map[string]interface{}{
			"status":       model.ProductStatusAvailable,
			"booked_by":    nil,
			"locked_until": nil,
		})
	return result.RowsAffected, result.Error
}
