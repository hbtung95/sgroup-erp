# SOP: Code Convention — Naming & Style Standards

> **Actor:** All code-producing agents (Fiona, Brian, Jenny, Nova, Sentry, Iris)
> **Trigger:** Every code file created or modified

## Go (Backend) Conventions

### File Naming
```
internal/model/transaction.go       # Singular noun, lowercase
internal/repository/transaction_repo.go  # {entity}_repo.go
internal/service/transaction_service.go  # {entity}_service.go
internal/handler/transaction_handler.go  # {entity}_handler.go
cmd/main.go                         # Entry point
```

### Naming Rules
- Variables: `camelCase` — `totalAmount`, `staffName`
- Functions: `PascalCase` (exported), `camelCase` (private) — `CalculateCommission()`, `validateInput()`
- Constants: `PascalCase` — `MaxRetryAttempts`, `DefaultPageSize`
- Interfaces: verb + "er" suffix — `TransactionRepository`, `CommissionCalculator`
- Errors: `Err` prefix — `ErrNotFound`, `ErrInsufficientBalance`

### Package Structure (per module)
```
modules/{name}/api/
├── cmd/main.go                    # Entry point + DI
├── internal/
│   ├── model/{entity}.go         # Structs + validation
│   ├── repository/{entity}_repo.go # Interface + DB implementation
│   ├── service/{entity}_service.go  # Business logic
│   └── handler/{entity}_handler.go  # HTTP handlers
├── integrations/                  # External API connectors (Iris)
├── migrations/                    # SQL up/down files
└── go.mod
```

## TypeScript (Frontend) Conventions

### File Naming
```
components/TransactionList.tsx      # PascalCase component
hooks/useTransaction.ts            # camelCase with use prefix
api/transaction.api.ts             # lowercase.api.ts
types/transaction.types.ts         # lowercase.types.ts
```

### Naming Rules
- Components: `PascalCase` — `BookingForm`, `CommissionTable`
- Hooks: `use` prefix — `useTransactions`, `useBookingMutation`
- Types/Interfaces: `PascalCase` with `I` prefix for interfaces — `ITransaction`, `TransactionStatus`
- Constants: `SCREAMING_SNAKE_CASE` — `MAX_BOOKING_DURATION`, `API_BASE_URL`
- Functions: `camelCase` — `formatCurrency()`, `calculateCommission()`

### Module Structure
```
modules/{name}/web/src/
├── components/{Name}.tsx          # UI components
├── hooks/use{Name}.ts            # Custom hooks
├── api/{name}.api.ts             # TanStack Query hooks
├── types/{name}.types.ts         # TypeScript types
└── index.ts                      # Module barrel export
```

## SQL (Database) Conventions
- Tables: `snake_case` plural — `transactions`, `commission_records`
- Columns: `snake_case` — `created_at`, `sales_staff_id`
- Indexes: `idx_{table}_{column}` — `idx_transactions_status`
- Migrations: `{seq}_{description}.up.sql` — `001_create_staff.up.sql`
- Enums: CHECK constraint — `CHECK (status IN ('BOOKED','DEPOSITED','CONTRACTED'))`

## Git Commit Convention
```
{type}({scope}): {description}

Types: feat | fix | refactor | docs | test | ci | chore
Scope: module name or area — crm, hr, ui, gateway, infra

Examples:
  feat(crm): add lead scoring calculation
  fix(commission): decimal rounding error in F1/F2 split
  docs(domain): add transaction state machine
  test(booking): add race condition regression test
  ci(atlas): add GitHub Actions backend matrix
```
