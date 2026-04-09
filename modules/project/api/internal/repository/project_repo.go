package repository

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"gorm.io/gorm"
)

type ProjectRepository interface {
	Create(ctx context.Context, project *model.Project) error
	GetByID(ctx context.Context, id string) (*model.Project, error)
	FindAll(ctx context.Context, page, limit int, search string) ([]model.Project, int64, error)
	Update(ctx context.Context, project *model.Project) error
	Delete(ctx context.Context, id string) error
	UpdateSoldUnits(ctx context.Context, id string, soldUnits int) error
	UpdateTotalUnits(ctx context.Context, id string, totalUnits int) error
}

type projectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return &projectRepository{db: db}
}

func (r *projectRepository) Create(ctx context.Context, project *model.Project) error {
	return r.db.WithContext(ctx).Create(project).Error
}

func (r *projectRepository) GetByID(ctx context.Context, id string) (*model.Project, error) {
	var project model.Project
	err := r.db.WithContext(ctx).First(&project, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

func (r *projectRepository) FindAll(ctx context.Context, page, limit int, search string) ([]model.Project, int64, error) {
	var projects []model.Project
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Project{})
	
	if search != "" {
		lookup := "%" + search + "%"
		query = query.Where("name ILIKE ?", lookup)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&projects).Error
	return projects, total, err
}

func (r *projectRepository) Update(ctx context.Context, project *model.Project) error {
	return r.db.WithContext(ctx).Save(project).Error
}

func (r *projectRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.Project{}, "id = ?", id).Error
}

func (r *projectRepository) UpdateSoldUnits(ctx context.Context, id string, soldUnits int) error {
	return r.db.WithContext(ctx).Model(&model.Project{}).Where("id = ?", id).Update("sold_units", soldUnits).Error
}

func (r *projectRepository) UpdateTotalUnits(ctx context.Context, id string, totalUnits int) error {
	return r.db.WithContext(ctx).Model(&model.Project{}).Where("id = ?", id).Update("total_units", totalUnits).Error
}
