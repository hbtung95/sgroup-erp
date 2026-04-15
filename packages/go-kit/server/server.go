// Package server provides a pre-configured Gin server factory.
//
// Usage:
//
//	srv := server.New(server.Config{Port: "8081"})
//	srv.RegisterRoutes(func(r *gin.Engine) { ... })
//	srv.Run()
package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/packages/go-kit/middleware"
)

// Config holds server configuration.
type Config struct {
	Port           string
	Environment    string
	AllowedOrigins string
}

// Server wraps a Gin engine with graceful shutdown.
type Server struct {
	engine *gin.Engine
	config Config
}

// New creates a production-ready Gin server with standard middleware stack.
func New(cfg Config) *Server {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.New()

	// Standard middleware stack (order matters)
	engine.Use(
		middleware.RequestID(),
		middleware.Logger(),
		middleware.Recovery(),
		middleware.CORS(cfg.AllowedOrigins),
	)

	// Health check endpoint — every service gets this for free
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"time":   time.Now().UTC().Format(time.RFC3339),
		})
	})

	return &Server{engine: engine, config: cfg}
}

// Engine returns the underlying Gin engine for route registration.
func (s *Server) Engine() *gin.Engine {
	return s.engine
}

// Run starts the server with graceful shutdown on SIGINT/SIGTERM.
func (s *Server) Run() error {
	addr := fmt.Sprintf(":%s", s.config.Port)

	srv := &http.Server{
		Addr:         addr,
		Handler:      s.engine,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in background
	go func() {
		log.Printf("[go-kit/server] Listening on %s (env: %s)", addr, s.config.Environment)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[go-kit/server] Fatal: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[go-kit/server] Shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		return fmt.Errorf("go-kit/server: forced shutdown: %w", err)
	}

	log.Println("[go-kit/server] Stopped cleanly")
	return nil
}
