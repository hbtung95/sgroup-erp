-- 004_hr_schema_10.up.sql
-- SGroup ERP — Module Nhân Sự — Schema Upgrade 10/10 v2.2
-- Mục tiêu: Architecture fixes (Optimistic Locking, Audit DB-level, Track By, New Tables)

-- ============================================================================
-- BƯỚC 1: OPTIMISTIC LOCKING & TRACKING COLUMNS
-- ============================================================================

-- Thêm version để implement Optimistic Locking
ALTER TABLE hr_employees ADD COLUMN version INT NOT NULL DEFAULT 1;
ALTER TABLE hr_employment_contracts ADD COLUMN version INT NOT NULL DEFAULT 1;
ALTER TABLE hr_leave_requests ADD COLUMN version INT NOT NULL DEFAULT 1;
ALTER TABLE hr_leave_balances ADD COLUMN version INT NOT NULL DEFAULT 1;
ALTER TABLE hr_payroll_runs ADD COLUMN version INT NOT NULL DEFAULT 1;
ALTER TABLE hr_payslips ADD COLUMN version INT NOT NULL DEFAULT 1;

-- Thêm created_by / updated_by
ALTER TABLE hr_employees ADD COLUMN created_by UUID, ADD COLUMN updated_by UUID;
ALTER TABLE hr_employment_contracts ADD COLUMN created_by UUID, ADD COLUMN updated_by UUID;
ALTER TABLE hr_attendance_records ADD COLUMN created_by UUID, ADD COLUMN updated_by UUID;
ALTER TABLE hr_leave_requests ADD COLUMN created_by UUID, ADD COLUMN updated_by UUID;
ALTER TABLE hr_leave_balances ADD COLUMN created_by UUID, ADD COLUMN updated_by UUID;
ALTER TABLE hr_payroll_runs ADD COLUMN created_by UUID, ADD COLUMN updated_by UUID;

-- Thêm index cho tìm kiếm
CREATE INDEX IF NOT EXISTS idx_employees_phone ON hr_employees(phone);

-- ============================================================================
-- BƯỚC 2: DB-LEVEL AUDIT TRIGGER
-- ============================================================================

ALTER TABLE hr_audit_logs ADD COLUMN session_id VARCHAR(100);

CREATE OR REPLACE FUNCTION hr_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    sess_id VARCHAR(100);
BEGIN
    -- Lấy current_user_id từ session, bỏ qua lỗi nếu không có
    BEGIN
        user_id := current_setting('app.current_user_id', true)::uuid;
        sess_id := current_setting('app.session_id', true);
    EXCEPTION WHEN OTHERS THEN
        user_id := NULL;
        sess_id := NULL;
    END;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO hr_audit_logs(id, table_name, record_id, action, old_values, changed_by, session_id, created_at)
        VALUES (gen_random_uuid(), TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb, user_id, sess_id, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO hr_audit_logs(id, table_name, record_id, action, old_values, new_values, changed_by, session_id, created_at)
        VALUES (gen_random_uuid(), TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, user_id, sess_id, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO hr_audit_logs(id, table_name, record_id, action, new_values, changed_by, session_id, created_at)
        VALUES (gen_random_uuid(), TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb, user_id, sess_id, NOW());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng audit trigger cho các bảng trọng yếu
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'hr_employees', 'hr_employment_contracts', 'hr_payroll_runs', 'hr_payslips',
            'hr_salary_adjustments', 'hr_leave_requests', 'hr_leave_balances'
        ])
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_audit ON %I; ' ||
            'CREATE TRIGGER trg_%s_audit AFTER INSERT OR UPDATE OR DELETE ON %I ' ||
            'FOR EACH ROW EXECUTE FUNCTION hr_audit_trigger();',
            replace(tbl, 'hr_', ''), tbl,
            replace(tbl, 'hr_', ''), tbl
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- BƯỚC 3: NEW COMPLETENESS TABLES
-- ============================================================================

-- 3.1 Status Event Sourcing (Atomic Lifecycle Logs)
CREATE TABLE hr_status_transitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     VARCHAR(50) NOT NULL,      -- 'EMPLOYEE', 'CONTRACT', 'LEAVE_REQUEST'
    entity_id       UUID NOT NULL,
    from_status     VARCHAR(30),
    to_status       VARCHAR(30) NOT NULL,
    changed_by      UUID,
    reason          TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_status_entity ON hr_status_transitions(entity_type, entity_id);
CREATE INDEX idx_status_created ON hr_status_transitions(created_at);

-- 3.2 Notification / Alert System
CREATE TABLE hr_notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    type            VARCHAR(50) NOT NULL,      -- 'CONTRACT_EXPIRING', 'BIRTHDAY', 'LEAVE_PENDING'
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    action_url      VARCHAR(500),
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif_user ON hr_notifications(user_id, is_read);

-- 3.3 Approval Flows Engine
CREATE TABLE hr_approval_flows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_type       VARCHAR(50) NOT NULL,      -- LEAVE, OVERTIME, SALARY_ADJUSTMENT
    step_order      INT NOT NULL,
    approver_type   VARCHAR(30) NOT NULL,       -- DIRECT_MANAGER, DEPT_MANAGER, HR, CFO
    min_amount      DECIMAL(18,4),              -- Threshold (e.g., > 5 days)
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_hr_approval_flows_updated BEFORE UPDATE ON hr_approval_flows FOR EACH ROW EXECUTE FUNCTION hr_update_timestamp();

-- 3.4 Payroll Adjustments
CREATE TABLE hr_payroll_adjustments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id  UUID NOT NULL REFERENCES hr_payroll_runs(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    adjustment_type VARCHAR(20) NOT NULL,      -- 'ADDITION', 'DEDUCTION'
    amount          DECIMAL(18,4) NOT NULL,
    reason          TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by     UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_hr_payroll_adjustments_updated BEFORE UPDATE ON hr_payroll_adjustments FOR EACH ROW EXECUTE FUNCTION hr_update_timestamp();

-- 3.5 Employee Skills Matrix
CREATE TABLE hr_employee_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    skill_name      VARCHAR(100) NOT NULL,
    proficiency     INT NOT NULL CHECK (proficiency BETWEEN 1 AND 5),
    verified        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_skills_employee ON hr_employee_skills(employee_id);
CREATE TRIGGER trg_hr_employee_skills_updated BEFORE UPDATE ON hr_employee_skills FOR EACH ROW EXECUTE FUNCTION hr_update_timestamp();

-- 3.6 Company Policies Config
CREATE TABLE hr_company_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           JSONB NOT NULL,
    description     TEXT,
    updated_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_hr_company_policies_updated BEFORE UPDATE ON hr_company_policies FOR EACH ROW EXECUTE FUNCTION hr_update_timestamp();

-- Seed Default Policies
INSERT INTO hr_company_policies (key, value, description)
VALUES 
    ('leave_policy', '{"default_annual": 12, "max_carry_over": 5, "carry_over_expiry_month": 3}', 'Chính sách phép năm'),
    ('probation_policy', '{"salary_rate": 85, "notice_days": 3}', 'Chính sách thử việc');
