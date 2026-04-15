// Package database provides PostgreSQL connection pool factory and migration helpers.
//
// Usage:
//
//	db, err := database.NewPostgres(database.Config{DSN: os.Getenv("DATABASE_URL")})
//	database.AutoMigrate(db, &Employee{}, &Department{})
package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config holds database connection parameters.
type Config struct {
	DSN             string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	LogLevel        logger.LogLevel
}

// DefaultConfig returns sensible defaults for development.
func DefaultConfig(dsn string) Config {
	return Config{
		DSN:             dsn,
		MaxOpenConns:    25,
		MaxIdleConns:    5,
		ConnMaxLifetime: 5 * time.Minute,
		LogLevel:        logger.Warn,
	}
}

// NewPostgres creates a configured GORM database connection pool.
func NewPostgres(cfg Config) (*gorm.DB, error) {
	gormCfg := &gorm.Config{
		Logger:                 logger.Default.LogMode(cfg.LogLevel),
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	}

	db, err := gorm.Open(postgres.Open(cfg.DSN), gormCfg)
	if err != nil {
		return nil, fmt.Errorf("go-kit/database: failed to connect: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("go-kit/database: failed to get sql.DB: %w", err)
	}

	// Connection pool tuning
	if cfg.MaxOpenConns > 0 {
		sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	}
	if cfg.MaxIdleConns > 0 {
		sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	}
	if cfg.ConnMaxLifetime > 0 {
		sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)
	}

	log.Println("[go-kit/database] PostgreSQL connected successfully")
	return db, nil
}

// AutoMigrate runs GORM auto-migration for the given models.
// Only use in development. Production should use versioned SQL migrations.
func AutoMigrate(db *gorm.DB, models ...interface{}) error {
	if err := db.AutoMigrate(models...); err != nil {
		return fmt.Errorf("go-kit/database: auto-migrate failed: %w", err)
	}
	log.Printf("[go-kit/database] Auto-migrated %d models", len(models))
	return nil
}

// HealthCheck pings the database to verify connectivity.
func HealthCheck(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}
