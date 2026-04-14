-- 003_hr_schema_hardening.up.sql
-- SGroup ERP — Module Nhân Sự — Schema Hardening v2.1
-- Mục tiêu: CHECK constraints, bảng cấu hình BH/Ca, trigger updated_at
-- 
-- Migration này là ADDITIVE — không drop gì, chỉ ALTER/ADD.
-- An toàn chạy trên production.

-- ============================================================================
-- BƯỚC 1: CHECK CONSTRAINTS — Chống dữ liệu rác
-- ============================================================================

-- 1.1 Employee status & gender
ALTER TABLE hr_employees ADD CONSTRAINT chk_emp_status
    CHECK (status IN ('ACTIVE','ON_LEAVE','PROBATION','SUSPENDED','TERMINATED','RESIGNED'));
ALTER TABLE hr_employees ADD CONSTRAINT chk_emp_gender
    CHECK (gender IS NULL OR gender IN ('Male','Female','Other'));
ALTER TABLE hr_employees ADD CONSTRAINT chk_emp_type
    CHECK (employment_type IN ('FULL_TIME','PART_TIME','CONTRACTOR','INTERN'));

-- 1.2 Contracts
ALTER TABLE hr_employment_contracts ADD CONSTRAINT chk_contract_salary_positive
    CHECK (base_salary > 0);
ALTER TABLE hr_employment_contracts ADD CONSTRAINT chk_contract_probation_salary
    CHECK (probation_salary IS NULL OR probation_salary > 0);
ALTER TABLE hr_employment_contracts ADD CONSTRAINT chk_contract_type
    CHECK (contract_type IN ('PROBATION','FIXED_TERM_12','FIXED_TERM_36','INDEFINITE','SEASONAL','PART_TIME'));
ALTER TABLE hr_employment_contracts ADD CONSTRAINT chk_contract_status
    CHECK (status IN ('DRAFT','ACTIVE','EXPIRED','TERMINATED','RENEWED','SUSPENDED'));
ALTER TABLE hr_employment_contracts ADD CONSTRAINT chk_contract_date_range
    CHECK (end_date IS NULL OR end_date >= start_date);
ALTER TABLE hr_employment_contracts ADD CONSTRAINT chk_contract_currency
    CHECK (currency IN ('VND','USD','EUR'));
ALTER TABLE hr_employment_contracts ADD CONSTRAINT chk_contract_salary_type
    CHECK (salary_type IN ('GROSS','NET'));

-- 1.3 Attendance
ALTER TABLE hr_attendance_records ADD CONSTRAINT chk_attendance_status
    CHECK (status IN ('PRESENT','ABSENT','LATE','HALF_DAY','HOLIDAY','LEAVE','WFH','BUSINESS_TRIP'));
ALTER TABLE hr_attendance_records ADD CONSTRAINT chk_attendance_source
    CHECK (source IN ('MANUAL','FINGERPRINT','FACE_ID','QR_CODE','GPS','API'));
ALTER TABLE hr_attendance_records ADD CONSTRAINT chk_attendance_hours
    CHECK (total_hours IS NULL OR (total_hours >= 0 AND total_hours <= 24));
ALTER TABLE hr_attendance_records ADD CONSTRAINT chk_attendance_late
    CHECK (late_minutes >= 0);
ALTER TABLE hr_attendance_records ADD CONSTRAINT chk_attendance_early
    CHECK (early_leave_min >= 0);

-- 1.4 Overtime
ALTER TABLE hr_overtime_records ADD CONSTRAINT chk_overtime_hours_positive
    CHECK (total_hours > 0 AND total_hours <= 12);
ALTER TABLE hr_overtime_records ADD CONSTRAINT chk_overtime_multiplier
    CHECK (multiplier >= 1.0 AND multiplier <= 4.0);
ALTER TABLE hr_overtime_records ADD CONSTRAINT chk_overtime_type
    CHECK (overtime_type IN ('WEEKDAY','WEEKEND','HOLIDAY','NIGHT'));
ALTER TABLE hr_overtime_records ADD CONSTRAINT chk_overtime_status
    CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED'));

-- 1.5 Leave Requests
ALTER TABLE hr_leave_requests ADD CONSTRAINT chk_leave_days_positive
    CHECK (total_days > 0);
ALTER TABLE hr_leave_requests ADD CONSTRAINT chk_leave_date_range
    CHECK (end_date >= start_date);
ALTER TABLE hr_leave_requests ADD CONSTRAINT chk_leave_type
    CHECK (leave_type IN ('ANNUAL','SICK','UNPAID','MATERNITY','PATERNITY','WEDDING','BEREAVEMENT','COMP_OFF'));
ALTER TABLE hr_leave_requests ADD CONSTRAINT chk_leave_status
    CHECK (status IN ('PENDING','LEADER_APPROVED','APPROVED','REJECTED','CANCELLED'));
ALTER TABLE hr_leave_requests ADD CONSTRAINT chk_leave_halfday
    CHECK (half_day_period IS NULL OR half_day_period IN ('MORNING','AFTERNOON'));

-- 1.6 Leave Balances
ALTER TABLE hr_leave_balances ADD CONSTRAINT chk_bal_annual
    CHECK (annual_entitled >= 0 AND annual_used >= 0 AND annual_pending >= 0 AND annual_carried >= 0);
ALTER TABLE hr_leave_balances ADD CONSTRAINT chk_bal_sick
    CHECK (sick_entitled >= 0 AND sick_used >= 0);
ALTER TABLE hr_leave_balances ADD CONSTRAINT chk_bal_unpaid
    CHECK (unpaid_used >= 0);
ALTER TABLE hr_leave_balances ADD CONSTRAINT chk_bal_compoff
    CHECK (comp_off_entitled >= 0 AND comp_off_used >= 0);

-- 1.7 Payroll
ALTER TABLE hr_payroll_runs ADD CONSTRAINT chk_payroll_status
    CHECK (status IN ('DRAFT','CALCULATING','REVIEW','APPROVED','PAID','CANCELLED'));
ALTER TABLE hr_payroll_runs ADD CONSTRAINT chk_payroll_period_month
    CHECK (period_month >= 1 AND period_month <= 12);
ALTER TABLE hr_payroll_runs ADD CONSTRAINT chk_payroll_period_year
    CHECK (period_year >= 2020 AND period_year <= 2100);

ALTER TABLE hr_payslips ADD CONSTRAINT chk_payslip_base_positive
    CHECK (base_salary > 0);
ALTER TABLE hr_payslips ADD CONSTRAINT chk_payslip_net_nonneg
    CHECK (net_salary >= 0);
ALTER TABLE hr_payslips ADD CONSTRAINT chk_payslip_status
    CHECK (status IN ('DRAFT','CALCULATED','CONFIRMED','PAID','ERROR'));
ALTER TABLE hr_payslips ADD CONSTRAINT chk_payslip_workdays
    CHECK (actual_work_days >= 0 AND standard_work_days > 0);

ALTER TABLE hr_payslip_items ADD CONSTRAINT chk_item_category
    CHECK (category IN ('ALLOWANCE','BONUS','DEDUCTION','REIMBURSEMENT','TAX','INSURANCE'));

-- 1.8 Recruitment
ALTER TABLE hr_jobs ADD CONSTRAINT chk_job_status
    CHECK (status IN ('DRAFT','OPEN','ON_HOLD','CLOSED','CANCELLED'));
ALTER TABLE hr_jobs ADD CONSTRAINT chk_job_headcount
    CHECK (headcount >= 1);
ALTER TABLE hr_jobs ADD CONSTRAINT chk_job_salary
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min);

ALTER TABLE hr_candidates ADD CONSTRAINT chk_candidate_stage
    CHECK (stage IN ('NEW','SCREENING','PHONE_SCREEN','INTERVIEW','TECHNICAL_TEST','OFFER','HIRED','REJECTED','WITHDRAWN'));

ALTER TABLE hr_interview_schedules ADD CONSTRAINT chk_interview_status
    CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW'));
ALTER TABLE hr_interview_schedules ADD CONSTRAINT chk_interview_duration
    CHECK (duration_minutes > 0 AND duration_minutes <= 480);

-- 1.9 Training
ALTER TABLE hr_courses ADD CONSTRAINT chk_course_status
    CHECK (status IN ('DRAFT','OPEN','IN_PROGRESS','COMPLETED','CANCELLED'));
ALTER TABLE hr_course_enrollments ADD CONSTRAINT chk_enrollment_status
    CHECK (status IN ('ENROLLED','IN_PROGRESS','COMPLETED','DROPPED','FAILED'));

-- 1.10 Performance
ALTER TABLE hr_review_cycles ADD CONSTRAINT chk_cycle_type
    CHECK (cycle_type IN ('MONTHLY','QUARTERLY','HALF_YEARLY','ANNUAL'));
ALTER TABLE hr_review_cycles ADD CONSTRAINT chk_cycle_dates
    CHECK (end_date >= start_date);

ALTER TABLE hr_performance_reviews ADD CONSTRAINT chk_review_ratings
    CHECK (
        (self_rating IS NULL OR (self_rating >= 1.0 AND self_rating <= 5.0)) AND
        (manager_rating IS NULL OR (manager_rating >= 1.0 AND manager_rating <= 5.0)) AND
        (final_rating IS NULL OR (final_rating >= 1.0 AND final_rating <= 5.0))
    );

ALTER TABLE hr_rewards_disciplines ADD CONSTRAINT chk_rd_type
    CHECK (type IN ('REWARD','DISCIPLINE'));
ALTER TABLE hr_rewards_disciplines ADD CONSTRAINT chk_rd_amount
    CHECK (amount >= 0);

-- 1.11 Benefits & Assets
ALTER TABLE hr_benefit_plans ADD CONSTRAINT chk_benefit_freq
    CHECK (frequency IN ('MONTHLY','QUARTERLY','YEARLY','ONE_TIME'));

ALTER TABLE hr_employee_assets ADD CONSTRAINT chk_asset_status
    CHECK (status IN ('ASSIGNED','RETURNED','LOST','DAMAGED'));
ALTER TABLE hr_employee_assets ADD CONSTRAINT chk_asset_condition
    CHECK (condition_out IN ('NEW','GOOD','FAIR','POOR'));

ALTER TABLE hr_onboarding_tasks ADD CONSTRAINT chk_onboard_type
    CHECK (task_type IN ('ONBOARDING','OFFBOARDING'));
ALTER TABLE hr_onboarding_tasks ADD CONSTRAINT chk_onboard_status
    CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','SKIPPED'));

-- 1.12 Salary Adjustments
ALTER TABLE hr_salary_adjustments ADD CONSTRAINT chk_adj_salaries
    CHECK (old_salary > 0 AND new_salary > 0);
ALTER TABLE hr_salary_adjustments ADD CONSTRAINT chk_adj_type
    CHECK (adjustment_type IN ('PROMOTION','ANNUAL_REVIEW','PROBATION_END','MARKET_ADJUSTMENT','DEMOTION','OTHER'));
ALTER TABLE hr_salary_adjustments ADD CONSTRAINT chk_adj_status
    CHECK (status IN ('PENDING','APPROVED','REJECTED'));

-- ============================================================================
-- BƯỚC 2: BẢNG CẤU HÌNH MỚI
-- ============================================================================

-- 2.1 Cấu hình Bảo hiểm xã hội (tỷ lệ + mức trần theo năm)
CREATE TABLE hr_insurance_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year                INT NOT NULL,
    base_salary         DECIMAL(18,4) NOT NULL,      -- Lương cơ sở (2.34 triệu năm 2025)
    ceiling_multiplier  INT NOT NULL DEFAULT 20,     -- Hệ số trần = 20 × lương cơ sở
    -- Tỷ lệ NV
    bhxh_emp_rate       NUMERIC(5,2) NOT NULL DEFAULT 8.0,
    bhyt_emp_rate       NUMERIC(5,2) NOT NULL DEFAULT 1.5,
    bhtn_emp_rate       NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    -- Tỷ lệ DN
    bhxh_co_rate        NUMERIC(5,2) NOT NULL DEFAULT 17.5,
    bhyt_co_rate        NUMERIC(5,2) NOT NULL DEFAULT 3.0,
    bhtn_co_rate        NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    -- Giảm trừ thuế TNCN
    personal_deduction  DECIMAL(18,4) NOT NULL DEFAULT 11000000,
    dependent_deduction DECIMAL(18,4) NOT NULL DEFAULT 4400000,
    -- Metadata
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year)
);

-- Seed: Cấu hình BHXH 2026
INSERT INTO hr_insurance_configs (
    id, year, base_salary, ceiling_multiplier,
    bhxh_emp_rate, bhyt_emp_rate, bhtn_emp_rate,
    bhxh_co_rate, bhyt_co_rate, bhtn_co_rate,
    personal_deduction, dependent_deduction,
    effective_from, notes
) VALUES (
    gen_random_uuid(), 2026, 2340000, 20,
    8.0, 1.5, 1.0,
    17.5, 3.0, 1.0,
    11000000, 4400000,
    '2026-01-01',
    'Lương cơ sở 2.34 triệu (NĐ 73/2024). Trần đóng BH = 20 × 2.34tr = 46.8 triệu'
);

-- 2.2 Cấu hình Ca làm việc
CREATE TABLE hr_work_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(30) UNIQUE NOT NULL,
    check_in_time   TIME NOT NULL DEFAULT '08:00',
    check_out_time  TIME NOT NULL DEFAULT '17:00',
    break_minutes   INT NOT NULL DEFAULT 60,
    late_grace_min  INT NOT NULL DEFAULT 15,        -- Phút ân hạn đi trễ
    early_grace_min INT NOT NULL DEFAULT 0,         -- Phút ân hạn về sớm
    working_hours   NUMERIC(4,2) NOT NULL DEFAULT 8.0,
    is_default      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_schedule_times CHECK (check_out_time > check_in_time),
    CONSTRAINT chk_schedule_break CHECK (break_minutes >= 0 AND break_minutes <= 120),
    CONSTRAINT chk_schedule_grace CHECK (late_grace_min >= 0 AND early_grace_min >= 0)
);

-- Seed: Ca mặc định
INSERT INTO hr_work_schedules (id, name, code, check_in_time, check_out_time, break_minutes, late_grace_min, working_hours, is_default)
VALUES
    (gen_random_uuid(), 'Ca hành chính', 'OFFICE_STANDARD', '08:00', '17:00', 60, 15, 8.0, TRUE),
    (gen_random_uuid(), 'Ca linh hoạt', 'FLEX_MORNING', '07:00', '16:00', 60, 15, 8.0, FALSE),
    (gen_random_uuid(), 'Ca tối', 'EVENING_SHIFT', '14:00', '22:00', 60, 15, 8.0, FALSE);

-- 2.3 Link NV → Ca làm việc
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS work_schedule_id UUID
    REFERENCES hr_work_schedules(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_employees_schedule ON hr_employees(work_schedule_id);

-- ============================================================================
-- BƯỚC 3: TRIGGER UPDATED_AT TỰ ĐỘNG
-- ============================================================================

CREATE OR REPLACE FUNCTION hr_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply cho tất cả bảng có updated_at
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
            'hr_employee_assets', 'hr_onboarding_tasks',
            'hr_insurance_configs', 'hr_work_schedules'
        ])
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_updated ON %I; ' ||
            'CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %I ' ||
            'FOR EACH ROW EXECUTE FUNCTION hr_update_timestamp();',
            replace(tbl, 'hr_', ''), tbl,
            replace(tbl, 'hr_', ''), tbl
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- BƯỚC 4: COMPOSITE INDEXES CHO REPORT QUERIES
-- ============================================================================

-- Báo cáo payslip theo department + kỳ lương
CREATE INDEX IF NOT EXISTS idx_payslips_dept_run
    ON hr_payslips(emp_department, payroll_run_id);

-- Hợp đồng sắp hết hạn
CREATE INDEX IF NOT EXISTS idx_contracts_expiring
    ON hr_employment_contracts(end_date, status)
    WHERE status = 'ACTIVE' AND end_date IS NOT NULL;

-- Covering index cho attendance report
CREATE INDEX IF NOT EXISTS idx_attendance_report
    ON hr_attendance_records(employee_id, date)
    INCLUDE (status, total_hours, late_minutes, early_leave_min);

-- Full-text search nhân viên
CREATE INDEX IF NOT EXISTS idx_employees_fulltext
    ON hr_employees USING gin(
        to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(code, '') || ' ' || coalesce(email, ''))
    );
