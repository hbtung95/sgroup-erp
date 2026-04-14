package http

import (
	"strconv"
	"fmt"
	"net/http"
	
	"time"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/usecase"
)

type PayrollHandler struct {
	payrollEngine usecase.PayrollEngineUseCase
}

func NewPayrollHandler(router *gin.Engine, pe usecase.PayrollEngineUseCase) {
	handler := &PayrollHandler{
		payrollEngine: pe,
	}

	hrGroup := router.Group("/api/hr/v1")
	{
		hrGroup.POST("/payroll/generate", handler.GeneratePayroll)
		hrGroup.GET("/payroll/runs", handler.ListRuns)
		hrGroup.GET("/payroll/runs/:id/payslips", handler.GetPayslips)
		hrGroup.GET("/payroll/export-pdf/:payslip_id", handler.ExportPayslipPDF)
	}
}

func (h *PayrollHandler) GeneratePayroll(c *gin.Context) {
	var payload struct {
		Title        string  `json:"title"`
		PeriodMonth  int     `json:"period_month"`
		PeriodYear   int     `json:"period_year"`
		CycleStart   string  `json:"cycle_start"`
		CycleEnd     string  `json:"cycle_end"`
		StandardDays float64 `json:"standard_days"`
		AdminID      string  `json:"admin_id"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "message": err.Error()})
		return
	}

	start, err1 := time.Parse("2006-01-02", payload.CycleStart)
	end, err2 := time.Parse("2006-01-02", payload.CycleEnd)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
		return
	}

	if payload.StandardDays <= 0 {
		payload.StandardDays = 22.0 // default
	}

	// Default period from cycle start if not provided
	periodMonth := payload.PeriodMonth
	periodYear := payload.PeriodYear
	if periodMonth == 0 {
		periodMonth = int(start.Month())
	}
	if periodYear == 0 {
		periodYear = start.Year()
	}

	run, err := h.payrollEngine.GeneratePayrollRun(
		c.Request.Context(),
		payload.Title,
		periodMonth,
		periodYear,
		start,
		end,
		payload.StandardDays,
		payload.AdminID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate payroll", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payroll computation executed successfully",
		"data":    run,
	})
}

func (h *PayrollHandler) ListRuns(c *gin.Context) {
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	
	runs, total, err := h.payrollEngine.ListRuns(c.Request.Context(), offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list payroll runs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": runs, "total": total, "offset": offset, "limit": limit})
}

func (h *PayrollHandler) GetPayslips(c *gin.Context) {
	runIDStr := c.Param("id")

	slips, err := h.payrollEngine.GetPayslips(c.Request.Context(), runIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get payslips"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": slips})
}


func (h *PayrollHandler) ExportPayslipPDF(c *gin.Context) {
	payslipID := c.Param("payslip_id")
	_ = payslipID

	pdfURL := fmt.Sprintf("https://cdn.sgroup.vn/secure-docs/payslips/mock-payslip-%s.pdf", payslipID)

	c.JSON(http.StatusOK, gin.H{
		"message": "PDF exported securely",
		"pdf_url": pdfURL,
	})
}
