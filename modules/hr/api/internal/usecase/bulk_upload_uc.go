package usecase

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"strconv"
	"time"
	"strings"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/repository"
)

type BulkUploadUseCase interface {
	UploadAttendanceCSV(ctx context.Context, file *multipart.FileHeader) error
}

type bulkUploadUseCase struct {
	attendanceRepo repository.AttendanceRepository
}

func NewBulkUploadUseCase(repo repository.AttendanceRepository) BulkUploadUseCase {
	return &bulkUploadUseCase{attendanceRepo: repo}
}

func (u *bulkUploadUseCase) UploadAttendanceCSV(ctx context.Context, fileHeader *multipart.FileHeader) error {
	file, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	
	// Skip header
	if _, err := reader.Read(); err != nil {
		return errors.New("invalid or empty CSV file")
	}

	var records []domain.AttendanceRecord

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("error reading CSV: %w", err)
		}

		if len(record) < 4 {
			continue // Skip invalid rows
		}

		empIDStr := strings.TrimSpace(record[0])
		dateStr := strings.TrimSpace(record[1])
		hoursStr := strings.TrimSpace(record[2])
		status := strings.TrimSpace(record[3])

		empID := empIDStr
		hours, _ := strconv.ParseFloat(hoursStr, 64)

		parsedDate, parseErr := time.Parse("2006-01-02", dateStr)
		if parseErr != nil {
			continue // Skip rows with invalid date format
		}

		attendance := &domain.AttendanceRecord{
			EmployeeID: empID,
			Date:       parsedDate,
			TotalHours: hours,
			Status:     status,
		}

		records = append(records, *attendance)
	}

	// Bulk Create should be implemented in repo, but for now we iterate
	for _, rec := range records {
		if err := u.attendanceRepo.Create(ctx, &rec); err != nil {
			return err
		}
	}

	return nil
}
