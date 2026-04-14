-- 004_hr_schema_10.down.sql
-- Rollback for Schema Upgrade 10/10 v2.2

-- Drop new tables
DROP TABLE IF EXISTS hr_company_policies CASCADE;
DROP TABLE IF EXISTS hr_employee_skills CASCADE;
DROP TABLE IF EXISTS hr_payroll_adjustments CASCADE;
DROP TABLE IF EXISTS hr_approval_flows CASCADE;
DROP TABLE IF EXISTS hr_notifications CASCADE;
DROP TABLE IF EXISTS hr_status_transitions CASCADE;

-- Drop trigger on hr_audit_logs
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
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_audit ON %I;', replace(tbl, 'hr_', ''), tbl);
    END LOOP;
END;
$$;
DROP FUNCTION IF EXISTS hr_audit_trigger();
ALTER TABLE hr_audit_logs DROP COLUMN IF EXISTS session_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_employees_phone;

-- Remove created_by / updated_by
ALTER TABLE hr_payroll_runs DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS updated_by;
ALTER TABLE hr_leave_balances DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS updated_by;
ALTER TABLE hr_leave_requests DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS updated_by;
ALTER TABLE hr_attendance_records DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS updated_by;
ALTER TABLE hr_employment_contracts DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS updated_by;
ALTER TABLE hr_employees DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS updated_by;

-- Remove version column
ALTER TABLE hr_payslips DROP COLUMN IF EXISTS version;
ALTER TABLE hr_payroll_runs DROP COLUMN IF EXISTS version;
ALTER TABLE hr_leave_balances DROP COLUMN IF EXISTS version;
ALTER TABLE hr_leave_requests DROP COLUMN IF EXISTS version;
ALTER TABLE hr_employment_contracts DROP COLUMN IF EXISTS version;
ALTER TABLE hr_employees DROP COLUMN IF EXISTS version;
