-- 003_hr_schema_hardening.down.sql
-- Rollback: Remove constraints, tables, triggers added in 003

-- Remove employee schedule column
ALTER TABLE hr_employees DROP COLUMN IF EXISTS work_schedule_id;

-- Drop new tables
DROP TABLE IF EXISTS hr_work_schedules CASCADE;
DROP TABLE IF EXISTS hr_insurance_configs CASCADE;

-- Remove triggers (dynamic loop)
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'hr_departments', 'hr_positions', 'hr_teams',
            'hr_employees', 'hr_employee_documents', 'hr_employee_contacts',
            'hr_employment_contracts', 'hr_salary_adjustments',
            'hr_attendance_records', 'hr_overtime_records',
            'hr_leave_requests', 'hr_leave_balances', 'hr_holidays',
            'hr_payroll_runs', 'hr_payslips',
            'hr_jobs', 'hr_candidates', 'hr_interview_schedules',
            'hr_courses', 'hr_course_enrollments',
            'hr_review_cycles', 'hr_performance_reviews',
            'hr_rewards_disciplines',
            'hr_benefit_plans', 'hr_employee_benefits',
            'hr_employee_assets', 'hr_onboarding_tasks'
        ])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %I;',
            replace(tbl, 'hr_', ''), tbl);
    END LOOP;
END;
$$;

DROP FUNCTION IF EXISTS hr_update_timestamp();

-- Drop composite indexes
DROP INDEX IF EXISTS idx_payslips_dept_run;
DROP INDEX IF EXISTS idx_contracts_expiring;
DROP INDEX IF EXISTS idx_attendance_report;
DROP INDEX IF EXISTS idx_employees_fulltext;

-- Drop CHECK constraints (reverse order)
-- Employee
ALTER TABLE hr_employees DROP CONSTRAINT IF EXISTS chk_emp_status;
ALTER TABLE hr_employees DROP CONSTRAINT IF EXISTS chk_emp_gender;
ALTER TABLE hr_employees DROP CONSTRAINT IF EXISTS chk_emp_type;
-- Contracts
ALTER TABLE hr_employment_contracts DROP CONSTRAINT IF EXISTS chk_contract_salary_positive;
ALTER TABLE hr_employment_contracts DROP CONSTRAINT IF EXISTS chk_contract_probation_salary;
ALTER TABLE hr_employment_contracts DROP CONSTRAINT IF EXISTS chk_contract_type;
ALTER TABLE hr_employment_contracts DROP CONSTRAINT IF EXISTS chk_contract_status;
ALTER TABLE hr_employment_contracts DROP CONSTRAINT IF EXISTS chk_contract_date_range;
ALTER TABLE hr_employment_contracts DROP CONSTRAINT IF EXISTS chk_contract_currency;
ALTER TABLE hr_employment_contracts DROP CONSTRAINT IF EXISTS chk_contract_salary_type;
-- Attendance
ALTER TABLE hr_attendance_records DROP CONSTRAINT IF EXISTS chk_attendance_status;
ALTER TABLE hr_attendance_records DROP CONSTRAINT IF EXISTS chk_attendance_source;
ALTER TABLE hr_attendance_records DROP CONSTRAINT IF EXISTS chk_attendance_hours;
ALTER TABLE hr_attendance_records DROP CONSTRAINT IF EXISTS chk_attendance_late;
ALTER TABLE hr_attendance_records DROP CONSTRAINT IF EXISTS chk_attendance_early;
-- Overtime
ALTER TABLE hr_overtime_records DROP CONSTRAINT IF EXISTS chk_overtime_hours_positive;
ALTER TABLE hr_overtime_records DROP CONSTRAINT IF EXISTS chk_overtime_multiplier;
ALTER TABLE hr_overtime_records DROP CONSTRAINT IF EXISTS chk_overtime_type;
ALTER TABLE hr_overtime_records DROP CONSTRAINT IF EXISTS chk_overtime_status;
-- Leave
ALTER TABLE hr_leave_requests DROP CONSTRAINT IF EXISTS chk_leave_days_positive;
ALTER TABLE hr_leave_requests DROP CONSTRAINT IF EXISTS chk_leave_date_range;
ALTER TABLE hr_leave_requests DROP CONSTRAINT IF EXISTS chk_leave_type;
ALTER TABLE hr_leave_requests DROP CONSTRAINT IF EXISTS chk_leave_status;
ALTER TABLE hr_leave_requests DROP CONSTRAINT IF EXISTS chk_leave_halfday;
-- Leave Balance
ALTER TABLE hr_leave_balances DROP CONSTRAINT IF EXISTS chk_bal_annual;
ALTER TABLE hr_leave_balances DROP CONSTRAINT IF EXISTS chk_bal_sick;
ALTER TABLE hr_leave_balances DROP CONSTRAINT IF EXISTS chk_bal_unpaid;
ALTER TABLE hr_leave_balances DROP CONSTRAINT IF EXISTS chk_bal_compoff;
-- Payroll
ALTER TABLE hr_payroll_runs DROP CONSTRAINT IF EXISTS chk_payroll_status;
ALTER TABLE hr_payroll_runs DROP CONSTRAINT IF EXISTS chk_payroll_period_month;
ALTER TABLE hr_payroll_runs DROP CONSTRAINT IF EXISTS chk_payroll_period_year;
ALTER TABLE hr_payslips DROP CONSTRAINT IF EXISTS chk_payslip_base_positive;
ALTER TABLE hr_payslips DROP CONSTRAINT IF EXISTS chk_payslip_net_nonneg;
ALTER TABLE hr_payslips DROP CONSTRAINT IF EXISTS chk_payslip_status;
ALTER TABLE hr_payslips DROP CONSTRAINT IF EXISTS chk_payslip_workdays;
ALTER TABLE hr_payslip_items DROP CONSTRAINT IF EXISTS chk_item_category;
-- Recruitment
ALTER TABLE hr_jobs DROP CONSTRAINT IF EXISTS chk_job_status;
ALTER TABLE hr_jobs DROP CONSTRAINT IF EXISTS chk_job_headcount;
ALTER TABLE hr_jobs DROP CONSTRAINT IF EXISTS chk_job_salary;
ALTER TABLE hr_candidates DROP CONSTRAINT IF EXISTS chk_candidate_stage;
ALTER TABLE hr_interview_schedules DROP CONSTRAINT IF EXISTS chk_interview_status;
ALTER TABLE hr_interview_schedules DROP CONSTRAINT IF EXISTS chk_interview_duration;
-- Training
ALTER TABLE hr_courses DROP CONSTRAINT IF EXISTS chk_course_status;
ALTER TABLE hr_course_enrollments DROP CONSTRAINT IF EXISTS chk_enrollment_status;
-- Performance
ALTER TABLE hr_review_cycles DROP CONSTRAINT IF EXISTS chk_cycle_type;
ALTER TABLE hr_review_cycles DROP CONSTRAINT IF EXISTS chk_cycle_dates;
ALTER TABLE hr_performance_reviews DROP CONSTRAINT IF EXISTS chk_review_ratings;
ALTER TABLE hr_rewards_disciplines DROP CONSTRAINT IF EXISTS chk_rd_type;
ALTER TABLE hr_rewards_disciplines DROP CONSTRAINT IF EXISTS chk_rd_amount;
-- Benefits
ALTER TABLE hr_benefit_plans DROP CONSTRAINT IF EXISTS chk_benefit_freq;
ALTER TABLE hr_employee_assets DROP CONSTRAINT IF EXISTS chk_asset_status;
ALTER TABLE hr_employee_assets DROP CONSTRAINT IF EXISTS chk_asset_condition;
ALTER TABLE hr_onboarding_tasks DROP CONSTRAINT IF EXISTS chk_onboard_type;
ALTER TABLE hr_onboarding_tasks DROP CONSTRAINT IF EXISTS chk_onboard_status;
-- Salary Adjustments
ALTER TABLE hr_salary_adjustments DROP CONSTRAINT IF EXISTS chk_adj_salaries;
ALTER TABLE hr_salary_adjustments DROP CONSTRAINT IF EXISTS chk_adj_type;
ALTER TABLE hr_salary_adjustments DROP CONSTRAINT IF EXISTS chk_adj_status;
