# SOP: Notification System

> **Actor:** Iris (integration) + Brian (backend) + Fiona (frontend)
> **Trigger:** Automated or user-triggered notifications across channels

## Channels
1. **In-App** — Bell icon notifications in web/mobile dashboard
2. **Zalo ZNS** — Transactional messages to customers via Zalo
3. **Email** — Formal notifications (contracts, invoices, reports)
4. **Push** — Mobile push notifications for sales field force

## Event → Notification Map

| Event | Recipients | Channels | Template |
|-------|-----------|----------|----------|
| Booking created | Customer, Sales, Team Lead | In-App, Zalo ZNS | `booking_confirmation` |
| Deposit received | Customer, Sales, Accountant | In-App, Zalo ZNS, Email | `deposit_receipt` |
| Contract ready for signing | Customer, Sales, Director | In-App, Email | `contract_ready` |
| Payment due reminder | Customer | Zalo ZNS, Email | `payment_reminder` |
| Payment received | Customer, Accountant | In-App, Zalo ZNS | `payment_received` |
| Commission approved | Sales, Team Lead | In-App | `commission_approved` |
| Commission paid | Sales | In-App, Zalo ZNS | `commission_paid` |
| Deal cancelled | Customer, Sales, BM, Director | In-App, Email | `deal_cancelled` |
| Attendance anomaly | Staff, HR Manager | In-App | `attendance_alert` |
| Target achievement | Sales, Team Lead, BM | In-App | `target_milestone` |
| System alert (SEV1/2) | All admins | In-App, Email | `system_alert` |

## Notification Entity
```prisma
model Notification {
  id          String   @id @default(uuid(7))
  userId      String   @map("user_id")
  type        String   // Event type from table above
  title       String
  body        String
  metadata    Json?    // { dealId, amount, etc. }
  channel     String   // IN_APP, ZALO_ZNS, EMAIL, PUSH
  status      String   // PENDING, SENT, FAILED, READ
  sentAt      DateTime? @map("sent_at")
  readAt      DateTime? @map("read_at")
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("notifications")
}
```

## Zalo ZNS Integration (via Iris)
```
POST https://business.openapi.zalo.me/message/template
Headers: access_token: {ZALO_ZNS_TOKEN}
Body: { phone, template_id, template_data: { customer_name, amount, ... } }
```
- Template IDs registered with Zalo Business
- Rate limit: 500 msgs/day (standard tier)
- Fallback: if Zalo fails → queue Email

## MANDATORY RULES
- ALL notification sends must be async (via RabbitMQ queue)
- NEVER block API response waiting for notification delivery
- Log every notification attempt (SyncLog via Iris)
- Customer-facing messages must be bilingual (vi primary, en optional)
