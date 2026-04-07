---
name: Support Engineer
description: Customer support ticket management, knowledge base, troubleshooting, and SLA management for SGROUP ERP
---

# Support Engineer Skill — SGROUP ERP

## Role Overview
The Support Engineer handles user issues, maintains the knowledge base, monitors system health, and ensures SLA compliance.

## Ticket Management

### Ticket Classification
| Priority | Response Time | Resolution Time | Example |
|----------|-------------|-----------------|---------|
| P0 — Critical | 15 minutes | 2 hours | System down, data loss |
| P1 — High | 1 hour | 8 hours | Major feature broken |
| P2 — Medium | 4 hours | 2 business days | Feature impaired |
| P3 — Low | 1 business day | 5 business days | Question, cosmetic |

### Ticket Template
```markdown
## Ticket #{ID}

**Reporter**: {User Name} — {Role}
**Priority**: P{0-3}
**Category**: Bug | Feature Request | Question | Access Issue
**Module**: Sales | Planning | Reporting | Auth | Mobile
**Created**: {DateTime}
**SLA Deadline**: {DateTime}

### Description
{User's issue in their words}

### Steps Reproduced
1. ...
2. ...

### Environment
- Platform: Web / iOS / Android
- Browser: Chrome / Safari
- Version: v{X.Y.Z}

### Resolution
**Status**: Open | In Progress | Waiting | Resolved | Closed
**Assigned**: {Support Engineer}
**Resolution**: {What was done to fix}
**Root Cause**: {Why it happened}
```

### Ticket Workflow
```
New → Triaged → In Progress → Waiting (customer) → Resolved → Closed
                     │                                  ↑
                     └── Escalated → Dev Team → Fixed ──┘
```

### Escalation Matrix
| Level | Condition | Escalate To | Action |
|-------|-----------|-------------|--------|
| L1 | Known issue / FAQ | — | Apply KB article |
| L2 | Unknown, reproducible | Tech Lead | Detailed investigation |
| L3 | Complex / systemic | CTO + DevOps | Priority fix, war room |

## Troubleshooting Guides

### Common Issues

#### 1. Login Failed
```markdown
**Symptom**: Người dùng không đăng nhập được
**Checklist**:
- [ ] Check email/password correct (case-sensitive)
- [ ] Check account active in database
- [ ] Check JWT_SECRET hasn't changed
- [ ] Check backend is running: `curl http://localhost:3000/api/health`
- [ ] Check token expiry in .env: `JWT_EXPIRES_IN`
**Solution**: Reset password hoặc activate account in Prisma Studio
```

#### 2. Slow Page Load
```markdown
**Symptom**: Trang tải chậm > 5 giây
**Checklist**:
- [ ] Check API response time: DevTools → Network tab
- [ ] Check database query time: Prisma logs
- [ ] Check network connectivity
- [ ] Check server CPU/memory: `docker stats`
- [ ] Check for N+1 queries
**Solution**: Tùy thuộc vào bottleneck — xem Performance Engineer skill
```

#### 3. Data Not Syncing (Mobile)
```markdown
**Symptom**: Dữ liệu trên mobile không cập nhật
**Checklist**:
- [ ] Check internet connection
- [ ] Force refresh: Pull-to-refresh
- [ ] Clear app cache
- [ ] Check API endpoint reachable from device
- [ ] Check for pending offline queue
**Solution**: Clear cache, force sync, hoặc reinstall app
```

## Knowledge Base Management

### KB Structure
```
📚 Knowledge Base
├── 🚀 Getting Started
│   ├── First login guide
│   ├── Mobile app setup
│   └── Dashboard overview
├── 💼 Sales Module
│   ├── Creating leads
│   ├── Managing pipeline
│   └── Activity logging
├── 📊 Reporting
│   ├── Generating reports
│   └── Understanding KPIs
├── ❓ FAQ
│   ├── Password reset
│   ├── Permission issues
│   └── Export data
└── 🔧 Troubleshooting
    ├── Login issues
    ├── Performance issues
    └── Sync issues
```

### KB Article Lifecycle
```
Identify need → Draft article → Review (Tech) → Publish → Update → Retire
```

## SLA Monitoring

### SLA Dashboard
| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| First Response Time | < 1h (P1) | 45 min | ✅ |
| Resolution Time | < 8h (P1) | 6.5h | ✅ |
| Customer Satisfaction | ≥ 4.0/5.0 | 4.2 | ✅ |
| First Contact Resolution | ≥ 60% | 55% | ⚠️ |
| Ticket Backlog | < 20 | 15 | ✅ |
| SLA Breach Rate | < 5% | 3% | ✅ |

## Communication Templates

### Acknowledgment
```
Xin chào {Name},

Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được yêu cầu
của bạn (Ticket #{ID}) và đang xem xét.

Dự kiến phản hồi: {SLA time}

Trân trọng,
SGROUP Support Team
```

### Resolution
```
Xin chào {Name},

Vấn đề của bạn đã được xử lý:
- Nguyên nhân: {Root cause}
- Giải pháp: {What was done}

Nếu vấn đề tiếp tục, vui lòng reply email này.

Trân trọng,
SGROUP Support Team
```


## ?? MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/backend-architecture-rules.md` and `docs/architecture/api-architecture-rules.md`. Follow Clean Architecture, DTO validation, UUID v7, Soft Delete, and Decimal precision rules.