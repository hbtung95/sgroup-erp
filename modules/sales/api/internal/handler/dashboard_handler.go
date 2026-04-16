package handler

import (
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/middleware"
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"gorm.io/gorm"
)

// DashboardHandler provides real-time KPI aggregation from the database.
type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) RegisterRoutes(r *gin.RouterGroup) {
	dashRoutes := r.Group("/dashboard")
	dashRoutes.Use(middleware.AuthMiddleware())
	{
		dashRoutes.GET("/kpi", h.GetKPIs)
		dashRoutes.GET("/monthly-revenue", h.GetMonthlyRevenue)
		dashRoutes.GET("/recent-transactions", h.GetRecentTransactions)
		dashRoutes.GET("/pipeline-summary", h.GetPipelineSummary)
		dashRoutes.GET("/team-performance", h.GetTeamPerformance)
		dashRoutes.GET("/top-sellers", h.GetTopSellers)
	}
}

// GetKPIs returns aggregated KPI data from the database.
func (h *DashboardHandler) GetKPIs(c *gin.Context) {
	role, _ := c.Get("role")
	salesRole, _ := c.Get("salesRole")
	teamIDVal, _ := c.Get("teamId")
	staffIDVal, _ := c.Get("staffId")

	var roleStr string
	if role != nil { roleStr = role.(string) }
	var salesRoleStr string
	if salesRole != nil { salesRoleStr = salesRole.(string) }

	isDirector := roleStr == "admin" || salesRoleStr == "sales_director" || salesRoleStr == "ceo"
	isManager := salesRoleStr == "sales_manager"

	kpi := model.DashboardKPIResponse{}

	// Total leads (customers)
	customerQuery := h.db.Model(&model.Customer{})
	if !isDirector && !isManager {
		if staffIDVal != nil {
			customerQuery = customerQuery.Where("assigned_to = ?", staffIDVal.(string))
		}
	} else if isManager && teamIDVal != nil {
		customerQuery = customerQuery.Where("team_id = ?", teamIDVal.(string))
	}
	customerQuery.Count(&kpi.TotalLeads)

	// Deals count by stage
	dealQuery := h.db.Model(&model.SalesDeal{})
	if !isDirector && isManager && teamIDVal != nil {
		dealQuery = dealQuery.Where("team_id = ?", teamIDVal.(string))
	} else if !isDirector && !isManager && staffIDVal != nil {
		dealQuery = dealQuery.Where("staff_id = ?", staffIDVal.(string))
	}
	dealQuery.Count(&kpi.TotalDeals)
	dealQuery.Where("stage = ?", model.DealStageClosed).Count(&kpi.ClosedDeals)

	// Pending approvals (transactions in PENDING_LOCK)
	h.db.Model(&model.Transaction{}).Where("status = ?", model.TxStatusPendingLock).Count(&kpi.PendingApprovals)

	// Revenue from closed deals
	h.db.Model(&model.SalesDeal{}).Where("stage = ?", model.DealStageClosed).
		Select("COALESCE(SUM(commission), 0)").Scan(&kpi.Revenue)

	// Pipeline value (non-closed, non-lost deals)
	h.db.Model(&model.SalesDeal{}).
		Where("stage NOT IN ?", []model.DealStage{model.DealStageClosed, model.DealStageLost}).
		Select("COALESCE(SUM(deal_value), 0)").Scan(&kpi.PipelineValue)

	// Conversion rate
	if kpi.TotalLeads > 0 {
		kpi.ConversionRate = math.Round(float64(kpi.ClosedDeals)/float64(kpi.TotalLeads)*10000) / 100
	}

	// Average deal size
	if kpi.ClosedDeals > 0 {
		var totalGMV float64
		h.db.Model(&model.SalesDeal{}).Where("stage = ?", model.DealStageClosed).
			Select("COALESCE(SUM(deal_value), 0)").Scan(&totalGMV)
		kpi.AvgDealSize = totalGMV / float64(kpi.ClosedDeals)
	}

	// Active staff and teams
	h.db.Model(&model.SalesStaff{}).Where("status = ?", "ACTIVE").Count(&kpi.ActiveStaff)
	h.db.Model(&model.SalesTeam{}).Where("status = ?", "ACTIVE").Count(&kpi.TeamCount)

	// Total Activity Points
	actQuery := h.db.Model(&model.SalesActivity{})
	if !isDirector && isManager && teamIDVal != nil {
		actQuery = actQuery.Where("team_id = ?", teamIDVal.(string))
	} else if !isDirector && !isManager && staffIDVal != nil {
		actQuery = actQuery.Where("staff_id = ?", staffIDVal.(string))
	}
	actQuery.Select("COALESCE(SUM(points), 0)").Scan(&kpi.TotalActivityPoints)

	// KPIs mock target calculation
	targetPoints := float64(1000)
	targetRevenue := float64(1000000000)
	if kpi.ActiveStaff > 0 {
		if isDirector || isManager {
			targetPoints = float64(kpi.ActiveStaff) * 1000
			targetRevenue = float64(kpi.ActiveStaff) * 1000000000
		}
	}
	if targetPoints > 0 {
		kpi.PointsKPI = math.Round((kpi.TotalActivityPoints/targetPoints)*10000) / 100
	}
	if targetRevenue > 0 {
		kpi.RevenueKPI = math.Round((kpi.Revenue/targetRevenue)*10000) / 100
	}

	c.JSON(http.StatusOK, wrapper{Data: kpi})
}

// GetMonthlyRevenue returns revenue data grouped by month for chart rendering.
func (h *DashboardHandler) GetMonthlyRevenue(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, _ := strconv.Atoi(yearStr)

	var results []model.MonthlyRevenueData

	monthLabels := []string{"", "T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10", "T11", "T12"}

	h.db.Model(&model.SalesDeal{}).
		Select("year, month, COALESCE(SUM(deal_value), 0) as gmv, COALESCE(SUM(commission), 0) as revenue, COUNT(*) as deals").
		Where("year = ? AND stage = ?", year, model.DealStageClosed).
		Group("year, month").
		Order("month ASC").
		Scan(&results)

	// Fill missing months
	resultMap := make(map[int]model.MonthlyRevenueData)
	for _, r := range results {
		r.Label = monthLabels[r.Month]
		resultMap[r.Month] = r
	}

	var allMonths []model.MonthlyRevenueData
	for m := 1; m <= 12; m++ {
		if data, ok := resultMap[m]; ok {
			allMonths = append(allMonths, data)
		} else {
			allMonths = append(allMonths, model.MonthlyRevenueData{
				Year: year, Month: m, Label: monthLabels[m],
			})
		}
	}

	c.JSON(http.StatusOK, wrapper{Data: allMonths})
}

// GetRecentTransactions returns the most recent transactions.
func (h *DashboardHandler) GetRecentTransactions(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)
	if limit > 50 { limit = 50 }

	var txs []model.Transaction
	h.db.Preload("Customer").
		Order("created_at DESC").
		Limit(limit).
		Find(&txs)

	c.JSON(http.StatusOK, wrapper{Data: txs})
}

// GetPipelineSummary returns deal counts grouped by stage.
func (h *DashboardHandler) GetPipelineSummary(c *gin.Context) {
	type StageCount struct {
		Stage string `json:"stage"`
		Count int64  `json:"count"`
		Value float64 `json:"value"`
	}

	var results []StageCount
	h.db.Model(&model.SalesDeal{}).
		Select("stage, COUNT(*) as count, COALESCE(SUM(deal_value), 0) as value").
		Group("stage").
		Scan(&results)

	c.JSON(http.StatusOK, wrapper{Data: results})
}

// GetTeamPerformance returns performance metrics per team.
func (h *DashboardHandler) GetTeamPerformance(c *gin.Context) {
	type TeamPerf struct {
		TeamID      string  `json:"teamId"`
		TeamName    string  `json:"teamName"`
		TotalDeals          int64   `json:"totalDeals"`
		ClosedDeals         int64   `json:"closedDeals"`
		GMV                 float64 `json:"gmv"`
		Revenue             float64 `json:"revenue"`
		TotalActivityPoints float64 `json:"totalActivityPoints"`
		StaffCount          int64   `json:"staffCount"`
	}

	var teams []model.SalesTeam
	h.db.Where("status = ?", "ACTIVE").Find(&teams)

	var results []TeamPerf
	for _, team := range teams {
		perf := TeamPerf{TeamID: team.ID, TeamName: team.Name}
		h.db.Model(&model.SalesDeal{}).Where("team_id = ?", team.ID).Count(&perf.TotalDeals)
		h.db.Model(&model.SalesDeal{}).Where("team_id = ? AND stage = ?", team.ID, model.DealStageClosed).Count(&perf.ClosedDeals)
		h.db.Model(&model.SalesDeal{}).Where("team_id = ? AND stage = ?", team.ID, model.DealStageClosed).
			Select("COALESCE(SUM(deal_value), 0) as gmv, COALESCE(SUM(commission), 0) as revenue").
			Scan(&perf)
		h.db.Model(&model.SalesActivity{}).Where("team_id = ?", team.ID).Select("COALESCE(SUM(points), 0)").Scan(&perf.TotalActivityPoints)
		h.db.Model(&model.SalesStaff{}).Where("team_id = ? AND status = ?", team.ID, "ACTIVE").Count(&perf.StaffCount)
		results = append(results, perf)
	}

	c.JSON(http.StatusOK, wrapper{Data: results})
}

// GetTopSellers returns top performing sales staff.
func (h *DashboardHandler) GetTopSellers(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)

	type TopSeller struct {
		StaffID    string  `json:"staffId"`
		StaffName  string  `json:"staffName"`
		TeamName   string  `json:"teamName"`
		Deals      int64   `json:"deals"`
		GMV        float64 `json:"gmv"`
		Revenue    float64 `json:"revenue"`
	}

	var results []TopSeller
	h.db.Model(&model.SalesDeal{}).
		Select("staff_id, staff_name, team_name, COUNT(*) as deals, COALESCE(SUM(deal_value), 0) as gmv, COALESCE(SUM(commission), 0) as revenue").
		Where("stage = ?", model.DealStageClosed).
		Group("staff_id, staff_name, team_name").
		Order("gmv DESC").
		Limit(limit).
		Scan(&results)

	c.JSON(http.StatusOK, wrapper{Data: results})
}
