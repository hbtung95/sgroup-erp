# SGROUP ERP — API Contract Convention

TL;DR: REST, /api/v1/{module}, JSON response { success, data, meta/error }. Pagination via page+limit. Soft delete only.

## URL Pattern
```
BASE:    /api/v1
LIST:    GET    /api/v1/{module}
GET:     GET    /api/v1/{module}/{id}
CREATE:  POST   /api/v1/{module}
UPDATE:  PUT    /api/v1/{module}/{id}
DELETE:  DELETE /api/v1/{module}/{id}        ← soft delete (sets deleted_at)
NESTED:  GET    /api/v1/projects/{id}/units    ← parent-child relationships
ACTION:  POST   /api/v1/transactions/{id}/deposit ← non-CRUD actions
```

## Response Schema

### Success (single item)
```json
{ "success": true, "data": { "id": "uuid", ... } }
```

### Success (list with pagination)
```json
{
  "success": true,
  "data": [ {...}, {...} ],
  "meta": { "page": 1, "limit": 20, "total": 142, "total_pages": 8 }
}
```

### Error
```json
{
  "success": false,
  "error": { "code": "CUSTOMER_NOT_FOUND", "message": "Customer with ID xxx not found", "trace_id": "abc123" }
}
```

## Query Parameters
```
Pagination:  ?page=1&limit=20        (limit max 100, default 20)
Sort:        ?sort=name              (ascending)
             ?sort=-created_at       (descending, prefix -)
Filter:      ?filter[status]=ACTIVE
             ?filter[project_id]=uuid
             ?filter[type]=APARTMENT
Search:      ?q=keyword              (full-text across searchable fields)
```

## Error Code Convention
```
{MODULE}_{ACTION}_{REASON}
Examples:
  CUSTOMER_NOT_FOUND
  PROJECT_ALREADY_EXISTS
  BOOKING_UNIT_LOCKED
  TRANSACTION_INSUFFICIENT_DEPOSIT
  COMMISSION_ALREADY_APPROVED
  AUTH_TOKEN_EXPIRED
  AUTH_INSUFFICIENT_PERMISSION
  VALIDATION_FAILED (+ field-level details in error.details[])
```

## TypeScript Types (Fiona uses these)
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}
interface ApiError {
  success: false;
  error: { code: string; message: string; trace_id: string; details?: FieldError[] };
}
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
```

## Go Types (Brian uses these)
```go
type Response[T any] struct {
    Success bool           `json:"success"`
    Data    T              `json:"data"`
    Meta    *PaginationMeta `json:"meta,omitempty"`
}
type ErrorResponse struct {
    Success bool      `json:"success"`
    Error   ErrorBody `json:"error"`
}
```
