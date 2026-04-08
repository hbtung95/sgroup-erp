# SOP: API Versioning Strategy

> **Actor:** Brian (backend) + Javis (orchestrator)
> **Trigger:** When existing API contracts need to change

## Strategy: URL-Based Versioning

### Current Version: V1
All endpoints: `/api/v1/{module}/{resource}`

### When to Create V2
- Breaking change to response schema (removing/renaming fields)
- Changing authentication mechanism
- Changing pagination format
- Removing an endpoint

### When V2 is NOT needed (use V1)
- Adding new optional fields to response
- Adding new endpoints
- Adding new query parameters
- Bug fixes that don't change contract
- Performance improvements

### Upgrade Protocol
```
1. Create V2 endpoint alongside V1 (both work simultaneously)
2. V1 returns deprecation header: X-API-Deprecated: true, X-API-Sunset: 2026-12-01
3. Log all V1 calls to monitor migration progress
4. Remove V1 after sunset date + 30 day grace period
```

### Backward Compatibility Rules
- NEVER remove fields from V1 response while V1 is active
- NEVER change field types (string → number) in same version
- New optional fields can be added to any version
- All monetary fields ALWAYS remain Decimal string (NEVER change to float)

### Frontend Migration
- Frontend maintains API version constant: `const API_VERSION = 'v1'`
- TanStack Query hooks include version in queryKey: `['transactions', 'v1', filters]`
- When V2 launches: update constant → verify → remove V1 queries
