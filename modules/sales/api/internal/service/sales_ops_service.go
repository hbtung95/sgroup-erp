package service

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/events"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/repository"
)

type UserContext struct {
	ID        string
	Name      string
	TeamID    *string
	Role      string
	SalesRole string
	StaffID   *string
}

type SalesOpsService interface {
	// Bookings
	CreateBooking(booking *model.SalesBooking, ctx UserContext) error
	UpdateBooking(id string, updates map[string]interface{}, ctx UserContext) error
	ApproveBooking(id string, ctx UserContext) error
	RejectBooking(id string, ctx UserContext) error

	// Deposits
	CreateDeposit(deposit *model.SalesDeposit, ctx UserContext) error
	UpdateDeposit(id string, updates map[string]interface{}, ctx UserContext) error
	ConfirmDeposit(id string, ctx UserContext) error
	CancelDeposit(id string, ctx UserContext) error

	// Deals
	CreateDeal(deal *model.SalesDeal, ctx UserContext) error

	// Activities
	CreateActivity(activity *model.SalesActivity, ctx UserContext) error
}

type salesOpsService struct {
	repo     repository.SalesOpsRepository
	eventBus *events.EventBus
}

func NewSalesOpsService(repo repository.SalesOpsRepository, bus *events.EventBus) SalesOpsService {
	svc := &salesOpsService{repo: repo, eventBus: bus}
	svc.registerEvents()
	return svc
}

// RBAC Checks
func isReviewer(ctx UserContext) bool {
	return ctx.Role == "admin" || ctx.SalesRole == "sales_director" || ctx.SalesRole == "sales_manager" || ctx.SalesRole == "ceo" || ctx.SalesRole == "sales_admin"
}

func (s *salesOpsService) assertCanManageBooking(booking *model.SalesBooking, ctx UserContext) error {
	if booking.Status != "PENDING" && !isReviewer(ctx) {
		return errors.New("forbidden: only pending bookings can be edited")
	}
	if isReviewer(ctx) {
		return nil
	}
	if booking.CreatedByUserID != nil && *booking.CreatedByUserID == ctx.ID {
		return nil
	}
	if booking.StaffID != nil && ctx.StaffID != nil && *booking.StaffID == *ctx.StaffID {
		return nil
	}
	return errors.New("forbidden: you do not have permission to manage this booking")
}

func (s *salesOpsService) assertCanManageDeposit(deposit *model.SalesDeposit, ctx UserContext) error {
	if deposit.Status != "PENDING" && !isReviewer(ctx) {
		return errors.New("forbidden: only pending deposits can be edited")
	}
	if isReviewer(ctx) {
		return nil
	}
	if deposit.CreatedByUserID != nil && *deposit.CreatedByUserID == ctx.ID {
		return nil
	}
	if deposit.StaffID != nil && ctx.StaffID != nil && *deposit.StaffID == *ctx.StaffID {
		return nil
	}
	return errors.New("forbidden: you do not have permission to manage this deposit")
}

// Bookings Logic
func (s *salesOpsService) CreateBooking(booking *model.SalesBooking, ctx UserContext) error {
	now := time.Now()
	
	// Resolve project via repository if needed
	var projectName = booking.ProjectName
	if booking.ProjectID != "" {
		proj, err := s.repo.GetProjectByIDOrName(booking.ProjectID, "")
		if err == nil {
			projectName = proj.Name
		}
	}
	
	booking.ProjectName = projectName
	booking.CreatedByUserID = &ctx.ID
	booking.CreatedByName = &ctx.Name
	booking.StaffID = ctx.StaffID
	booking.Year = now.Year()
	booking.Month = int(now.Month())
	booking.Status = "PENDING"
	booking.BookingDate = now

	return s.repo.CreateBooking(booking)
}

func (s *salesOpsService) UpdateBooking(id string, updates map[string]interface{}, ctx UserContext) error {
	booking, err := s.repo.GetBookingByID(id)
	if err != nil {
		return err
	}
	
	if err := s.assertCanManageBooking(booking, ctx); err != nil {
		return err
	}
	
	if _, ok := updates["status"]; ok {
		if !isReviewer(ctx) {
			return errors.New("forbidden: only reviewers can change booking status directly")
		}
	}
	
	return s.repo.UpdateBooking(id, updates)
}

func (s *salesOpsService) ApproveBooking(id string, ctx UserContext) error {
	if !isReviewer(ctx) {
		return errors.New("forbidden: you do not have permission to review this item")
	}
	
	booking, err := s.repo.GetBookingByID(id)
	if err != nil {
		return err
	}
	
	if booking.Status != "PENDING" {
		return errors.New("bad request: only pending bookings can be approved")
	}
	
	now := time.Now()
	updates := map[string]interface{}{
		"status": "APPROVED",
		"reviewed_by_user_id": ctx.ID,
		"reviewed_by_name": ctx.Name,
		"reviewed_at": now,
	}
	
	return s.repo.UpdateBooking(id, updates)
}

func (s *salesOpsService) RejectBooking(id string, ctx UserContext) error {
	if !isReviewer(ctx) {
		return errors.New("forbidden: you do not have permission to review this item")
	}
	
	booking, err := s.repo.GetBookingByID(id)
	if err != nil {
		return err
	}
	
	if booking.Status != "PENDING" {
		return errors.New("bad request: only pending bookings can be rejected")
	}
	
	now := time.Now()
	updates := map[string]interface{}{
		"status": "REJECTED",
		"reviewed_by_user_id": ctx.ID,
		"reviewed_by_name": ctx.Name,
		"reviewed_at": now,
	}
	
	return s.repo.UpdateBooking(id, updates)
}

// Deposits Logic
func (s *salesOpsService) CreateDeposit(deposit *model.SalesDeposit, ctx UserContext) error {
	now := time.Now()
	
	deposit.CreatedByUserID = &ctx.ID
	deposit.CreatedByName = &ctx.Name
	deposit.StaffID = ctx.StaffID
	deposit.Year = now.Year()
	deposit.Month = int(now.Month())
	deposit.Status = "PENDING"
	deposit.DepositDate = now

	return s.repo.CreateDeposit(deposit)
}

func (s *salesOpsService) UpdateDeposit(id string, updates map[string]interface{}, ctx UserContext) error {
	deposit, err := s.repo.GetDepositByID(id)
	if err != nil {
		return err
	}
	
	if err := s.assertCanManageDeposit(deposit, ctx); err != nil {
		return err
	}
	
	if _, ok := updates["status"]; ok {
		if !isReviewer(ctx) {
			return errors.New("forbidden: only reviewers can change deposit status directly")
		}
	}
	
	return s.repo.UpdateDeposit(id, updates)
}

func (s *salesOpsService) ConfirmDeposit(id string, ctx UserContext) error {
	if !isReviewer(ctx) {
		return errors.New("forbidden: you do not have permission to review this item")
	}
	
	deposit, err := s.repo.GetDepositByID(id)
	if err != nil {
		return err
	}
	
	if deposit.Status != "PENDING" {
		return errors.New("bad request: only pending deposits can be confirmed")
	}
	
	now := time.Now()
	updates := map[string]interface{}{
		"status": "CONFIRMED",
		"reviewed_by_user_id": ctx.ID,
		"reviewed_by_name": ctx.Name,
		"reviewed_at": now,
	}
	
	return s.repo.UpdateDeposit(id, updates)
}

func (s *salesOpsService) CancelDeposit(id string, ctx UserContext) error {
	if !isReviewer(ctx) {
		return errors.New("forbidden: you do not have permission to review this item")
	}
	deposit, err := s.repo.GetDepositByID(id)
	if err != nil {
		return err
	}
	if deposit.Status != "PENDING" && deposit.Status != "CONFIRMED" {
		return errors.New("bad request: only pending or confirmed deposits can be cancelled")
	}
	
	now := time.Now()
	updates := map[string]interface{}{
		"status": "CANCELLED",
		"reviewed_by_user_id": ctx.ID,
		"reviewed_by_name": ctx.Name,
		"reviewed_at": now,
	}
	
	return s.repo.UpdateDeposit(id, updates)
}

// Deals Logic
func (s *salesOpsService) CreateDeal(deal *model.SalesDeal, ctx UserContext) error {
	deal.Commission = deal.DealValue * (deal.FeeRate / 100)
	deal.DealCode = fmt.Sprintf("GD-%d%02d-%d", deal.Year, deal.Month, time.Now().Unix())
	
	err := s.repo.CreateDeal(deal)
	if err == nil {
		s.eventBus.Publish(events.EventDealStatusChanged, deal)
	}
	return err
}

// Activities Logic
func (s *salesOpsService) CreateActivity(activity *model.SalesActivity, ctx UserContext) error {
	now := time.Now()
	activity.CreatedBy = ctx.Name
	if ctx.StaffID != nil {
		activity.StaffID = *ctx.StaffID
	}
	activity.TeamID = ctx.TeamID
	activity.ActivityDate = now
	activity.Year = now.Year()
	activity.Month = int(now.Month())

	return s.repo.CreateActivity(activity)
}

// Event Listeners
func (s *salesOpsService) registerEvents() {
	s.eventBus.Subscribe(events.EventTransactionApproved, s.handleTransactionApproved)
	s.eventBus.Subscribe(events.EventHrEmployeeCreated, s.handleHrEmployeeCreated)
}

func (s *salesOpsService) handleTransactionApproved(e events.Event) {
	data, ok := e.Data.(map[string]interface{})
	if !ok {
		return
	}
	
	if data["type"] == "INCOME" && data["dealId"] != nil {
		dealId := data["dealId"].(string)
		log.Printf("[SalesOps] Received income transaction approval for Deal %s", dealId)
		
		deal, err := s.repo.GetDealByID(dealId)
		if err == nil && deal.Stage == "DEPOSIT" {
			_ = s.repo.UpdateDeal(dealId, map[string]interface{}{"stage": "CONTRACT"})
			log.Printf("[SalesOps] Deal %s automatically moved from DEPOSIT to CONTRACT", dealId)
		}
	}
}

func (s *salesOpsService) handleHrEmployeeCreated(e events.Event) {
	data, ok := e.Data.(map[string]interface{})
	if !ok {
		return
	}
	
	empCode, ok := data["employeeCode"].(string)
	if !ok {
		return
	}
	
	log.Printf("[SalesOps] Received hr.employee_created event for Employee %s", empCode)
	
	_, err := s.repo.GetStaffByCode(empCode)
	if err != nil { // not found, create new
		empId := data["id"].(string)
		fullName := data["fullName"].(string)
		
		newStaff := &model.SalesStaff{
			HREmployeeID: &empId,
			EmployeeCode: empCode,
			FullName: fullName,
			Role: "sales",
			Status: "ACTIVE",
			LeadsCapacity: 30,
		}
		
		if phone, ok := data["phone"].(string); ok {
			newStaff.Phone = phone
		}
		
		if email, ok := data["email"].(string); ok {
			newStaff.Email = email
		}
		
		_ = s.repo.CreateStaff(newStaff)
		log.Printf("[SalesOps] Auto-created SalesStaff profile for HR Employee %s", empCode)
	}
}
