# SOP: Data Migration (Legacy → New ERP)

> **Actor:** Jenny (DB) + Brian (backend) + Iris (integrations)
> **Trigger:** Migrating data from legacy systems to new SGROUP ERP

## Legacy Systems Inventory
Located in `legacy-archive/`:
1. **legacy-backend-nest/** — NestJS backend with Prisma + SQLite
2. **legacy-frontend-rn/** — React Native mobile app
3. **legacy-frontend-web/** — Web frontend

## Migration Strategy: ETL (Extract → Transform → Load)

### Phase 1: Schema Mapping
```
Legacy SQLite Table     → New PostgreSQL Table     Notes
─────────────────────────────────────────────────────────
users                   → staff                   Add UUID v7, soft delete
projects                → projects                Add status machine, Decimal
apartments/units        → property_products       New state machine
bookings                → transactions            Full HĐMB lifecycle
customers               → customers               Add 360 view fields
commissions             → commission_records      Add multi-level split
invoices                → invoices                Add AR/AP tracking
```

### Phase 2: Data Cleaning Rules
- [ ] Remove duplicate records (by phone/email)
- [ ] Normalize phone numbers (VN format: +84xxx)
- [ ] Convert money from INT to Decimal(18,4)
- [ ] Generate UUID v7 for all migrated records
- [ ] Preserve original IDs in `legacy_id` column for reference
- [ ] Set `created_at` from legacy data, `updated_at` = migration timestamp

### Phase 3: Migration Script Template
```go
func MigrateEntity(ctx context.Context, sqliteDB *sql.DB, pgDB *pgx.Pool) error {
    // 1. Extract from SQLite
    rows, _ := sqliteDB.QueryContext(ctx, "SELECT * FROM old_table")
    
    // 2. Transform
    for rows.Next() {
        old := scanLegacyRow(rows)
        new := transformToNewSchema(old) // UUID v7, Decimal, etc.
        
        // 3. Load into PostgreSQL with conflict handling
        _, err := pgDB.Exec(ctx, `
            INSERT INTO new_table (id, ...) VALUES ($1, ...)
            ON CONFLICT (legacy_id) DO UPDATE SET updated_at = NOW()
        `, new.ID, ...)
    }
    
    // 4. Log migration result
    logMigrationResult("entity_name", created, updated, errors)
}
```

### Phase 4: Validation
- [ ] Record counts match (legacy vs new)
- [ ] Financial totals match (sum of money fields)
- [ ] All relationships preserved (FK integrity)
- [ ] Status transitions valid post-migration
- [ ] Run E2E tests on migrated data

### CRITICAL RULES
- NEVER delete legacy data during migration — keep `legacy-archive/` untouched
- ALWAYS run migration on staging first, verify, then production
- ALWAYS create a PostgreSQL backup before production migration
- Add `legacy_id` column to every migrated table for traceability
