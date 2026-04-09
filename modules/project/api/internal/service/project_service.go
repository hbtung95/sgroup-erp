package service

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/repository"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/infrastructure/messaging"
)

type ProjectService interface {
	CreateProject(ctx context.Context, req *model.Project) (*model.Project, error)
	GetProject(ctx context.Context, id string) (*model.Project, error)
	ListProjects(ctx context.Context, page, limit int, search string) ([]model.Project, int64, error)
	UpdateProject(ctx context.Context, req *model.Project) error
	DeleteProject(ctx context.Context, id string) error
	SyncProjectUnits(ctx context.Context, id string) error
}

type projectService struct {
	projectRepo repository.ProjectRepository
	productRepo repository.ProductRepository
	eventBus    messaging.EventPublisher
}

func NewProjectService(projectRepo repository.ProjectRepository, productRepo repository.ProductRepository, eventBus messaging.EventPublisher) ProjectService {
	return &projectService{
		projectRepo: projectRepo,
		productRepo: productRepo,
		eventBus:    eventBus,
	}
}

func (s *projectService) CreateProject(ctx context.Context, req *model.Project) (*model.Project, error) {
	err := s.projectRepo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	
	// Publish Event
	_ = s.eventBus.PublishEvent("project.created", req)
	
	return req, nil
}

func (s *projectService) GetProject(ctx context.Context, id string) (*model.Project, error) {
	return s.projectRepo.GetByID(ctx, id)
}

func (s *projectService) ListProjects(ctx context.Context, page, limit int, search string) ([]model.Project, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.projectRepo.FindAll(ctx, page, limit, search)
}

func (s *projectService) UpdateProject(ctx context.Context, req *model.Project) error {
	existing, err := s.projectRepo.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}

	existing.Name = req.Name
	existing.Developer = req.Developer
	existing.Location = req.Location
	existing.Type = req.Type
	existing.FeeRate = req.FeeRate
	existing.AvgPrice = req.AvgPrice
	existing.Status = req.Status
	existing.StartDate = req.StartDate
	existing.EndDate = req.EndDate

	return s.projectRepo.Update(ctx, existing)
}

func (s *projectService) DeleteProject(ctx context.Context, id string) error {
	return s.projectRepo.Delete(ctx, id)
}

func (s *projectService) SyncProjectUnits(ctx context.Context, id string) error {
	total, err := s.productRepo.CountByProjectID(ctx, id)
	if err != nil {
		return err
	}
	sold, err := s.productRepo.CountSoldByProjectID(ctx, id)
	if err != nil {
		return err
	}

	if err := s.projectRepo.UpdateTotalUnits(ctx, id, int(total)); err != nil {
		return err
	}
	if err := s.projectRepo.UpdateSoldUnits(ctx, id, int(sold)); err != nil {
		return err
	}
	return nil
}
