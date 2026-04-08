---
name: Marketing & Campaign Management
description: Quản lý chiến dịch marketing, lead attribution, ROI tracking cho SGROUP ERP
---

# Marketing & Campaign Management — SGROUP ERP

## Role Overview
Quản lý chiến dịch marketing — tracking nguồn lead, đo lường ROI, phân bổ ngân sách, gắn kết với CRM/Customer module.

## Domain Entities

### Campaign
```prisma
model Campaign {
  id            String    @id @default(uuid(7))
  code          String    @unique // "MKT-Q1-2026-FB"
  name          String
  channel       CampaignChannel
  projectId     String?   @map("project_id") // Chiến dịch cho dự án cụ thể
  budget        Decimal   @db.Decimal(18, 4)
  spent         Decimal   @default(0) @db.Decimal(18, 4)
  startDate     DateTime  @map("start_date")
  endDate       DateTime? @map("end_date")
  status        CampaignStatus
  targetLeads   Int?      @map("target_leads")
  actualLeads   Int       @default(0) @map("actual_leads")
  targetDeals   Int?      @map("target_deals")
  actualDeals   Int       @default(0) @map("actual_deals")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  @@map("campaigns")
}

enum CampaignChannel { FACEBOOK GOOGLE ZALO TIKTOK OFFLINE REFERRAL EVENT }
enum CampaignStatus { DRAFT ACTIVE PAUSED COMPLETED }
```

## KPI Metrics
```typescript
interface CampaignMetrics {
  cpl: Decimal;           // Cost Per Lead = spent / actualLeads
  cpd: Decimal;           // Cost Per Deal = spent / actualDeals
  roi: number;            // (revenue from deals - spent) / spent * 100
  conversionRate: number; // actualDeals / actualLeads * 100
}
```

## API Endpoints
```
GET    /api/campaigns                      # DS chiến dịch
POST   /api/campaigns                      # Tạo chiến dịch
GET    /api/campaigns/:id                  # Chi tiết + metrics
PATCH  /api/campaigns/:id                  # Cập nhật
GET    /api/campaigns/report               # Báo cáo tổng hợp
GET    /api/campaigns/:id/leads            # Leads từ chiến dịch
```

## 🚨 MANDATORY RULES
- Mỗi Customer PHẢI ghi nhận source (campaign_id hoặc source channel)
- Decimal(18,4) cho budget/spent
- Lead attribution: first-touch (khách gần nhất từ campaign nào)
