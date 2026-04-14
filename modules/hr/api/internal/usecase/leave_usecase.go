package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/repository"
	"gorm.io/gorm"
)

type LeaveUseCase interface {
	SubmitRequest(ctx context.Context, req *domain.LeaveRequest) error
	ApproveRequest(ctx context.Context, id string, approverID string) error
	RejectRequest(ctx context.Context, id string, approverID string, note string) error
	ListRequests(ctx context.Context, offset, limit int, employeeID *string, status *string) ([]domain.LeaveRequest, int64, error)
	GetBalance(ctx context.Context, employeeID string, year int) (*domain.LeaveBalance, error)
}

type leaveUseCase struct {
	repo repository.LeaveRepository
}

func NewLeaveUseCase(repo repository.LeaveRepository) LeaveUseCase {
	return &leaveUseCase{repo: repo}
}

func (u *leaveUseCase) SubmitRequest(ctx context.Context, req *domain.LeaveRequest) error {
	// Calculate total days (simple difference) - a real system might exclude weekends
	// For now, we take EndDate - StartDate in days + 1
	days := int(req.EndDate.Sub(req.StartDate).Hours() / 24) + 1
	if days <= 0 {
		return errors.New("end date must be after start date")
	}
	req.TotalDays = float64(days)
	req.Status = "PENDING"

	// Fetch leave balance
	year := req.StartDate.Year()
	balance, err := u.repo.GetBalance(ctx, req.EmployeeID, year)
	if err != nil {
		return err
	}
	if balance == nil {
		// Initialize balance if not exist
		balance = &domain.LeaveBalance{
			EmployeeID:     req.EmployeeID,
			Year:           year,
			AnnualEntitled: 12.0,
			AnnualUsed:     0.0,
			SickEntitled:   30.0,
			SickUsed:       0.0,
		}
		if err := u.repo.CreateBalance(ctx, balance); err != nil {
			return err
		}
	}

	// Validate sufficient balance
	switch req.LeaveType {
	case "ANNUAL":
		if balance.AnnualEntitled-balance.AnnualUsed < req.TotalDays {
			return errors.New("insufficient annual leave balance")
		}
	case "SICK":
		if balance.SickEntitled-balance.SickUsed < req.TotalDays {
			return errors.New("insufficient sick leave balance")
		}
	}

	return u.repo.CreateRequest(ctx, req)
}

func (u *leaveUseCase) ApproveRequest(ctx context.Context, id string, approverID string) error {
	req, err := u.repo.GetRequestByID(ctx, id)
	if err != nil {
		return err
	}
	if req.Status != "PENDING" && req.Status != "LEADER_APPROVED" {
		return errors.New("only pending or leader-approved requests can be approved")
	}

	// Use transaction for atomic balance update + request approval
	return u.repo.DB().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txRepo := u.repo.WithTx(tx)

		// Fetch balance within transaction
		year := req.StartDate.Year()
		balance, err := txRepo.GetBalance(ctx, req.EmployeeID, year)
		if err != nil || balance == nil {
			return errors.New("leave balance not found")
		}

		// Deduct balance
		switch req.LeaveType {
		case "ANNUAL":
			remaining := balance.AnnualEntitled + balance.AnnualCarried - balance.AnnualUsed - balance.AnnualPending
			if remaining < req.TotalDays {
				return errors.New("insufficient annual leave balance")
			}
			balance.AnnualUsed += req.TotalDays
			if balance.AnnualPending >= req.TotalDays {
				balance.AnnualPending -= req.TotalDays
			}
		case "SICK":
			if balance.SickEntitled-balance.SickUsed < req.TotalDays {
				return errors.New("insufficient sick leave balance")
			}
			balance.SickUsed += req.TotalDays
		case "COMP_OFF":
			if balance.CompOffEntitled-balance.CompOffUsed < req.TotalDays {
				return errors.New("insufficient comp-off balance")
			}
			balance.CompOffUsed += req.TotalDays
		case "UNPAID":
			balance.UnpaidUsed += req.TotalDays
		}

		// Save balance
		if err := txRepo.UpdateBalance(ctx, balance); err != nil {
			return err
		}

		// Update request
		now := time.Now()
		req.Status = "APPROVED"
		req.ApproverID = &approverID
		req.ApprovedAt = &now

		return txRepo.UpdateRequest(ctx, req)
	})
}

func (u *leaveUseCase) RejectRequest(ctx context.Context, id string, approverID string, note string) error {
	req, err := u.repo.GetRequestByID(ctx, id)
	if err != nil {
		return err
	}
	if req.Status != "PENDING" {
		return errors.New("only pending requests can be rejected")
	}

	now := time.Now()
	req.Status = "REJECTED"
	req.ApproverID = &approverID
	req.ApprovedAt = &now
	req.ApproverNote = note

	return u.repo.UpdateRequest(ctx, req)
}

func (u *leaveUseCase) ListRequests(ctx context.Context, offset, limit int, employeeID *string, status *string) ([]domain.LeaveRequest, int64, error) {
	return u.repo.ListRequests(ctx, offset, limit, employeeID, status)
}

func (u *leaveUseCase) GetBalance(ctx context.Context, employeeID string, year int) (*domain.LeaveBalance, error) {
	return u.repo.GetBalance(ctx, employeeID, year)
}
