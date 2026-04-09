package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	hrHTTP "github.com/vctplatform/sgroup-erp/modules/hr/api/internal/delivery/http"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/delivery/http/middleware"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/infrastructure/database"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/infrastructure/jobs"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/repository"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/usecase"
)

func main() {
	log.Println("Starting SGroup ERP - HR Module API (Back-office)...")

	// 1. Initialize Database
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=sgroup_hr port=5432 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
		log.Println("DATABASE_URL not set, falling back to default local connection")
	}

	db, err := database.InitDB(dsn)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// 2. Setup Layered Architecture
	empRepo := repository.NewEmployeeRepository(db)
	_ = repository.NewDepartmentRepository(db) // For future use

	empUC := usecase.NewEmployeeUseCase(empRepo)
	payrollUC := usecase.NewPayrollEngineUseCase()

	// 3. Start Background CRON Scheduler
	scheduler := jobs.NewScheduler(db)
	scheduler.Start()

	// 4. Setup Gin Router (Gin)
	router := gin.Default()

	// CORS Middleware (simple for internal local dev)
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Role")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Attach Field-Level Security Middleware
	router.Use(middleware.FieldLevelRBAC())

	hrHTTP.NewEmployeeHandler(router, empUC)
	hrHTTP.NewPayrollHandler(router, payrollUC)

	// 5. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
