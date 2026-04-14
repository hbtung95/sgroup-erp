package repository

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"gorm.io/gorm"
)

type LeaveRepository interface {
	CreateRequest(ctx context.Context, req *domain.LeaveRequest) error
	UpdateRequest(ctx context.Context, req *domain.LeaveRequest) error
	GetRequestByID(ctx context.Context, id string) (*domain.LeaveRequest, error)
	ListRequests(ctx context.Context, offset, limit int, employeeID *string, status *string) ([]domain.LeaveRequest, int64, error)
	
	GetBalance(ctx context.Context, employeeID string, year int) (*domain.LeaveBalance, error)
	UpdateBalance(ctx context.Context, balance *domain.LeaveBalance) error
	CreateBalance(ctx context.Context, balance *domain.LeaveBalance) error

	// Transaction support
	DB() *gorm.DB
	WithTx(tx *gorm.DB) LeaveRepository
}

type leaveRepository struct {
	db *gorm.DB
}

func NewLeaveRepository(db *gorm.DB) LeaveRepository {
	return &leaveRepository{db: db}
}

func (r *leaveRepository) CreateRequest(ctx context.Context, req *domain.LeaveRequest) error {
	return r.db.WithContext(ctx).Create(req).Error
}

func (r *leaveRepository) UpdateRequest(ctx context.Context, req *domain.LeaveRequest) error {
	return r.db.WithContext(ctx).Save(req).Error
}

func (r *leaveRepository) GetRequestByID(ctx context.Context, id string) (*domain.LeaveRequest, error) {
	var req domain.LeaveRequest
	err := r.db.WithContext(ctx).
		Preload("Employee").
		Preload("ApprovedBy").
		First(&req, id).Error
	return &req, err
}

func (r *leaveRepository) ListRequests(ctx context.Context, offset, limit int, employeeID *string, status *string) ([]domain.LeaveRequest, int64, error) {
	var requests []domain.LeaveRequest
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.LeaveRequest{})

	if employeeID != nil && *employeeID != "" {
		query = query.Where("employee_id = ?", *employeeID)
	}
	if status != nil && *status != "" {
		query = query.Where("status = ?", *status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Preload("Employee").
		Preload("ApprovedBy").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&requests).Error

	return requests, total, err
}

func (r *leaveRepository) GetBalance(ctx context.Context, employeeID string, year int) (*domain.LeaveBalance, error) {
	var balance domain.LeaveBalance
	err := r.db.WithContext(ctx).Where("employee_id = ? AND year = ?", employeeID, year).First(&balance).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil // Return nil balance without error if not found
	}
	return &balance, err
}

func (r *leaveRepository) UpdateBalance(ctx context.Context, balance *domain.LeaveBalance) error {
	return r.db.WithContext(ctx).Save(balance).Error
}

func (r *leaveRepository) CreateBalance(ctx context.Context, balance *domain.LeaveBalance) error {
	return r.db.WithContext(ctx).Create(balance).Error
}

func (r *leaveRepository) DB() *gorm.DB {
	return r.db
}

func (r *leaveRepository) WithTx(tx *gorm.DB) LeaveRepository {
	return &leaveRepository{db: tx}
}
