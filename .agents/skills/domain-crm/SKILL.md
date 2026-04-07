---
name: CRM Integration (BizFly)
description: Tích hợp BizFly CRM cho SGROUP ERP — đồng bộ leads, contacts, deals, và campaign tracking
---

# CRM Integration Skill — SGROUP ERP (BizFly)

## Role Overview
Skill quản lý việc tích hợp với BizFly CRM — đồng bộ dữ liệu khách hàng, leads, deals giữa SGROUP ERP và BizFly.

## Integration Architecture
```
SGROUP ERP Backend
       │
       ├── BizFlySyncService (Scheduled Jobs)
       │     ├── Pull: Lấy leads mới từ BizFly → DB
       │     ├── Push: Đẩy deal updates → BizFly
       │     └── Reconcile: Đối soát data 2 chiều
       │
       └── BizFlyWebhookController (Real-time)
             └── Nhận webhook events từ BizFly
```

## Core Service Pattern
```typescript
@Injectable()
export class BizFlySyncService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get apiUrl() {
    return this.configService.get('BIZFLY_API_URL');
  }

  private get apiKey() {
    return this.configService.get('BIZFLY_API_KEY');
  }

  // Pull leads từ BizFly
  async syncLeadsFromBizFly(): Promise<SyncResult> {
    const lastSync = await this.getLastSyncTimestamp('leads');
    const response = await this.httpService.axiosRef.get(
      `${this.apiUrl}/leads`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        params: { updated_after: lastSync.toISOString() }
      }
    );

    let created = 0, updated = 0, errors = 0;
    
    for (const bizflyLead of response.data.data) {
      try {
        await this.prisma.lead.upsert({
          where: { externalId: bizflyLead.id },
          create: this.mapBizFlyToLead(bizflyLead),
          update: this.mapBizFlyToLeadUpdate(bizflyLead),
        });
        created++;
      } catch (error) {
        errors++;
        this.logger.error(`Sync lead ${bizflyLead.id} failed`, error);
      }
    }

    await this.updateSyncTimestamp('leads');
    return { created, updated, errors };
  }

  // Push deal updates lên BizFly
  async pushDealToBizFly(dealId: string): Promise<void> {
    const deal = await this.prisma.deal.findUniqueOrThrow({
      where: { id: dealId },
      include: { customer: true, product: true }
    });

    await this.httpService.axiosRef.post(
      `${this.apiUrl}/deals`,
      this.mapDealToBizFly(deal),
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );
  }
}
```

## Sync Strategy
- **Scheduled Pull**: Mỗi 15 phút pull leads mới từ BizFly (BullMQ cron job)
- **Event Push**: Push ngay khi deal status thay đổi (Event-driven)
- **Full Reconcile**: Mỗi đêm 2AM chạy full data reconciliation
- **Retry**: 3 lần retry với exponential backoff (1s, 5s, 30s)
- **Circuit Breaker**: Ngắt kết nối nếu BizFly API fail > 5 lần liên tiếp

## Error Handling
```typescript
// Dedicated sync log table
model SyncLog {
  id        String   @id @default(uuid(7))
  source    String   // 'bizfly'
  entity    String   // 'lead', 'deal'
  action    String   // 'pull', 'push'
  status    String   // 'success', 'error'
  errorMsg  String?  @map("error_msg")
  payload   Json?
  createdAt DateTime @default(now()) @map("created_at")
  @@map("sync_logs")
}
```

## API Endpoints
```
POST   /api/bizfly/sync/leads          # Manual trigger sync leads
POST   /api/bizfly/sync/deals          # Manual trigger sync deals
GET    /api/bizfly/sync/status         # Trạng thái sync gần nhất
POST   /api/bizfly/webhooks            # Nhận webhook từ BizFly
```

## Environment Variables
```env
BIZFLY_API_URL=https://api.bizfly.vn/crm/v1
BIZFLY_API_KEY=your-api-key-here
BIZFLY_WEBHOOK_SECRET=webhook-signing-secret
BIZFLY_SYNC_INTERVAL_MS=900000  # 15 minutes
```

## 🚨 MANDATORY RULES
- KHÔNG lưu BizFly API key trong code — chỉ qua `.env`
- Retry logic BẮT BUỘC cho mọi external API call
- Log mọi sync operation vào `SyncLog` table
- Webhook endpoint phải verify signature
