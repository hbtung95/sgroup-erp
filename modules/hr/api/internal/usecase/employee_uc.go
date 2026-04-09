package usecase

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/repository"
)

type EmployeeUseCase interface {
	CreateEmployee(ctx context.Context, emp *domain.Employee) error
	GetEmployeeList(ctx context.Context, page, pageSize int) ([]domain.Employee, int64, error)
}

type employeeUseCase struct {
	repo repository.EmployeeRepository
}

func NewEmployeeUseCase(repo repository.EmployeeRepository) EmployeeUseCase {
	return &employeeUseCase{repo: repo}
}

func (uc *employeeUseCase) CreateEmployee(ctx context.Context, emp *domain.Employee) error {
	// Add business logic: validate age, enforce uniqueness, auto-generate Employee Code if not set
	if emp.Status == "" {
		emp.Status = "Active"
	}
	// Call repository
	return uc.repo.Create(ctx, emp)
}

func (uc *employeeUseCase) GetEmployeeList(ctx context.Context, page, pageSize int) ([]domain.Employee, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 500 {
		pageSize = 50 // Default limit, allow up to 500 for bulk datagrid view
	}
	offset := (page - 1) * pageSize
	return uc.repo.List(ctx, offset, pageSize)
}
