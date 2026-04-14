package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/repository"
)

type AttendanceUseCase interface {
	CheckIn(ctx context.Context, employeeID string, remarks string) (*domain.AttendanceRecord, error)
	CheckOut(ctx context.Context, employeeID string, remarks string) (*domain.AttendanceRecord, error)
	List(ctx context.Context, offset, limit int, employeeID *string, startDate, endDate *string) ([]domain.AttendanceRecord, int64, error)
}

type attendanceUseCase struct {
	repo repository.AttendanceRepository
}

func NewAttendanceUseCase(repo repository.AttendanceRepository) AttendanceUseCase {
	return &attendanceUseCase{repo: repo}
}

func (u *attendanceUseCase) CheckIn(ctx context.Context, employeeID string, remarks string) (*domain.AttendanceRecord, error) {
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	todayDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	
	// Ensure no check-in exists for today, else we might return an error or allow multiple.
	// We'll simplify: List by date and employee. If already checked in today, return it or error.
	records, _, err := u.repo.List(ctx, 0, 1, &employeeID, &dateStr, &dateStr)
	if err != nil {
		return nil, err
	}
	
	if len(records) > 0 {
		return nil, errors.New("already checked in today")
	}

	// Status logic: Check against 08:30 threshold
	// 08:30 is the arbitrary cutoff
	hour, min, _ := now.Clock()
	status := "PRESENT"
	if hour > 8 || (hour == 8 && min > 30) {
		status = "LATE"
	}

	record := &domain.AttendanceRecord{
		EmployeeID: employeeID,
		Date:       todayDate,
		CheckIn:    &now,
		Status:     status,
		Remarks:    remarks,
	}

	err = u.repo.Create(ctx, record)
	if err != nil {
		return nil, err
	}

	return record, nil
}

func (u *attendanceUseCase) CheckOut(ctx context.Context, employeeID string, remarks string) (*domain.AttendanceRecord, error) {
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	
	records, _, err := u.repo.List(ctx, 0, 1, &employeeID, &dateStr, &dateStr)
	if err != nil {
		return nil, err
	}
	
	if len(records) == 0 {
		return nil, errors.New("cannot check out without checking in first")
	}

	record := &records[0]
	if record.CheckOut != nil {
		return nil, errors.New("already checked out today")
	}

	record.CheckOut = &now
	duration := now.Sub(*record.CheckIn)
	record.TotalHours = duration.Hours()
	
	if remarks != "" {
		record.Remarks = record.Remarks + " | Checkout: " + remarks
	}

	err = u.repo.Update(ctx, record)
	if err != nil {
		return nil, err
	}

	return record, nil
}

func (u *attendanceUseCase) List(ctx context.Context, offset, limit int, employeeID *string, startDate, endDate *string) ([]domain.AttendanceRecord, int64, error) {
	return u.repo.List(ctx, offset, limit, employeeID, startDate, endDate)
}
