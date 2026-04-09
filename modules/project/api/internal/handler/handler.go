package handler

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/middleware"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/project/api/internal/service"
)

type wrapper struct {
	Data interface{} `json:"data"`
	Meta interface{} `json:"meta,omitempty"`
}

type errorWrapper struct {
	Error struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func sendError(c *gin.Context, code int, message string) {
	c.JSON(code, errorWrapper{
		Error: struct {
			Code    int    `json:"code"`
			Message string `json:"message"`
		}{Code: code, Message: message},
	})
}

type ProjectHandler struct {
	projectSvc service.ProjectService
	productSvc service.ProductService
	docSvc     service.DocService
}

func NewProjectHandler(projectSvc service.ProjectService, productSvc service.ProductService, docSvc service.DocService) *ProjectHandler {
	return &ProjectHandler{projectSvc: projectSvc, productSvc: productSvc, docSvc: docSvc}
}

func (h *ProjectHandler) RegisterRoutes(r *gin.RouterGroup) {
	// By default, make them secure instead of public
	// For simulation: we leave GET as open, while POST/PUT/DELETE require permissions
	projects := r.Group("/projects")
	{
		projects.GET("", h.ListProjects)
		projects.GET("/:id", h.GetProject)
		projects.GET("/:id/products", h.ListProducts)
		projects.GET("/:id/docs", h.ListDocs)
		
		// Protected
		protectedPj := projects.Group("")
		protectedPj.Use(middleware.AuthMiddleware())
		protectedPj.Use(middleware.RoleGuard("admin", "project_manager"))
		{
			protectedPj.POST("", h.CreateProject)
			protectedPj.PUT("/:id", h.UpdateProject)
			protectedPj.DELETE("/:id", h.DeleteProject)
			protectedPj.POST("/:id/products", h.CreateProduct)
			protectedPj.POST("/:id/docs", h.UploadDoc)
			protectedPj.DELETE("/:id/docs/:docId", h.DeleteDoc)
		}
	}

	products := r.Group("/products")
	{
		protectedPd := products.Group("")
		protectedPd.Use(middleware.AuthMiddleware()) // Requires simply to be logged in to lock
		{
			protectedPd.POST("/:id/lock", h.LockProduct)
			protectedPd.POST("/:id/unlock", h.UnlockProduct)
			protectedPd.POST("/:id/deposit", h.DepositProduct)
			protectedPd.POST("/:id/sold", h.SoldProduct)
		}

		adminPd := products.Group("")
		adminPd.Use(middleware.AuthMiddleware())
		adminPd.Use(middleware.RoleGuard("admin"))
		{
			adminPd.DELETE("/:id", h.DeleteProduct)
		}
	}
}

func (h *ProjectHandler) ListProjects(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.Query("search") // Lấy từ query param

	projects, total, err := h.projectSvc.ListProjects(c.Request.Context(), page, limit, search)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, wrapper{
		Data: projects,
		Meta: map[string]interface{}{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var req model.Project
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	created, err := h.projectSvc.CreateProject(c.Request.Context(), &req)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, wrapper{Data: created})
}

func (h *ProjectHandler) GetProject(c *gin.Context) {
	id := c.Param("id")
	project, err := h.projectSvc.GetProject(c.Request.Context(), id)
	if err != nil {
		sendError(c, http.StatusNotFound, "Project not found")
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: project})
}

func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	var req model.Project
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	req.ID = c.Param("id")

	err := h.projectSvc.UpdateProject(c.Request.Context(), &req)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: req})
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	id := c.Param("id")
	err := h.projectSvc.DeleteProject(c.Request.Context(), id)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Deleted successfully"}})
}

func (h *ProjectHandler) ListProducts(c *gin.Context) {
	projectID := c.Param("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	products, total, err := h.productSvc.ListProjectProducts(c.Request.Context(), projectID, page, limit)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, wrapper{
		Data: products,
		Meta: map[string]interface{}{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

func (h *ProjectHandler) CreateProduct(c *gin.Context) {
	var req model.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	req.ProjectID = c.Param("id")

	created, err := h.productSvc.CreateProduct(c.Request.Context(), &req)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Trigger sync project units (in real production, send to queue, here we do synchronously for simplicity)
	go h.projectSvc.SyncProjectUnits(context.Background(), req.ProjectID)

	c.JSON(http.StatusCreated, wrapper{Data: created})
}

type LockProductRequest struct {
	BookedBy string `json:"bookedBy" binding:"required"`
}

func (h *ProjectHandler) LockProduct(c *gin.Context) {
	id := c.Param("id")
	var req LockProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.productSvc.LockProduct(c.Request.Context(), id, req.BookedBy, 24) // 24 hours lock
	if err != nil {
		sendError(c, http.StatusConflict, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Product locked successfully"}})
}

type UnlockProductRequest struct {
	RequestedBy string `json:"requestedBy" binding:"required"`
	IsAdmin     bool   `json:"isAdmin"`
}

func (h *ProjectHandler) UnlockProduct(c *gin.Context) {
	id := c.Param("id")
	var req UnlockProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.productSvc.UnlockProduct(c.Request.Context(), id, req.RequestedBy, req.IsAdmin)
	if err != nil {
		sendError(c, http.StatusConflict, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Product unlocked successfully"}})
}

type DepositProductRequest struct {
	RequestedBy string `json:"requestedBy" binding:"required"`
}

func (h *ProjectHandler) DepositProduct(c *gin.Context) {
	id := c.Param("id")
	var req DepositProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.productSvc.DepositProduct(c.Request.Context(), id, req.RequestedBy)
	if err != nil {
		sendError(c, http.StatusConflict, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Product deposited successfully"}})
}

type SoldProductRequest struct {
	RequestedBy string `json:"requestedBy" binding:"required"`
}

func (h *ProjectHandler) SoldProduct(c *gin.Context) {
	id := c.Param("id")
	var req SoldProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.productSvc.SoldProduct(c.Request.Context(), id, req.RequestedBy)
	if err != nil {
		sendError(c, http.StatusConflict, err.Error())
		return
	}
	
	// Trigger sync project units (In real system, event bus should capture 'sold' and update project implicitly)
	// We'll keep it simple here.
	var product *model.Product
	if p, _, _ := h.productSvc.ListProjectProducts(c.Request.Context(), id, 1, 1); len(p) > 0 {
		product = &p[0] // just for project ID
	}
	if product != nil {
	    go h.projectSvc.SyncProjectUnits(context.Background(), product.ProjectID)
    }

	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Product sold successfully"}})
}

func (h *ProjectHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	err := h.productSvc.DeleteProduct(c.Request.Context(), id)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Product deleted successfully"}})
}

func (h *ProjectHandler) ListDocs(c *gin.Context) {
	projectID := c.Param("id")
	docs, err := h.docSvc.ListDocs(c.Request.Context(), projectID)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: docs})
}

// In a real app we'd parse multipart form and save to S3. Here we simulate the metadata creation.
func (h *ProjectHandler) UploadDoc(c *gin.Context) {
	var req model.LegalDoc
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	req.ProjectID = c.Param("id")
	
	// Default uploader if available via middleware
	if userID, exists := c.Get("userID"); exists {
		req.UploadedBy = userID.(string)
	}

	created, err := h.docSvc.UploadDoc(c.Request.Context(), &req)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, wrapper{Data: created})
}

func (h *ProjectHandler) DeleteDoc(c *gin.Context) {
	docID := c.Param("docId")

	err := h.docSvc.DeleteDoc(c.Request.Context(), docID)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Document deleted successfully"}})
}
