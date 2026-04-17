package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/middleware"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/service"
)

type SalesOpsHandler struct {
	svc service.SalesOpsService
}

func NewSalesOpsHandler(svc service.SalesOpsService) *SalesOpsHandler {
	return &SalesOpsHandler{svc: svc}
}

func (h *SalesOpsHandler) RegisterRoutes(r *gin.RouterGroup) {
	ops := r.Group("/sales-ops")
	ops.Use(middleware.AuthMiddleware()) // require login

	// Bookings
	ops.GET("/bookings", h.GetBookings)
	ops.POST("/bookings", h.CreateBooking)
	ops.PATCH("/bookings/:id", h.UpdateBooking)
	ops.POST("/bookings/:id/approve", h.ApproveBooking)
	ops.POST("/bookings/:id/reject", h.RejectBooking)

	// Deposits
	ops.GET("/deposits", h.GetDeposits)
	ops.POST("/deposits", h.CreateDeposit)
	ops.PATCH("/deposits/:id", h.UpdateDeposit)
	ops.POST("/deposits/:id/confirm", h.ConfirmDeposit)
	ops.POST("/deposits/:id/cancel", h.CancelDeposit)

	// Deals
	ops.GET("/deals", h.GetDeals)
	ops.POST("/deals", h.CreateDeal)

	// Activities
	ops.GET("/activities", h.GetActivities)
	ops.POST("/activities", h.CreateActivity)
}

func getUserContext(c *gin.Context) service.UserContext {
	id, _ := c.Get("userId")
	name, _ := c.Get("userName")
	role, _ := c.Get("role")
	salesRole, _ := c.Get("salesRole")
	teamId, _ := c.Get("teamId")
	staffId, _ := c.Get("staffId")

	ctx := service.UserContext{}
	if id != nil { ctx.ID = id.(string) }
	if name != nil { ctx.Name = name.(string) }
	if role != nil { ctx.Role = role.(string) }
	if salesRole != nil { ctx.SalesRole = salesRole.(string) }
	if teamId != nil { 
		tStr := teamId.(string)
		ctx.TeamID = &tStr 
	}
	if staffId != nil { 
		sStr := staffId.(string)
		ctx.StaffID = &sStr 
	}
	return ctx
}

// Bookings
func (h *SalesOpsHandler) GetBookings(c *gin.Context) {
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	ctx := getUserContext(c)
	list, err := h.svc.GetBookings(filters, ctx)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: list})
}

func (h *SalesOpsHandler) CreateBooking(c *gin.Context) {
	var body model.SalesBooking
	if err := c.ShouldBindJSON(&body); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	ctx := getUserContext(c)
	if err := h.svc.CreateBooking(&body, ctx); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, wrapper{Data: body})
}

func (h *SalesOpsHandler) UpdateBooking(c *gin.Context) {
	id := c.Param("id")
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	ctx := getUserContext(c)
	if err := h.svc.UpdateBooking(id, body, ctx); err != nil {
		sendError(c, http.StatusForbidden, err.Error()) // using 403 as generic mapped
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: "success"})
}

func (h *SalesOpsHandler) ApproveBooking(c *gin.Context) {
	id := c.Param("id")
	ctx := getUserContext(c)
	if err := h.svc.ApproveBooking(id, ctx); err != nil {
		sendError(c, http.StatusForbidden, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: "approved"})
}

func (h *SalesOpsHandler) RejectBooking(c *gin.Context) {
	id := c.Param("id")
	ctx := getUserContext(c)
	if err := h.svc.RejectBooking(id, ctx); err != nil {
		sendError(c, http.StatusForbidden, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: "rejected"})
}

// Deposits
func (h *SalesOpsHandler) GetDeposits(c *gin.Context) {
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	ctx := getUserContext(c)
	list, err := h.svc.GetDeposits(filters, ctx)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: list})
}

func (h *SalesOpsHandler) CreateDeposit(c *gin.Context) {
	var body model.SalesDeposit
	if err := c.ShouldBindJSON(&body); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	ctx := getUserContext(c)
	if err := h.svc.CreateDeposit(&body, ctx); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, wrapper{Data: body})
}

func (h *SalesOpsHandler) UpdateDeposit(c *gin.Context) {
	id := c.Param("id")
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	ctx := getUserContext(c)
	if err := h.svc.UpdateDeposit(id, body, ctx); err != nil {
		sendError(c, http.StatusForbidden, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: "success"})
}

func (h *SalesOpsHandler) ConfirmDeposit(c *gin.Context) {
	id := c.Param("id")
	ctx := getUserContext(c)
	if err := h.svc.ConfirmDeposit(id, ctx); err != nil {
		sendError(c, http.StatusForbidden, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: "confirmed"})
}

func (h *SalesOpsHandler) CancelDeposit(c *gin.Context) {
	id := c.Param("id")
	ctx := getUserContext(c)
	if err := h.svc.CancelDeposit(id, ctx); err != nil {
		sendError(c, http.StatusForbidden, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: "cancelled"})
}

// Deals
func (h *SalesOpsHandler) GetDeals(c *gin.Context) {
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["stage"] = status
	}
	ctx := getUserContext(c)
	list, err := h.svc.GetDeals(filters, ctx)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: list})
}

func (h *SalesOpsHandler) CreateDeal(c *gin.Context) {
	var body model.SalesDeal
	if err := c.ShouldBindJSON(&body); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	ctx := getUserContext(c)
	if err := h.svc.CreateDeal(&body, ctx); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, wrapper{Data: body})
}

// Activities
func (h *SalesOpsHandler) GetActivities(c *gin.Context) {
	filters := make(map[string]interface{})
	ctx := getUserContext(c)
	list, err := h.svc.GetActivities(filters, ctx)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, wrapper{Data: list})
}

func (h *SalesOpsHandler) CreateActivity(c *gin.Context) {
	var body model.SalesActivity
	if err := c.ShouldBindJSON(&body); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	body.Points = body.PostsCount*2 + body.CallsCount*5 + body.NewLeads*10 + body.MeetingsMade*20 + body.SiteVisits*30

	ctx := getUserContext(c)
	if err := h.svc.CreateActivity(&body, ctx); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, wrapper{Data: body})
}
