package repository

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"gorm.io/gorm"
)

type CustomerRepository interface {
	Create(ctx context.Context, customer *model.Customer) error
	GetByID(ctx context.Context, id string) (*model.Customer, error)
	FindByAssignedTo(ctx context.Context, salesStaffID string, page, limit int) ([]model.Customer, int64, error)
}

type customerRepository struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) CustomerRepository {
	return &customerRepository{db: db}
}

func (r *customerRepository) Create(ctx context.Context, customer *model.Customer) error {
	return r.db.WithContext(ctx).Create(customer).Error
}

func (r *customerRepository) GetByID(ctx context.Context, id string) (*model.Customer, error) {
	var customer model.Customer
	err := r.db.WithContext(ctx).First(&customer, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *customerRepository) FindByAssignedTo(ctx context.Context, salesStaffID string, page, limit int) ([]model.Customer, int64, error) {
	var customers []model.Customer
	var total int64
	query := r.db.WithContext(ctx).Model(&model.Customer{}).Where("assigned_to = ?", salesStaffID)
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * limit
	err = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&customers).Error
	return customers, total, err
}
