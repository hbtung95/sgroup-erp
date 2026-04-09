package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/handler"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/repository"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/service"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/infrastructure/messaging"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system variables")
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN is required in environment")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Auto Migrate the schema - ensure db is consistent
	err = db.AutoMigrate(&model.Project{}, &model.Product{}, &model.LegalDoc{}, &model.AuditLog{})
	if err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Dependency Injection
	projectRepo := repository.NewProjectRepository(db)
	productRepo := repository.NewProductRepository(db)
	docRepo := repository.NewDocRepository(db)
	auditRepo := repository.NewAuditLogRepository(db)

	eventBus := messaging.NewLocalEventBus()

	projectSvc := service.NewProjectService(projectRepo, productRepo, eventBus)
	productSvc := service.NewProductService(productRepo, auditRepo)
	docSvc := service.NewDocService(docRepo)

	h := handler.NewProjectHandler(projectSvc, productSvc, docSvc)

	// Setup Router
	r := gin.Default()
	
	// Add proper CORS middleware in real prod, skipping for simplicity here
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api/v1")
	h.RegisterRoutes(api)

	// Start Cronjob for cleaning up expired locks
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			<-ticker.C
			log.Println("[CRON] Running CleanupLocks...")
			if _, err := productSvc.CleanupLocks(context.Background()); err != nil {
				log.Printf("[CRON ERROR] Failed to cleanup locks: %v", err)
			}
		}
	}()

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Project API server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
