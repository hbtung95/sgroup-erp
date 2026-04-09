package service

import (
	"context"
	"errors"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/repository"
)

type TransactionService interface {
	RequestLock(ctx context.Context, req *model.Transaction) (*model.Transaction, error)
	ApproveLock(ctx context.Context, txID string, managerID string) error
	RejectLock(ctx context.Context, txID string, managerID string) error
	MarkDeposit(ctx context.Context, txID string, staffID string) error
	MarkSold(ctx context.Context, txID string, staffID string) error
	GetTransaction(ctx context.Context, id string) (*model.Transaction, error)
	ListMyTransactions(ctx context.Context, staffID string, page, limit int) ([]model.Transaction, int64, error)
	ListTeamTransactions(ctx context.Context, teamID string, page, limit int) ([]model.Transaction, int64, error)
}

type transactionService struct {
	txRepo   repository.TransactionRepository
	commRepo repository.CommissionRepository
}

func NewTransactionService(txRepo repository.TransactionRepository, commRepo repository.CommissionRepository) TransactionService {
	return &transactionService{
		txRepo:   txRepo,
		commRepo: commRepo,
	}
}

func (s *transactionService) RequestLock(ctx context.Context, req *model.Transaction) (*model.Transaction, error) {
	// NVKD requests a lock. Status is strictly Pending.
	req.Status = model.TxStatusPendingLock
	err := s.txRepo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	return req, nil
}

func (s *transactionService) ApproveLock(ctx context.Context, txID string, managerID string) error {
	tx, err := s.txRepo.GetByID(ctx, txID)
	if err != nil {
		return err
	}
	if tx.Status != model.TxStatusPendingLock {
		return errors.New("chỉ có thể duyệt các yêu cầu đang ở trạng thái PENDING_LOCK")
	}

	// In real workflow, we would now call Project Module API to actually lock the product
	// e.g., axios.post('http://project-api:8081/api/v1/products/.../lock')
	// If project module returns success, we update our local status.

	return s.txRepo.UpdateStatus(ctx, txID, model.TxStatusLocked, &managerID)
}

func (s *transactionService) RejectLock(ctx context.Context, txID string, managerID string) error {
	tx, err := s.txRepo.GetByID(ctx, txID)
	if err != nil {
		return err
	}
	if tx.Status != model.TxStatusPendingLock {
		return errors.New("chỉ có thể từ chối các yêu cầu đang ở trạng thái PENDING_LOCK")
	}

	return s.txRepo.UpdateStatus(ctx, txID, model.TxStatusRejected, &managerID)
}

func (s *transactionService) MarkDeposit(ctx context.Context, txID string, staffID string) error {
	tx, err := s.txRepo.GetByID(ctx, txID)
	if err != nil {
		return err
	}
	if tx.Status != model.TxStatusLocked {
		return errors.New("chỉ có thể vào cọc khi căn đã được LOCKED thành công")
	}
	// In production, sync status with Project Server via API here
	return s.txRepo.UpdateStatus(ctx, txID, model.TxStatusDeposit, nil)
}

func (s *transactionService) MarkSold(ctx context.Context, txID string, staffID string) error {
	tx, err := s.txRepo.GetByID(ctx, txID)
	if err != nil {
		return err
	}
	if tx.Status != model.TxStatusDeposit {
		return errors.New("chỉ có thể bán khi đã Cọc")
	}
	
	// Cập nhật trạng thái
	err = s.txRepo.UpdateStatus(ctx, txID, model.TxStatusSold, nil)
	if err != nil {
		return err
	}

	// -------------------------------------------------------------
	// GIAI ĐOẠN 4: ENGINE TÍNH TOÁN HOA HỒNG TỰ ĐỘNG
	// Giả sử: Giá căn HĐMB là tx.PriceAtLock (tính bằng Tỷ, ví dụ: 3.5 = 3,500,000,000)
	// Chính sách Hoa hồng SGroup (Mock):
	// - Tổng phí trả cho sàn (Company Fee): 4%
	// Phân bổ: 
	// - NVKD chốt deal (STAFF): 2.0%
	// - Trưởng Phòng (MANAGER): 0.5% (Quản lý trực tiếp)
	// - Cấp Tổng GĐ (DIRECTOR): 0.2% 
	// - Còn lại vào Doanh Thu Cty
	// -------------------------------------------------------------
	
	if tx.PriceAtLock > 0 {
		var commissions []model.Commission

		// 1. Staff Commission
		staffAmount := tx.PriceAtLock * (2.0 / 100) // Ví dụ 3.5 Tỷ * 2% = 0.07 Tỷ
		commissions = append(commissions, model.Commission{
			TransactionID: tx.ID,
			Role:          "sales_staff",
			EarnedBy:      tx.SalesStaffID,
			Amount:        staffAmount,
			Percentage:    2.0,
		})

		// 2. Manager Commission
		// Lấy Manager ID từ SalesTeam (ở đây mock cứng cho nhanh)
		managerID := "mgr-456"
		managerAmount := tx.PriceAtLock * (0.5 / 100)
		commissions = append(commissions, model.Commission{
			TransactionID: tx.ID,
			Role:          "sales_manager",
			EarnedBy:      managerID,
			Amount:        managerAmount,
			Percentage:    0.5,
		})

		// 3. Director Commission (Toàn cầu)
		directorID := "dir-123"
		directorAmount := tx.PriceAtLock * (0.2 / 100)
		commissions = append(commissions, model.Commission{
			TransactionID: tx.ID,
			Role:          "sales_director",
			EarnedBy:      directorID,
			Amount:        directorAmount,
			Percentage:    0.2,
		})

		// Lưu đồng thời bằng SQL Batch Insert cực nhanh
		_ = s.commRepo.CreateBatch(ctx, commissions)
	}

	// In production, sync status with Project Server via API or Event Bus here
	return nil
}

func (s *transactionService) GetTransaction(ctx context.Context, id string) (*model.Transaction, error) {
	return s.txRepo.GetByID(ctx, id)
}

func (s *transactionService) ListMyTransactions(ctx context.Context, staffID string, page, limit int) ([]model.Transaction, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	return s.txRepo.FindBySalesStaff(ctx, staffID, page, limit)
}

func (s *transactionService) ListTeamTransactions(ctx context.Context, teamID string, page, limit int) ([]model.Transaction, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 50
	}
	return s.txRepo.FindByTeam(ctx, teamID, page, limit)
}
