package repository

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"gorm.io/gorm"
)

type TransactionRepository interface {
	Create(ctx context.Context, tx *model.Transaction) error
	GetByID(ctx context.Context, id string) (*model.Transaction, error)
	FindBySalesStaff(ctx context.Context, staffID string, page, limit int) ([]model.Transaction, int64, error)
	FindByTeam(ctx context.Context, teamID string, page, limit int) ([]model.Transaction, int64, error)
	UpdateStatus(ctx context.Context, id string, status model.TransactionStatus, approvedBy *string) error
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, tx *model.Transaction) error {
	return r.db.WithContext(ctx).Create(tx).Error
}

func (r *transactionRepository) GetByID(ctx context.Context, id string) (*model.Transaction, error) {
	var tx model.Transaction
	err := r.db.WithContext(ctx).First(&tx, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

func (r *transactionRepository) FindBySalesStaff(ctx context.Context, staffID string, page, limit int) ([]model.Transaction, int64, error) {
	var txs []model.Transaction
	var total int64
	query := r.db.WithContext(ctx).Model(&model.Transaction{}).Where("sales_staff_id = ?", staffID)
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * limit
	err = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&txs).Error
	return txs, total, err
}

func (r *transactionRepository) FindByTeam(ctx context.Context, teamID string, page, limit int) ([]model.Transaction, int64, error) {
	var txs []model.Transaction
	var total int64
	query := r.db.WithContext(ctx).Model(&model.Transaction{}).Where("sales_team_id = ?", teamID)
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * limit
	err = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&txs).Error
	return txs, total, err
}

func (r *transactionRepository) UpdateStatus(ctx context.Context, id string, status model.TransactionStatus, approvedBy *string) error {
	updates := map[string]interface{}{"status": status}
	if approvedBy != nil {
		updates["approved_by"] = *approvedBy
	}
	return r.db.WithContext(ctx).Model(&model.Transaction{}).Where("id = ?", id).Updates(updates).Error
}
