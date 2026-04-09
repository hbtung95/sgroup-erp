package repository

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"gorm.io/gorm"
)

type CommissionRepository interface {
	CreateBatch(ctx context.Context, commissions []model.Commission) error
	FindByStaff(ctx context.Context, staffID string) ([]model.Commission, error)
}

type commissionRepository struct {
	db *gorm.DB
}

func NewCommissionRepository(db *gorm.DB) CommissionRepository {
	return &commissionRepository{db: db}
}

func (r *commissionRepository) CreateBatch(ctx context.Context, commissions []model.Commission) error {
	return r.db.WithContext(ctx).Create(&commissions).Error
}

func (r *commissionRepository) FindByStaff(ctx context.Context, staffID string) ([]model.Commission, error) {
	var comms []model.Commission
	err := r.db.WithContext(ctx).Where("earned_by = ?", staffID).Order("created_at DESC").Find(&comms).Error
	return comms, err
}
