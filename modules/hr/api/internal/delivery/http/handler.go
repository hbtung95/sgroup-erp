package http

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/usecase"
)

type EmployeeHandler struct {
	uc usecase.EmployeeUseCase
}

func NewEmployeeHandler(router *gin.Engine, uc usecase.EmployeeUseCase) {
	handler := &EmployeeHandler{uc: uc}

	// API Group
	hrGroup := router.Group("/api/hr/v1")
	{
		hrGroup.POST("/employees", handler.Create)
		hrGroup.GET("/employees", handler.List)
	}
}

func (h *EmployeeHandler) Create(c *gin.Context) {
	var emp domain.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.CreateEmployee(c.Request.Context(), &emp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create employee: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": emp})
}

func (h *EmployeeHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50")) // Admin grid loads 50 naturally

	employees, total, err := h.uc.GetEmployeeList(c.Request.Context(), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load employee list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": employees,
		"meta": gin.H{
			"total": total,
			"page":  page,
			"size":  pageSize,
		},
	})
}
