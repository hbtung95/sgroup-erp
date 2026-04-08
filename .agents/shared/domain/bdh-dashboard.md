---
name: BDH Dashboard (Ban Điều Hành)
description: Dashboard tổng hợp cho Ban Điều Hành SGROUP — KPI, target tracking, drill-down analytics
---

# BDH Dashboard — SGROUP ERP

## Role Overview
Dashboard cấp C-Level cho Ban Điều Hành — tổng hợp KPI từ tất cả modules, so sánh target/actual, drill-down theo branch/team/sales.

## KPI Cards
```typescript
interface DashboardKPIs {
  revenue: {
    total: Decimal;        // Tổng doanh thu
    target: Decimal;       // Target tháng/quý
    achievement: number;   // % đạt target
    momGrowth: number;     // % tăng trưởng MoM
  };
  deals: {
    total: number;         // Tổng giao dịch
    booked: number;        // Đang giữ chỗ
    deposited: number;     // Đã cọc
    contracted: number;    // Đã ký HĐMB
    completed: number;     // Đã bàn giao
    cancelled: number;     // Đã hủy
    conversionRate: number; // Booking → Completed %
  };
  commission: {
    totalPending: Decimal;   // Hoa hồng chờ duyệt
    totalApproved: Decimal;  // Đã duyệt
    totalPaid: Decimal;      // Đã chi trả
  };
  hr: {
    totalStaff: number;
    activeStaff: number;
    avgAttendanceRate: number;
  };
  receivables: {
    totalOutstanding: Decimal; // Tổng công nợ
    overdue: Decimal;          // Quá hạn
    overdueCount: number;
  };
}
```

## Drill-Down Levels
```
Company → Branch → Team → Sales Executive
         ↓
    Project → Unit Status
```

## Charts Required
1. Revenue trend (line chart, 12 months)
2. Deal pipeline funnel (funnel chart)
3. Top sales performance (bar chart, ranked)
4. Branch comparison (grouped bar chart)
5. Product status heatmap (per project)
6. Commission payout timeline
7. AR aging report (stacked bar)

## API Endpoints
```
GET    /api/dashboard/kpi                   # KPI summary
GET    /api/dashboard/revenue?period=monthly # Revenue trend
GET    /api/dashboard/pipeline              # Deal funnel
GET    /api/dashboard/top-sales?limit=10    # Top performers
GET    /api/dashboard/branch-comparison     # Branch KPIs
GET    /api/dashboard/product-status        # Per-project heatmap
GET    /api/dashboard/commission-summary    # Commission overview
GET    /api/dashboard/receivables-aging     # AR aging
```

## 🚨 MANDATORY RULES
- Dashboard is READ-ONLY — aggregation queries only, NEVER write
- Use Redis cache for expensive aggregations (TTL: 5 min)
- RBAC: CEO/Director see everything, BM sees own branch only
- Data visualization: Use ECharts library
- All money display: VND format with toLocaleString('vi-VN')
