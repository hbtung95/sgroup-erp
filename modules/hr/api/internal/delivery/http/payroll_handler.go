package http

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
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
		hrGroup.POST("/payroll/calculate", handler.CalculatePayroll)
		hrGroup.GET("/payroll/export-pdf/:payslip_id", handler.ExportPayslipPDF)
	}
}

func (h *PayrollHandler) CalculatePayroll(c *gin.Context) {
	// Mock integration
	emp := &domain.Employee{
		ID:        1,
		FirstName: "Mock",
		LastName:  "Employee",
	}
	
	run := &domain.PayrollRun{
		ID:    1,
		Title: "Tháng 04/2026",
	}

	payslip, err := h.payrollEngine.CalculatePayslip(c.Request.Context(), emp, run)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate payroll"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payroll calculation executed successfully",
		"data":    payslip,
	})
}

func (h *PayrollHandler) ExportPayslipPDF(c *gin.Context) {
	payslipID := c.Param("payslip_id")
	_ = payslipID

	// In reality, this would query the DB for the Payslip, then use something like 'gofpdf' to generate it
	pdfURL := fmt.Sprintf("https://cdn.sgroup.vn/secure-docs/payslips/mock-payslip-%s.pdf", payslipID)

	c.JSON(http.StatusOK, gin.H{
		"message": "PDF exported securely",
		"pdf_url": pdfURL,
	})
}
