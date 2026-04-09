package usecase

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
)

type BulkUploadUseCase interface {
	ProcessAttendanceCSV(ctx context.Context, reader io.Reader) (int, error)
}

type bulkUploadUseCase struct {
	// Let's assume we have an attendance repo in the future, for now we will interact via a generic DB repo
	// or create a dedicated attendance repo. To keep this focused, we'll use a transaction directly or an attendance repo.
}

func NewBulkUploadUseCase() BulkUploadUseCase {
	return &bulkUploadUseCase{}
}

func (uc *bulkUploadUseCase) ProcessAttendanceCSV(ctx context.Context, reader io.Reader) (int, error) {
	csvReader := csv.NewReader(reader)
	
	// Read header 
	// Expected format: EmployeeID, Date, TotalHours, Status
	_, err := csvReader.Read()
	if err != nil {
		return 0, fmt.Errorf("failed to read CSV header: %w", err)
	}

	recordsCount := 0

	for {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue // Skip malformed rows
		}

		if len(record) < 4 {
			continue
		}

		empIDStr := strings.TrimSpace(record[0])
		dateStr := strings.TrimSpace(record[1])
		hoursStr := strings.TrimSpace(record[2])
		status := strings.TrimSpace(record[3])

		empID, _ := strconv.ParseUint(empIDStr, 10, 32)
		hours, _ := strconv.ParseFloat(hoursStr, 64)

		attendance := &domain.AttendanceRecord{
			EmployeeID: uint(empID),
			Date:       dateStr,
			TotalHours: hours,
			Status:     status,
		}

		// TODO: Save 'attendance' to Database using GORM Batch Insert or individual inserts in goroutines.
		_ = attendance
		recordsCount++
	}

	return recordsCount, nil
}
