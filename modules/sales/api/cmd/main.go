package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/events"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/handler"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/repository"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/service"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("[Sales API] No .env file found, using system environment variables")
	}

	// ═══ DATABASE ═══
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=sgroup_erp port=5432 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().In(time.FixedZone("ICT", 7*60*60))
		},
		PrepareStmt: true, // Cache prepared statements for performance
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		log.Fatalf("[Sales API] Failed to connect database: %v", err)
	}

	// ═══ CONNECTION POOL CONFIG ═══
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("[Sales API] Failed to get underlying DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	// ═══ AUTO MIGRATE ═══
	// NOTE: In production, replace with versioned migrations (golang-migrate/goose)
	log.Println("[Sales API] Running database migrations...")
	err = db.AutoMigrate(
		// Core models
		&model.SalesTeam{},
		&model.Customer{},
		&model.Transaction{},
		&model.Commission{},
		&model.CommissionRule{},
		&model.TransactionHistory{},
		// Ops models
		&model.SalesStaff{},
		&model.DimProject{},
		&model.SalesDeal{},
		&model.SalesBooking{},
		&model.SalesDeposit{},
		&model.SalesTarget{},
		// Fact tables
		&model.FactSalesDaily{},
		&model.FactPipelineSnapshot{},
	)
	if err != nil {
		log.Fatalf("[Sales API] Failed to migrate database: %v", err)
	}
	log.Println("[Sales API] Database migrations completed successfully")

	// ═══ SEED DEFAULT COMMISSION RULES ═══
	seedDefaultCommissionRules(db)

	// ═══ DEPENDENCY INJECTION ═══
	eventBus := events.GetEventBus()

	txRepo := repository.NewTransactionRepository(db)
	commRepo := repository.NewCommissionRepository(db)
	customerRepo := repository.NewCustomerRepository(db)
	opsRepo := repository.NewSalesOpsRepository(db)

	txSvc := service.NewTransactionService(txRepo, commRepo)
	customerSvc := service.NewCustomerService(customerRepo)
	opsSvc := service.NewSalesOpsService(opsRepo, eventBus)

	salesHandler := handler.NewSalesHandler(txSvc)
	customerHandler := handler.NewCustomerHandler(customerSvc)
	dashboardHandler := handler.NewDashboardHandler(db)
	opsHandler := handler.NewSalesOpsHandler(opsSvc)

	// ═══ GIN ROUTER ═══
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	// ═══ CORS (hardened) ═══
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"http://localhost:3002",
		"http://localhost:3003",
		"http://localhost:3004",
	}
	if extraOrigins := os.Getenv("CORS_ORIGINS"); extraOrigins != "" {
		allowedOrigins = append(allowedOrigins, extraOrigins)
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ═══ HEALTH CHECK ═══
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"module":  "sales",
			"version": "2.0.0",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// ═══ REGISTER ROUTES ═══
	api := r.Group("/api/v1")
	salesHandler.RegisterRoutes(api)
	customerHandler.RegisterRoutes(api)
	dashboardHandler.RegisterRoutes(api)
	opsHandler.RegisterRoutes(api)

	// ═══ START SERVER ═══
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8083"
	}

	log.Printf("[Sales API] ═══════════════════════════════════════")
	log.Printf("[Sales API]  SGroup ERP — Sales Module API v2.0")
	log.Printf("[Sales API]  Listening on :%s", port)
	log.Printf("[Sales API]  Endpoints: %d routes registered", len(r.Routes()))
	log.Printf("[Sales API] ═══════════════════════════════════════")

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("[Sales API] Failed to run server: %v", err)
	}
}

// seedDefaultCommissionRules ensures default commission rates exist.
func seedDefaultCommissionRules(db *gorm.DB) {
	var count int64
	db.Model(&model.CommissionRule{}).Count(&count)
	if count > 0 {
		return
	}

	defaults := []model.CommissionRule{
		{Role: "STAFF", Percentage: 2.0, IsActive: true, CreatedBy: "system"},
		{Role: "MANAGER", Percentage: 0.5, IsActive: true, CreatedBy: "system"},
		{Role: "DIRECTOR", Percentage: 0.2, IsActive: true, CreatedBy: "system"},
	}

	for i := range defaults {
		if err := db.Create(&defaults[i]).Error; err != nil {
			log.Printf("[Sales API] Warning: Failed to seed commission rule %s: %v", defaults[i].Role, err)
		}
	}
	log.Println("[Sales API] Seeded default commission rules (STAFF: 2%, MANAGER: 0.5%, DIRECTOR: 0.2%)")
}
