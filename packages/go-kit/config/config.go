// Package config provides environment variable loading and typed config parsing.
//
// Usage:
//
//	cfg := config.MustLoad()
//	fmt.Println(cfg.Port, cfg.DatabaseURL)
package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// AppConfig holds common configuration shared by all microservices.
type AppConfig struct {
	// Server
	Port        string
	Environment string // "development", "staging", "production"

	// Database
	DatabaseURL string

	// Auth
	JWTSecret string

	// CORS
	AllowedOrigins string
}

// Load reads from .env file (if present) and environment variables.
func Load() (*AppConfig, error) {
	// Load .env file silently — it's OK if it doesn't exist in production
	_ = godotenv.Load()

	cfg := &AppConfig{
		Port:           getEnvOrDefault("PORT", "8080"),
		Environment:    getEnvOrDefault("ENVIRONMENT", "development"),
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		JWTSecret:      os.Getenv("JWT_SECRET"),
		AllowedOrigins: getEnvOrDefault("ALLOWED_ORIGINS", "http://localhost:5173"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("go-kit/config: DATABASE_URL is required")
	}

	return cfg, nil
}

// MustLoad calls Load and panics on error. Use in main().
func MustLoad() *AppConfig {
	cfg, err := Load()
	if err != nil {
		panic(fmt.Sprintf("go-kit/config: %v", err))
	}
	return cfg
}

// ── Helpers ─────────────────────────────────────────────

func getEnvOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// GetEnvAsInt reads an env var as integer with a fallback.
func GetEnvAsInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return i
}

// GetEnvAsBool reads an env var as boolean with a fallback.
func GetEnvAsBool(key string, fallback bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return b
}
