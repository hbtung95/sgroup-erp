package service

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/repository"
)

type DocService interface {
	UploadDoc(ctx context.Context, doc *model.LegalDoc) (*model.LegalDoc, error)
	ListDocs(ctx context.Context, projectID string) ([]model.LegalDoc, error)
	DeleteDoc(ctx context.Context, id string) error
}

type docService struct {
	repo repository.DocRepository
}

func NewDocService(repo repository.DocRepository) DocService {
	return &docService{repo: repo}
}

func (s *docService) UploadDoc(ctx context.Context, doc *model.LegalDoc) (*model.LegalDoc, error) {
	if err := s.repo.Create(ctx, doc); err != nil {
		return nil, err
	}
	return doc, nil
}

func (s *docService) ListDocs(ctx context.Context, projectID string) ([]model.LegalDoc, error) {
	return s.repo.ListByProject(ctx, projectID)
}

func (s *docService) DeleteDoc(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
