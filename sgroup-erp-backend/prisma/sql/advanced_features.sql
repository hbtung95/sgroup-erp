-- ══════════════════════════════════════════════════════════════════
-- SGROUP ERP — Advanced Database Features
-- Apply after Prisma migration
-- ══════════════════════════════════════════════════════════════════

-- 1. MATERIALIZED VIEW: Sales Team Monthly Summary
-- Giúp dashboard load nhanh hơn thay vì query real-time
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_team_monthly AS
SELECT
  d.year,
  d.month,
  d."teamId",
  t.name AS team_name,
  COUNT(d.id) AS total_deals,
  COUNT(CASE WHEN d.stage = 'COMPLETED' THEN 1 END) AS completed_deals,
  SUM(CASE WHEN d.stage = 'COMPLETED' THEN d."dealValue" ELSE 0 END) AS total_gmv,
  SUM(CASE WHEN d.stage = 'COMPLETED' THEN d.commission ELSE 0 END) AS total_commission,
  COUNT(CASE WHEN d.stage = 'CANCELLED' THEN 1 END) AS cancelled_deals,
  COUNT(CASE WHEN d.stage NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) AS pipeline_deals,
  SUM(CASE WHEN d.stage NOT IN ('COMPLETED', 'CANCELLED') THEN d."dealValue" ELSE 0 END) AS pipeline_value
FROM "FactDeal" d
LEFT JOIN "SalesTeam" t ON d."teamId" = t.id
WHERE d."deletedAt" IS NULL AND d.status = 'ACTIVE'
GROUP BY d.year, d.month, d."teamId", t.name;

-- Unique index for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_team_monthly
ON mv_sales_team_monthly (year, month, "teamId");

-- 2. MATERIALIZED VIEW: Staff Performance Monthly
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_staff_monthly AS
SELECT
  d.year,
  d.month,
  d."staffId",
  d."staffName",
  d."teamId",
  d."teamName",
  COUNT(d.id) AS total_deals,
  COUNT(CASE WHEN d.stage = 'COMPLETED' THEN 1 END) AS completed_deals,
  SUM(CASE WHEN d.stage = 'COMPLETED' THEN d."dealValue" ELSE 0 END) AS total_gmv,
  SUM(CASE WHEN d.stage = 'COMPLETED' THEN d.commission ELSE 0 END) AS total_commission
FROM "FactDeal" d
WHERE d."deletedAt" IS NULL AND d.status = 'ACTIVE'
GROUP BY d.year, d.month, d."staffId", d."staffName", d."teamId", d."teamName";

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_staff_monthly
ON mv_sales_staff_monthly (year, month, "staffId");

-- 3. FULL-TEXT SEARCH: Customer search index
-- Tạo generated column cho full-text search
ALTER TABLE "Customer"
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('simple',
    coalesce("fullName", '') || ' ' ||
    coalesce(phone, '') || ' ' ||
    coalesce(email, '') || ' ' ||
    coalesce("companyName", '') || ' ' ||
    coalesce(address, '')
  )
) STORED;

CREATE INDEX IF NOT EXISTS idx_customer_search
ON "Customer" USING GIN(search_vector);

-- 4. REFRESH function — call periodically (cron job or on-demand)
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_team_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_staff_monthly;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT refresh_materialized_views();
-- Or via cron: pg_cron.schedule('refresh-views', '0 */1 * * *', 'SELECT refresh_materialized_views()');
