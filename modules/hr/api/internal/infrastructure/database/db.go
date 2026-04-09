package database

import (
	"fmt"
	"log"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// InitDB initializes the database connection and auto-migrates models
func InitDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate the HR domain models
	err = db.AutoMigrate(
		&domain.Department{},
		&domain.Position{},
		&domain.Employee{},
		&domain.EmploymentContract{},
		&domain.AttendanceRecord{},
		&domain.PayrollRun{},
		&domain.Payslip{},
		&domain.AuditLog{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	log.Println("Database connection established and models auto-migrated successfully (HR Module).")
	return db, nil
}
