package repository

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"gorm.io/gorm"
)

type DocRepository interface {
	Create(ctx context.Context, doc *model.LegalDoc) error
	ListByProject(ctx context.Context, projectID string) ([]model.LegalDoc, error)
	Delete(ctx context.Context, id string) error
}

type docRepository struct {
	db *gorm.DB
}

func NewDocRepository(db *gorm.DB) DocRepository {
	return &docRepository{db: db}
}

func (r *docRepository) Create(ctx context.Context, doc *model.LegalDoc) error {
	return r.db.WithContext(ctx).Create(doc).Error
}

func (r *docRepository) ListByProject(ctx context.Context, projectID string) ([]model.LegalDoc, error) {
	var docs []model.LegalDoc
	if err := r.db.WithContext(ctx).Where("project_id = ?", projectID).Order("created_at desc").Find(&docs).Error; err != nil {
		return nil, err
	}
	return docs, nil
}

func (r *docRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.LegalDoc{}, "id = ?", id).Error
}
