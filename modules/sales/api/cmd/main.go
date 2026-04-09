package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/handler"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/repository"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/service"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		// Default fallback for dev
		dsn = "host=localhost user=postgres password=postgres dbname=sgroup_erp port=5432 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Auto Migrate the schema - ensure db is consistent
	err = db.AutoMigrate(
		&model.SalesTeam{},
		&model.Customer{},
		&model.Transaction{},
		&model.Commission{},
	)
	if err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Dependency Injection
	txRepo := repository.NewTransactionRepository(db)
	commRepo := repository.NewCommissionRepository(db)
	txSvc := service.NewTransactionService(txRepo, commRepo)
	salesHandler := handler.NewSalesHandler(txSvc)

	// Setup Router
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	salesHandler.RegisterRoutes(api)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8082" // Configured to 8082
	}

	log.Printf("Sales API server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
