package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/middleware"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/service"
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

type SalesHandler struct {
	txSvc service.TransactionService
}

func NewSalesHandler(txSvc service.TransactionService) *SalesHandler {
	return &SalesHandler{txSvc: txSvc}
}

func (h *SalesHandler) RegisterRoutes(r *gin.RouterGroup) {
	txRoutes := r.Group("/transactions")
	txRoutes.Use(middleware.AuthMiddleware())
	{
		// NVKD
		staff := txRoutes.Group("")
		staff.Use(middleware.RoleGuard("sales_staff", "sales_manager", "admin"))
		{
			staff.POST("/request-lock", h.RequestLock)
			staff.GET("/me", h.ListMyTransactions)
			staff.POST("/:id/deposit", h.MarkDeposit)
			staff.POST("/:id/sold", h.MarkSold)
		}

		// Manager
		mgr := txRoutes.Group("")
		mgr.Use(middleware.RoleGuard("sales_manager", "admin"))
		{
			mgr.POST("/:id/approve-lock", h.ApproveLock)
			mgr.POST("/:id/reject-lock", h.RejectLock)
			mgr.GET("/team", h.ListTeamTransactions)
		}
	}
}

func (h *SalesHandler) RequestLock(c *gin.Context) {
	var req model.Transaction
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("userID")
	teamID, _ := c.Get("teamID")
	req.SalesStaffID = userID.(string)
	req.SalesTeamID = teamID.(string)

	created, err := h.txSvc.RequestLock(c.Request.Context(), &req)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, wrapper{Data: created})
}

func (h *SalesHandler) ApproveLock(c *gin.Context) {
	id := c.Param("id")
	managerID, _ := c.Get("userID")

	err := h.txSvc.ApproveLock(c.Request.Context(), id, managerID.(string))
	if err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Duyệt thành công!"}})
}

func (h *SalesHandler) RejectLock(c *gin.Context) {
	id := c.Param("id")
	managerID, _ := c.Get("userID")

	err := h.txSvc.RejectLock(c.Request.Context(), id, managerID.(string))
	if err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Đã từ chối phiếu yêu cầu!"}})
}

func (h *SalesHandler) MarkDeposit(c *gin.Context) {
	id := c.Param("id")
	staffID, _ := c.Get("userID")

	err := h.txSvc.MarkDeposit(c.Request.Context(), id, staffID.(string))
	if err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Đã ghi nhận cọc thành công!"}})
}

func (h *SalesHandler) MarkSold(c *gin.Context) {
	id := c.Param("id")
	staffID, _ := c.Get("userID")

	err := h.txSvc.MarkSold(c.Request.Context(), id, staffID.(string))
	if err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: map[string]string{"message": "Giao dịch thành công, đã chốt bán!"}})
}

func (h *SalesHandler) ListMyTransactions(c *gin.Context) {
	userID, _ := c.Get("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	txs, total, err := h.txSvc.ListMyTransactions(c.Request.Context(), userID.(string), page, limit)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: txs, Meta: map[string]interface{}{"total": total, "page": page}})
}

func (h *SalesHandler) ListTeamTransactions(c *gin.Context) {
	teamID, _ := c.Get("teamID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	txs, total, err := h.txSvc.ListTeamTransactions(c.Request.Context(), teamID.(string), page, limit)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: txs, Meta: map[string]interface{}{"total": total, "page": page}})
}
