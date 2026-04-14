package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	hrHTTP "github.com/vctplatform/sgroup-erp/modules/hr/api/internal/delivery/http"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/delivery/http/middleware"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/infrastructure/database"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/infrastructure/jobs"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/repository"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/usecase"
)

func main() {
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No .env file found, using system environment")
	}
	log.Println("Starting SGroup ERP - HR Module API (Back-office)...")

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=erp_admin password=erp_password dbname=sgroup_erp port=5433 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
		log.Println("DATABASE_URL not set, falling back to default local connection")
	}

	db, err := database.InitDB(dsn)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// 2. Setup Layered Architecture
	empRepo := repository.NewEmployeeRepository(db)
	deptRepo := repository.NewDepartmentRepository(db)
	teamRepo := repository.NewTeamRepository(db)
	posRepo := repository.NewPositionRepository(db)
	attRepo := repository.NewAttendanceRepository(db)
	leaveRepo := repository.NewLeaveRepository(db)
	payrollRepo := repository.NewPayrollRepository(db)

	empUC := usecase.NewEmployeeUseCase(empRepo)
	payrollUC := usecase.NewPayrollEngineUseCase(payrollRepo, attRepo)
	orgUC := usecase.NewOrgConfigUseCase(deptRepo, teamRepo, posRepo)
	attUC := usecase.NewAttendanceUseCase(attRepo)
	leaveUC := usecase.NewLeaveUseCase(leaveRepo)

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
	hrHTTP.NewOrgConfigHandler(router, orgUC)
	hrHTTP.NewAttendanceHandler(router, attUC)
	hrHTTP.NewLeaveHandler(router, leaveUC)

	// 5. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("Server listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
