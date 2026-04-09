package repository

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"gorm.io/gorm"
)

type EmployeeRepository interface {
	Create(ctx context.Context, employee *domain.Employee) error
	GetByID(ctx context.Context, id uint) (*domain.Employee, error)
	List(ctx context.Context, offset, limit int) ([]domain.Employee, int64, error)
}

type employeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) EmployeeRepository {
	return &employeeRepository{db: db}
}

func (r *employeeRepository) Create(ctx context.Context, employee *domain.Employee) error {
	return r.db.WithContext(ctx).Create(employee).Error
}

func (r *employeeRepository) GetByID(ctx context.Context, id uint) (*domain.Employee, error) {
	var currentEmployee domain.Employee
	err := r.db.WithContext(ctx).
		Preload("Department").
		Preload("Position").
		Preload("Manager").
		First(&currentEmployee, id).Error
	return &currentEmployee, err
}

func (r *employeeRepository) List(ctx context.Context, offset, limit int) ([]domain.Employee, int64, error) {
	var employees []domain.Employee
	var total int64

	// Count total
	if err := r.db.WithContext(ctx).Model(&domain.Employee{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get records with preload
	err := r.db.WithContext(ctx).
		Preload("Department").
		Preload("Position").
		Offset(offset).
		Limit(limit).
		Find(&employees).Error

	return employees, total, err
}
