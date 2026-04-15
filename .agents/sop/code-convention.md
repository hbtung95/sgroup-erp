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

### Tailwind CSS & UI Styling
- **No Arbitrary Values**: Avoid brackets for standard dimensions (e.g., `w-[150px]`, `rounded-[16px]`). Use predefined tokens in Tailwind config (e.g., `rounded-sg-16px`, `w-40`).
- **Tailwind v4 Syntax**: Use modern Tailwind styling (e.g., `bg-linear-to-br` instead of `bg-gradient-to-br`).
- **Design System Consistency**: Always stick to the brand tokens (`sg-heading`, `sg-bg`, `sg-subtext`) for styling strings, avoiding raw arbitrary colors (like `text-[#112233]`).

### Module Structure
```
modules/{name}/web/src/
├── components/{Name}.tsx          # UI components
├── hooks/use{Name}.ts            # Custom hooks
├── api/{name}.api.ts             # TanStack Query hooks
├── types/{name}.types.ts         # TypeScript types
└── index.ts                      # Module barrel export
```

### TypeScript ESLint Strict Rules
> **Reference:** https://typescript-eslint.io/rules/
Agents MUST follow these strict TypeScript code rules to prevent runtime bugs:
1. **Never use `any`**: Strictly type all variables and returns (`@typescript-eslint/no-explicit-any`).
2. **Strict Null Checks**: Always handle `null` and `undefined` safely (`@typescript-eslint/strict-boolean-expressions`).
3. **No Unused Variables**: Clean up unused imports and variables (`@typescript-eslint/no-unused-vars`).
4. **Explicit Return Types**: Functions and hooks should have explicit return types where inference is ambiguous (`@typescript-eslint/explicit-module-boundary-types`).
5. **No Non-null Assertions**: Do not bypass type safety with `!` (`@typescript-eslint/no-non-null-assertion`).
6. **Consistent Type Definitions**: Prefer `interface` for objects, `type` for unions/primitives (`@typescript-eslint/consistent-type-definitions`).
7. **No Floating Promises**: All async functions must be awaited or properly handled (`@typescript-eslint/no-floating-promises`).

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
