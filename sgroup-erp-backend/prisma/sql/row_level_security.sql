-- ══════════════════════════════════════════════════════════════════
-- SGROUP ERP — Row Level Security (RLS) Policies
-- Apply AFTER Prisma migration
-- ══════════════════════════════════════════════════════════════════

-- NOTE: RLS requires setting a session variable `app.current_user_id`
-- and `app.current_team_id` from your NestJS middleware/guard.
-- Example: SET LOCAL app.current_user_id = '<user-uuid>';

-- 1. Enable RLS on key tables
ALTER TABLE fact_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. NOTIFICATIONS: User can only see their own notifications
CREATE POLICY notification_user_policy ON notifications
  USING ("userId" = current_setting('app.current_user_id', true));

-- 3. DEALS: Sales staff see own deals, team lead sees team deals, director sees all
CREATE POLICY deal_sales_policy ON fact_deals
  USING (
    -- Admin/Director: see everything
    current_setting('app.current_role', true) IN ('admin', 'sales_director', 'ceo')
    OR
    -- Team manager: see their team
    (current_setting('app.current_role', true) = 'sales_manager' AND "teamId" = current_setting('app.current_team_id', true))
    OR
    -- Sales: see own deals
    "staffId" = current_setting('app.current_staff_id', true)
  );

-- 4. CUSTOMERS: Same role-based visibility as deals
CREATE POLICY customer_sales_policy ON customers
  USING (
    current_setting('app.current_role', true) IN ('admin', 'sales_director', 'ceo')
    OR
    (current_setting('app.current_role', true) = 'sales_manager' AND "assignedTo" IN (
      SELECT id FROM sales_staff WHERE "teamId" = current_setting('app.current_team_id', true)
    ))
    OR
    "assignedTo" = current_setting('app.current_staff_id', true)
  );

-- 5. BOOKINGS: Team-based access
CREATE POLICY booking_team_policy ON sales_bookings
  USING (
    current_setting('app.current_role', true) IN ('admin', 'sales_director', 'ceo')
    OR
    "teamId" = current_setting('app.current_team_id', true)
    OR
    "staffId" = current_setting('app.current_staff_id', true)
  );

-- 6. DEPOSITS: Same as bookings
CREATE POLICY deposit_team_policy ON sales_deposits
  USING (
    current_setting('app.current_role', true) IN ('admin', 'sales_director', 'ceo')
    OR
    "teamId" = current_setting('app.current_team_id', true)
    OR
    "staffId" = current_setting('app.current_staff_id', true)
  );

-- 7. COMMISSIONS: Staff sees own, manager sees team
CREATE POLICY commission_policy ON commission_records
  USING (
    current_setting('app.current_role', true) IN ('admin', 'sales_director', 'ceo')
    OR
    (current_setting('app.current_role', true) = 'sales_manager' AND "teamId" = current_setting('app.current_team_id', true))
    OR
    "staffId" = current_setting('app.current_staff_id', true)
  );

-- ══════════════════════════════════════════════════════════════════
-- BYPASS POLICY for the application service account
-- The NestJS app connects as `neondb_owner` or a service role
-- which should bypass RLS for admin operations
-- ══════════════════════════════════════════════════════════════════

-- Option A: Grant BYPASSRLS to the app user (simplest)
-- ALTER USER neondb_owner WITH BYPASSRLS;

-- Option B: Create separate roles for service vs direct-user access
-- CREATE ROLE app_service WITH BYPASSRLS LOGIN PASSWORD '...';
-- CREATE ROLE app_user WITH LOGIN PASSWORD '...';
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO app_service;
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
