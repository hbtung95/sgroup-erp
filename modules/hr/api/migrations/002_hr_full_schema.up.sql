-- 002_hr_full_schema.up.sql
-- SGroup ERP — Module Nhân Sự — Database Schema v2.0
-- Mở rộng từ 8 bảng → 30 bảng, tuân thủ Luật Lao động Việt Nam 2026
-- 
-- QUAN TRỌNG: Migration này DROP toàn bộ bảng cũ và tạo lại.
-- Chỉ chạy trên môi trường DEV hoặc khi chưa có dữ liệu production.
-- Production cần migration incremental riêng.

-- ============================================================================
-- BƯỚC 0: Dọn dẹp schema cũ (chỉ dev)
-- ============================================================================
ALTER TABLE IF EXISTS hr_departments DROP CONSTRAINT IF EXISTS fk_hr_departments_manager;
DROP TABLE IF EXISTS hr_payslips CASCADE;
DROP TABLE IF EXISTS hr_payroll_runs CASCADE;
DROP TABLE IF EXISTS hr_attendance_records CASCADE;
DROP TABLE IF EXISTS hr_employment_contracts CASCADE;
DROP TABLE IF EXISTS hr_employees CASCADE;
DROP TABLE IF EXISTS hr_departments CASCADE;
DROP TABLE IF EXISTS hr_positions CASCADE;
DROP TABLE IF EXISTS hr_audit_logs CASCADE;
-- Drop new tables too (idempotent re-run)
DROP TABLE IF EXISTS hr_onboarding_tasks CASCADE;
DROP TABLE IF EXISTS hr_employee_assets CASCADE;
DROP TABLE IF EXISTS hr_employee_benefits CASCADE;
DROP TABLE IF EXISTS hr_benefit_plans CASCADE;
DROP TABLE IF EXISTS hr_rewards_disciplines CASCADE;
DROP TABLE IF EXISTS hr_review_kpis CASCADE;
DROP TABLE IF EXISTS hr_performance_reviews CASCADE;
DROP TABLE IF EXISTS hr_review_cycles CASCADE;
DROP TABLE IF EXISTS hr_course_enrollments CASCADE;
DROP TABLE IF EXISTS hr_courses CASCADE;
DROP TABLE IF EXISTS hr_interview_interviewers CASCADE;
DROP TABLE IF EXISTS hr_interview_schedules CASCADE;
DROP TABLE IF EXISTS hr_candidates CASCADE;
DROP TABLE IF EXISTS hr_jobs CASCADE;
DROP TABLE IF EXISTS hr_tax_brackets CASCADE;
DROP TABLE IF EXISTS hr_payslip_items CASCADE;
DROP TABLE IF EXISTS hr_holidays CASCADE;
DROP TABLE IF EXISTS hr_leave_balances CASCADE;
DROP TABLE IF EXISTS hr_leave_requests CASCADE;
DROP TABLE IF EXISTS hr_overtime_records CASCADE;
DROP TABLE IF EXISTS hr_transfer_history CASCADE;
DROP TABLE IF EXISTS hr_salary_adjustments CASCADE;
DROP TABLE IF EXISTS hr_employee_contacts CASCADE;
DROP TABLE IF EXISTS hr_employee_documents CASCADE;
DROP TABLE IF EXISTS hr_teams CASCADE;

-- ============================================================================
-- NHÓM 1: CƠ CẤU TỔ CHỨC
-- ============================================================================

-- 1.1 Phòng ban (cây phân cấp)
CREATE TABLE hr_departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    parent_id       UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    manager_id      UUID,  -- FK thêm sau (circular dependency)
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_departments_parent ON hr_departments(parent_id);
CREATE INDEX idx_departments_status ON hr_departments(status);

-- 1.2 Chức danh
CREATE TABLE hr_positions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    level           VARCHAR(50) DEFAULT 'Junior',
    min_salary      DECIMAL(18,4),
    max_salary      DECIMAL(18,4),
    department_id   UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_positions_department ON hr_positions(department_id);
CREATE INDEX idx_positions_level ON hr_positions(level);

-- 1.3 Team (nhóm trong phòng ban)
CREATE TABLE hr_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    department_id   UUID NOT NULL REFERENCES hr_departments(id) ON DELETE CASCADE,
    leader_id       UUID,  -- FK thêm sau
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_teams_department ON hr_teams(department_id);
CREATE INDEX idx_teams_leader ON hr_teams(leader_id);

-- ============================================================================
-- NHÓM 2: NHÂN VIÊN & HỒ SƠ
-- ============================================================================

-- 2.1 Hồ sơ nhân viên (entity trung tâm)
CREATE TABLE hr_employees (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Mã định danh
    code                VARCHAR(50) UNIQUE NOT NULL,

    -- Thông tin cá nhân
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    full_name           VARCHAR(200),
    english_name        VARCHAR(200),
    date_of_birth       DATE,
    gender              VARCHAR(10),
    marital_status      VARCHAR(20),
    nationality         VARCHAR(50) DEFAULT 'Việt Nam',
    ethnicity           VARCHAR(50),
    religion            VARCHAR(50),
    avatar_url          VARCHAR(500),

    -- Giấy tờ tùy thân (VN)
    identity_card       VARCHAR(50) UNIQUE,
    vn_id               VARCHAR(20) UNIQUE,
    id_issue_date       DATE,
    id_issue_place      VARCHAR(255),
    passport_number     VARCHAR(50),
    passport_expiry     DATE,

    -- Thuế & Bảo hiểm
    tax_code            VARCHAR(20),
    insurance_book_no   VARCHAR(30),
    health_insurance_no VARCHAR(30),

    -- Ngân hàng
    bank_name           VARCHAR(100),
    bank_branch         VARCHAR(200),
    bank_account        VARCHAR(50),
    bank_account_name   VARCHAR(200),

    -- Liên hệ
    email               VARCHAR(255) UNIQUE NOT NULL,
    personal_email      VARCHAR(255),
    phone               VARCHAR(20),
    relative_phone      VARCHAR(20),
    relative_name       VARCHAR(200),
    relative_relation   VARCHAR(50),

    -- Địa chỉ
    permanent_address   TEXT,
    current_address     TEXT,

    -- Vị trí công việc
    department_id       UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    team_id             UUID REFERENCES hr_teams(id) ON DELETE SET NULL,
    position_id         UUID REFERENCES hr_positions(id) ON DELETE SET NULL,
    manager_id          UUID REFERENCES hr_employees(id) ON DELETE SET NULL,

    -- Trạng thái
    status              VARCHAR(30) DEFAULT 'ACTIVE',
    employment_type     VARCHAR(30) DEFAULT 'FULL_TIME',
    join_date           DATE,
    probation_end_date  DATE,
    leave_date          DATE,
    leave_reason        TEXT,

    -- Học vấn
    education_level     VARCHAR(50),
    university          VARCHAR(200),
    major               VARCHAR(200),
    graduation_year     INT,

    -- Metadata
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_employees_code ON hr_employees(code);
CREATE INDEX idx_employees_email ON hr_employees(email);
CREATE INDEX idx_employees_department ON hr_employees(department_id);
CREATE INDEX idx_employees_team ON hr_employees(team_id);
CREATE INDEX idx_employees_position ON hr_employees(position_id);
CREATE INDEX idx_employees_manager ON hr_employees(manager_id);
CREATE INDEX idx_employees_status ON hr_employees(status);
CREATE INDEX idx_employees_join_date ON hr_employees(join_date);
CREATE INDEX idx_employees_deleted_at ON hr_employees(deleted_at);
CREATE INDEX idx_employees_identity_card ON hr_employees(identity_card);
CREATE INDEX idx_employees_tax_code ON hr_employees(tax_code);

-- Fix circular FKs
ALTER TABLE hr_departments ADD CONSTRAINT fk_dept_manager
    FOREIGN KEY (manager_id) REFERENCES hr_employees(id) ON DELETE SET NULL;
ALTER TABLE hr_teams ADD CONSTRAINT fk_team_leader
    FOREIGN KEY (leader_id) REFERENCES hr_employees(id) ON DELETE SET NULL;

-- 2.2 Tài liệu hồ sơ nhân viên
CREATE TABLE hr_employee_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    document_type   VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    notes           TEXT,
    uploaded_by     UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_emp_docs_employee ON hr_employee_documents(employee_id);
CREATE INDEX idx_emp_docs_type ON hr_employee_documents(document_type);
CREATE INDEX idx_emp_docs_deleted_at ON hr_employee_documents(deleted_at);

-- 2.3 Người phụ thuộc / Gia cảnh (giảm trừ thuế TNCN)
CREATE TABLE hr_employee_contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    relationship    VARCHAR(50) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    date_of_birth   DATE,
    identity_card   VARCHAR(50),
    phone           VARCHAR(20),
    is_dependent    BOOLEAN DEFAULT FALSE,
    dependent_from  DATE,
    dependent_to    DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_emp_contacts_employee ON hr_employee_contacts(employee_id);
CREATE INDEX idx_emp_contacts_dependent ON hr_employee_contacts(is_dependent) WHERE is_dependent = TRUE;

-- ============================================================================
-- NHÓM 3: HỢP ĐỒNG LAO ĐỘNG
-- ============================================================================

-- 3.1 Hợp đồng lao động
CREATE TABLE hr_employment_contracts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number     VARCHAR(100) UNIQUE NOT NULL,
    employee_id         UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,

    -- Loại & thời hạn
    contract_type       VARCHAR(50) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE,
    signing_date        DATE,

    -- Lifecycle
    status              VARCHAR(30) DEFAULT 'ACTIVE',
    terminated_date     DATE,
    terminated_reason   TEXT,
    previous_contract_id UUID REFERENCES hr_employment_contracts(id) ON DELETE SET NULL,

    -- Tài chính
    base_salary         DECIMAL(18,4) NOT NULL,
    probation_salary    DECIMAL(18,4),
    currency            VARCHAR(10) DEFAULT 'VND',
    salary_type         VARCHAR(20) DEFAULT 'GROSS',

    -- Điều kiện làm việc
    working_hours       INT DEFAULT 8,
    working_days        INT DEFAULT 22,
    work_location       VARCHAR(255),

    -- Tài liệu
    document_url        VARCHAR(500),
    notes               TEXT,

    -- Người ký
    signed_by           UUID REFERENCES hr_employees(id) ON DELETE SET NULL,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_contracts_employee ON hr_employment_contracts(employee_id);
CREATE INDEX idx_contracts_status ON hr_employment_contracts(status);
CREATE INDEX idx_contracts_end_date ON hr_employment_contracts(end_date);
CREATE INDEX idx_contracts_deleted_at ON hr_employment_contracts(deleted_at);
CREATE INDEX idx_contracts_type ON hr_employment_contracts(contract_type);

-- 3.2 Lịch sử điều chỉnh lương
CREATE TABLE hr_salary_adjustments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    contract_id     UUID REFERENCES hr_employment_contracts(id) ON DELETE SET NULL,
    old_salary      DECIMAL(18,4) NOT NULL,
    new_salary      DECIMAL(18,4) NOT NULL,
    adjustment_type VARCHAR(30) NOT NULL,
    effective_date  DATE NOT NULL,
    reason          TEXT,
    approved_by     UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    approved_at     TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_salary_adj_employee ON hr_salary_adjustments(employee_id);
CREATE INDEX idx_salary_adj_effective ON hr_salary_adjustments(effective_date);
CREATE INDEX idx_salary_adj_status ON hr_salary_adjustments(status);

-- 3.3 Lịch sử điều chuyển
CREATE TABLE hr_transfer_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id         UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    from_department_id  UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    from_team_id        UUID REFERENCES hr_teams(id) ON DELETE SET NULL,
    from_position_id    UUID REFERENCES hr_positions(id) ON DELETE SET NULL,
    to_department_id    UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    to_team_id          UUID REFERENCES hr_teams(id) ON DELETE SET NULL,
    to_position_id      UUID REFERENCES hr_positions(id) ON DELETE SET NULL,
    transfer_type       VARCHAR(30) NOT NULL,
    effective_date      DATE NOT NULL,
    reason              TEXT,
    decision_number     VARCHAR(100),
    approved_by         UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transfer_employee ON hr_transfer_history(employee_id);
CREATE INDEX idx_transfer_effective ON hr_transfer_history(effective_date);

-- ============================================================================
-- NHÓM 4: CHẤM CÔNG, TĂNG CA & NGHỈ PHÉP
-- ============================================================================

-- 4.1 Chấm công
CREATE TABLE hr_attendance_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    check_in        TIMESTAMPTZ,
    check_out       TIMESTAMPTZ,
    total_hours     NUMERIC(5,2),
    late_minutes    INT DEFAULT 0,
    early_leave_min INT DEFAULT 0,
    status          VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    source          VARCHAR(30) DEFAULT 'MANUAL',
    remarks         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(employee_id, date)
);
CREATE INDEX idx_attendance_emp_date ON hr_attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON hr_attendance_records(date);
CREATE INDEX idx_attendance_status ON hr_attendance_records(status);
CREATE INDEX idx_attendance_deleted_at ON hr_attendance_records(deleted_at);

-- 4.2 Đăng ký tăng ca
CREATE TABLE hr_overtime_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    total_hours     NUMERIC(5,2) NOT NULL,
    overtime_type   VARCHAR(30) NOT NULL,
    multiplier      NUMERIC(3,2) NOT NULL DEFAULT 1.50,
    reason          TEXT,
    status          VARCHAR(20) DEFAULT 'PENDING',
    approved_by     UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    approved_at     TIMESTAMPTZ,
    rejection_note  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_overtime_employee ON hr_overtime_records(employee_id);
CREATE INDEX idx_overtime_date ON hr_overtime_records(date);
CREATE INDEX idx_overtime_status ON hr_overtime_records(status);
CREATE INDEX idx_overtime_deleted_at ON hr_overtime_records(deleted_at);

-- 4.3 Đơn xin nghỉ phép (phê duyệt đa cấp)
CREATE TABLE hr_leave_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    leave_type      VARCHAR(30) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    total_days      NUMERIC(4,1) NOT NULL,
    is_half_day     BOOLEAN DEFAULT FALSE,
    half_day_period VARCHAR(10),
    reason          TEXT NOT NULL,
    attachment_url  VARCHAR(500),

    -- Multi-level approval
    status          VARCHAR(20) DEFAULT 'PENDING',
    leader_id       UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    leader_status   VARCHAR(20),
    leader_note     TEXT,
    leader_at       TIMESTAMPTZ,
    approver_id     UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    approver_status VARCHAR(20),
    approver_note   TEXT,
    approved_at     TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_leave_employee ON hr_leave_requests(employee_id);
CREATE INDEX idx_leave_type ON hr_leave_requests(leave_type);
CREATE INDEX idx_leave_status ON hr_leave_requests(status);
CREATE INDEX idx_leave_dates ON hr_leave_requests(start_date, end_date);

-- 4.4 Quỹ phép năm
CREATE TABLE hr_leave_balances (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id         UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    year                INT NOT NULL,
    annual_entitled     NUMERIC(4,1) DEFAULT 12,
    annual_used         NUMERIC(4,1) DEFAULT 0,
    annual_pending      NUMERIC(4,1) DEFAULT 0,
    annual_carried      NUMERIC(4,1) DEFAULT 0,
    sick_entitled       NUMERIC(4,1) DEFAULT 30,
    sick_used           NUMERIC(4,1) DEFAULT 0,
    unpaid_used         NUMERIC(4,1) DEFAULT 0,
    comp_off_entitled   NUMERIC(4,1) DEFAULT 0,
    comp_off_used       NUMERIC(4,1) DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, year)
);
CREATE INDEX idx_leave_bal_emp_year ON hr_leave_balances(employee_id, year);

-- 4.5 Lịch nghỉ lễ công ty
CREATE TABLE hr_holidays (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    date            DATE NOT NULL,
    end_date        DATE,
    holiday_type    VARCHAR(30) NOT NULL,
    is_paid         BOOLEAN DEFAULT TRUE,
    year            INT NOT NULL,
    description     TEXT,
    created_by      UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, holiday_type)
);
CREATE INDEX idx_holidays_year ON hr_holidays(year);
CREATE INDEX idx_holidays_date ON hr_holidays(date);

-- ============================================================================
-- NHÓM 5: BẢNG LƯƠNG & THUẾ TNCN
-- ============================================================================

-- 5.1 Đợt chạy lương
CREATE TABLE hr_payroll_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    period_month        INT NOT NULL,
    period_year         INT NOT NULL,
    cycle_start         DATE NOT NULL,
    cycle_end           DATE NOT NULL,
    total_employees     INT DEFAULT 0,
    total_gross         DECIMAL(18,4) DEFAULT 0,
    total_net           DECIMAL(18,4) DEFAULT 0,
    total_company_cost  DECIMAL(18,4) DEFAULT 0,
    status              VARCHAR(30) DEFAULT 'DRAFT',
    calculated_at       TIMESTAMPTZ,
    calculated_by       UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    paid_at             TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(period_month, period_year)
);
CREATE INDEX idx_payroll_period ON hr_payroll_runs(period_year, period_month);
CREATE INDEX idx_payroll_status ON hr_payroll_runs(status);
CREATE INDEX idx_payroll_deleted_at ON hr_payroll_runs(deleted_at);

-- 5.2 Phiếu lương chi tiết (tuân thủ Luật LĐ Việt Nam)
CREATE TABLE hr_payslips (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id      UUID NOT NULL REFERENCES hr_payroll_runs(id) ON DELETE CASCADE,
    employee_id         UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,

    -- Snapshot NV tại thời điểm tính lương (denormalization)
    emp_code            VARCHAR(50),
    emp_full_name       VARCHAR(200),
    emp_department      VARCHAR(255),
    emp_position        VARCHAR(255),
    emp_bank_account    VARCHAR(50),
    emp_bank_name       VARCHAR(100),

    -- Ngày công
    standard_work_days  NUMERIC(5,2) NOT NULL DEFAULT 22,
    actual_work_days    NUMERIC(5,2) NOT NULL DEFAULT 0,
    leave_days_paid     NUMERIC(4,1) DEFAULT 0,
    leave_days_unpaid   NUMERIC(4,1) DEFAULT 0,
    overtime_hours      NUMERIC(5,2) DEFAULT 0,
    late_count          INT DEFAULT 0,

    -- Thu nhập
    base_salary         DECIMAL(18,4) NOT NULL,
    prorated_salary     DECIMAL(18,4) NOT NULL,
    overtime_pay        DECIMAL(18,4) DEFAULT 0,
    allowances_total    DECIMAL(18,4) DEFAULT 0,
    bonus_total         DECIMAL(18,4) DEFAULT 0,
    gross_income        DECIMAL(18,4) NOT NULL,

    -- Khấu trừ NV (Luật VN)
    bhxh_employee       DECIMAL(18,4) DEFAULT 0,
    bhyt_employee       DECIMAL(18,4) DEFAULT 0,
    bhtn_employee       DECIMAL(18,4) DEFAULT 0,
    total_insurance_emp DECIMAL(18,4) DEFAULT 0,

    -- Thuế TNCN
    taxable_income      DECIMAL(18,4) DEFAULT 0,
    personal_deduction  DECIMAL(18,4) DEFAULT 11000000,
    dependent_deduction DECIMAL(18,4) DEFAULT 0,
    dependent_count     INT DEFAULT 0,
    tax_amount          DECIMAL(18,4) DEFAULT 0,

    -- Khấu trừ khác
    other_deductions    DECIMAL(18,4) DEFAULT 0,
    total_deductions    DECIMAL(18,4) DEFAULT 0,

    -- BHXH phía Doanh nghiệp
    bhxh_company        DECIMAL(18,4) DEFAULT 0,
    bhyt_company        DECIMAL(18,4) DEFAULT 0,
    bhtn_company        DECIMAL(18,4) DEFAULT 0,
    total_insurance_co  DECIMAL(18,4) DEFAULT 0,

    -- Thực lĩnh
    net_salary          DECIMAL(18,4) NOT NULL,
    total_company_cost  DECIMAL(18,4) DEFAULT 0,

    -- Trạng thái
    status              VARCHAR(20) DEFAULT 'DRAFT',
    paid_at             TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    UNIQUE(payroll_run_id, employee_id)
);
CREATE INDEX idx_payslips_run ON hr_payslips(payroll_run_id);
CREATE INDEX idx_payslips_employee ON hr_payslips(employee_id);
CREATE INDEX idx_payslips_status ON hr_payslips(status);
CREATE INDEX idx_payslips_deleted_at ON hr_payslips(deleted_at);

-- 5.3 Chi tiết dòng phụ cấp / khấu trừ
CREATE TABLE hr_payslip_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payslip_id      UUID NOT NULL REFERENCES hr_payslips(id) ON DELETE CASCADE,
    category        VARCHAR(30) NOT NULL,
    item_code       VARCHAR(50) NOT NULL,
    item_name       VARCHAR(200) NOT NULL,
    amount          DECIMAL(18,4) NOT NULL,
    quantity        NUMERIC(5,2) DEFAULT 1,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payslip_items_payslip ON hr_payslip_items(payslip_id);
CREATE INDEX idx_payslip_items_category ON hr_payslip_items(category);

-- 5.4 Biểu thuế TNCN lũy tiến 7 bậc (Luật Thuế TNCN VN)
CREATE TABLE hr_tax_brackets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bracket_level   INT NOT NULL,
    min_income      DECIMAL(18,4) NOT NULL,
    max_income      DECIMAL(18,4),
    tax_rate        NUMERIC(5,2) NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tax_brackets_effective ON hr_tax_brackets(effective_from, effective_to);

-- Seed: Biểu thuế TNCN 2026
INSERT INTO hr_tax_brackets (id, bracket_level, min_income, max_income, tax_rate, effective_from, notes) VALUES
    (gen_random_uuid(), 1, 0,          5000000,    5.00,  '2026-01-01', 'Đến 5 triệu'),
    (gen_random_uuid(), 2, 5000000,    10000000,   10.00, '2026-01-01', 'Trên 5 - 10 triệu'),
    (gen_random_uuid(), 3, 10000000,   18000000,   15.00, '2026-01-01', 'Trên 10 - 18 triệu'),
    (gen_random_uuid(), 4, 18000000,   32000000,   20.00, '2026-01-01', 'Trên 18 - 32 triệu'),
    (gen_random_uuid(), 5, 32000000,   52000000,   25.00, '2026-01-01', 'Trên 32 - 52 triệu'),
    (gen_random_uuid(), 6, 52000000,   80000000,   30.00, '2026-01-01', 'Trên 52 - 80 triệu'),
    (gen_random_uuid(), 7, 80000000,   NULL,       35.00, '2026-01-01', 'Trên 80 triệu');

-- ============================================================================
-- NHÓM 6: TUYỂN DỤNG
-- ============================================================================

-- 6.1 Tin tuyển dụng
CREATE TABLE hr_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    code                VARCHAR(50) UNIQUE NOT NULL,
    department_id       UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    position_id         UUID REFERENCES hr_positions(id) ON DELETE SET NULL,
    description         TEXT,
    requirements        TEXT,
    benefits            TEXT,
    employment_type     VARCHAR(30) DEFAULT 'FULL_TIME',
    experience_min      INT,
    salary_min          DECIMAL(18,4),
    salary_max          DECIMAL(18,4),
    headcount           INT DEFAULT 1,
    status              VARCHAR(20) DEFAULT 'DRAFT',
    priority            VARCHAR(10) DEFAULT 'NORMAL',
    opened_at           TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    deadline            DATE,
    recruiter_id        UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    hiring_manager_id   UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_jobs_status ON hr_jobs(status);
CREATE INDEX idx_jobs_department ON hr_jobs(department_id);
CREATE INDEX idx_jobs_recruiter ON hr_jobs(recruiter_id);
CREATE INDEX idx_jobs_deleted_at ON hr_jobs(deleted_at);

-- 6.2 Ứng viên
CREATE TABLE hr_candidates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID REFERENCES hr_jobs(id) ON DELETE SET NULL,
    full_name           VARCHAR(200) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),
    date_of_birth       DATE,
    cv_url              VARCHAR(500),
    cover_letter        TEXT,
    portfolio_url       VARCHAR(500),
    source              VARCHAR(50),
    referred_by         UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    experience_years    INT,
    current_salary      DECIMAL(18,4),
    expected_salary     DECIMAL(18,4),
    stage               VARCHAR(30) DEFAULT 'NEW',
    rating              INT CHECK (rating >= 1 AND rating <= 5),
    rejection_reason    TEXT,
    notes               TEXT,
    hired_employee_id   UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_candidates_job ON hr_candidates(job_id);
CREATE INDEX idx_candidates_stage ON hr_candidates(stage);
CREATE INDEX idx_candidates_email ON hr_candidates(email);
CREATE INDEX idx_candidates_deleted_at ON hr_candidates(deleted_at);

-- 6.3 Lịch phỏng vấn
CREATE TABLE hr_interview_schedules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id        UUID NOT NULL REFERENCES hr_candidates(id) ON DELETE CASCADE,
    round               INT DEFAULT 1,
    interview_type      VARCHAR(30) DEFAULT 'ONSITE',
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INT DEFAULT 60,
    location            VARCHAR(255),
    status              VARCHAR(20) DEFAULT 'SCHEDULED',
    overall_rating      INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
    feedback            TEXT,
    result              VARCHAR(20),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_interviews_candidate ON hr_interview_schedules(candidate_id);
CREATE INDEX idx_interviews_scheduled ON hr_interview_schedules(scheduled_at);
CREATE INDEX idx_interviews_status ON hr_interview_schedules(status);

-- 6.4 Bảng trung gian: Người phỏng vấn (thay thế UUID ARRAY)
CREATE TABLE hr_interview_interviewers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id    UUID NOT NULL REFERENCES hr_interview_schedules(id) ON DELETE CASCADE,
    interviewer_id  UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    feedback        TEXT,
    rating          INT CHECK (rating >= 1 AND rating <= 5),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(interview_id, interviewer_id)
);
CREATE INDEX idx_interview_interviewers_interview ON hr_interview_interviewers(interview_id);
CREATE INDEX idx_interview_interviewers_interviewer ON hr_interview_interviewers(interviewer_id);

-- ============================================================================
-- NHÓM 7: ĐÀO TẠO & PHÁT TRIỂN
-- ============================================================================

-- 7.1 Khóa đào tạo
CREATE TABLE hr_courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    category        VARCHAR(50),
    instructor      VARCHAR(200),
    duration_hours  INT,
    max_participants INT,
    location        VARCHAR(255),
    is_mandatory    BOOLEAN DEFAULT FALSE,
    is_online       BOOLEAN DEFAULT FALSE,
    content_url     VARCHAR(500),
    start_date      DATE,
    end_date        DATE,
    cost_per_person DECIMAL(18,4) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'DRAFT',
    created_by      UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_courses_category ON hr_courses(category);
CREATE INDEX idx_courses_status ON hr_courses(status);
CREATE INDEX idx_courses_deleted_at ON hr_courses(deleted_at);

-- 7.2 Đăng ký đào tạo
CREATE TABLE hr_course_enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES hr_courses(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'ENROLLED',
    enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    score           NUMERIC(5,2),
    certificate_url VARCHAR(500),
    feedback        TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, employee_id)
);
CREATE INDEX idx_enrollments_course ON hr_course_enrollments(course_id);
CREATE INDEX idx_enrollments_employee ON hr_course_enrollments(employee_id);
CREATE INDEX idx_enrollments_status ON hr_course_enrollments(status);

-- ============================================================================
-- NHÓM 8: ĐÁNH GIÁ HIỆU SUẤT & KHEN THƯỞNG
-- ============================================================================

-- 8.1 Kỳ đánh giá
CREATE TABLE hr_review_cycles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    cycle_type      VARCHAR(20) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    deadline        DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'DRAFT',
    description     TEXT,
    created_by      UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_review_cycles_status ON hr_review_cycles(status);
CREATE INDEX idx_review_cycles_dates ON hr_review_cycles(start_date, end_date);

-- 8.2 Đánh giá cá nhân
CREATE TABLE hr_performance_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id        UUID NOT NULL REFERENCES hr_review_cycles(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    reviewer_id     UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    self_rating       NUMERIC(3,1),
    manager_rating    NUMERIC(3,1),
    final_rating      NUMERIC(3,1),
    grade             VARCHAR(10),
    self_comment      TEXT,
    manager_comment   TEXT,
    improvement_plan  TEXT,
    status            VARCHAR(20) DEFAULT 'PENDING',
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cycle_id, employee_id)
);
CREATE INDEX idx_reviews_cycle ON hr_performance_reviews(cycle_id);
CREATE INDEX idx_reviews_employee ON hr_performance_reviews(employee_id);
CREATE INDEX idx_reviews_status ON hr_performance_reviews(status);
CREATE INDEX idx_reviews_grade ON hr_performance_reviews(grade);

-- 8.3 Chi tiết KPI
CREATE TABLE hr_review_kpis (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id       UUID NOT NULL REFERENCES hr_performance_reviews(id) ON DELETE CASCADE,
    kpi_name        VARCHAR(255) NOT NULL,
    kpi_category    VARCHAR(50),
    weight          NUMERIC(5,2) NOT NULL DEFAULT 0,
    target          VARCHAR(500),
    actual_result   VARCHAR(500),
    self_score      NUMERIC(3,1),
    manager_score   NUMERIC(3,1),
    final_score     NUMERIC(3,1),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_kpis_review ON hr_review_kpis(review_id);
CREATE INDEX idx_kpis_category ON hr_review_kpis(kpi_category);

-- 8.4 Khen thưởng / Kỷ luật
CREATE TABLE hr_rewards_disciplines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    decision_number VARCHAR(100),
    effective_date  DATE NOT NULL,
    amount          DECIMAL(18,4) DEFAULT 0,
    issued_by       UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    approved_by     UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    document_url    VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rd_employee ON hr_rewards_disciplines(employee_id);
CREATE INDEX idx_rd_type ON hr_rewards_disciplines(type);
CREATE INDEX idx_rd_effective ON hr_rewards_disciplines(effective_date);

-- ============================================================================
-- NHÓM 9: PHÚC LỢI, TÀI SẢN & ONBOARDING
-- ============================================================================

-- 9.1 Gói phúc lợi
CREATE TABLE hr_benefit_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    category        VARCHAR(50) NOT NULL,
    description     TEXT,
    amount          DECIMAL(18,4) DEFAULT 0,
    frequency       VARCHAR(20) DEFAULT 'MONTHLY',
    is_taxable      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    eligible_after_months INT DEFAULT 0,
    eligible_levels VARCHAR(255),
    provider        VARCHAR(255),
    contract_url    VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_benefits_category ON hr_benefit_plans(category);
CREATE INDEX idx_benefits_active ON hr_benefit_plans(is_active);

-- 9.2 Gán phúc lợi cho NV
CREATE TABLE hr_employee_benefits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    plan_id         UUID NOT NULL REFERENCES hr_benefit_plans(id) ON DELETE CASCADE,
    start_date      DATE NOT NULL,
    end_date        DATE,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    custom_amount   DECIMAL(18,4),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, plan_id)
);
CREATE INDEX idx_emp_benefits_employee ON hr_employee_benefits(employee_id);
CREATE INDEX idx_emp_benefits_plan ON hr_employee_benefits(plan_id);
CREATE INDEX idx_emp_benefits_status ON hr_employee_benefits(status);

-- 9.3 Tài sản giao cho NV
CREATE TABLE hr_employee_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    asset_type      VARCHAR(50) NOT NULL,
    asset_name      VARCHAR(255) NOT NULL,
    asset_code      VARCHAR(100),
    serial_number   VARCHAR(100),
    purchase_value  DECIMAL(18,4),
    current_value   DECIMAL(18,4),
    assigned_date   DATE NOT NULL,
    expected_return DATE,
    returned_date   DATE,
    condition_out   VARCHAR(30) DEFAULT 'NEW',
    condition_in    VARCHAR(30),
    status          VARCHAR(20) DEFAULT 'ASSIGNED',
    notes           TEXT,
    assigned_by     UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_assets_employee ON hr_employee_assets(employee_id);
CREATE INDEX idx_assets_type ON hr_employee_assets(asset_type);
CREATE INDEX idx_assets_status ON hr_employee_assets(status);

-- 9.4 Checklist Onboarding/Offboarding
CREATE TABLE hr_onboarding_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    task_type       VARCHAR(30) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'PENDING',
    due_date        DATE,
    completed_at    TIMESTAMPTZ,
    completed_by    UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    sort_order      INT DEFAULT 0,
    is_mandatory    BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_onboarding_employee ON hr_onboarding_tasks(employee_id);
CREATE INDEX idx_onboarding_type ON hr_onboarding_tasks(task_type);
CREATE INDEX idx_onboarding_status ON hr_onboarding_tasks(status);

-- ============================================================================
-- HỆ THỐNG: NHẬT KÝ THAY ĐỔI
-- ============================================================================

CREATE TABLE hr_audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name      VARCHAR(100) NOT NULL,
    record_id       UUID NOT NULL,
    action          VARCHAR(20) NOT NULL,
    old_values      JSONB,
    new_values      JSONB,
    changed_by      UUID,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_table ON hr_audit_logs(table_name);
CREATE INDEX idx_audit_record ON hr_audit_logs(record_id);
CREATE INDEX idx_audit_changed_by ON hr_audit_logs(changed_by);
CREATE INDEX idx_audit_created_at ON hr_audit_logs(created_at);
CREATE INDEX idx_audit_action ON hr_audit_logs(action);

-- ============================================================================
-- SEED: Nghỉ Lễ Việt Nam 2026
-- ============================================================================
INSERT INTO hr_holidays (id, name, date, end_date, holiday_type, is_paid, year, description) VALUES
    (gen_random_uuid(), 'Tết Dương lịch',         '2026-01-01', NULL,          'NATIONAL', TRUE, 2026, 'Ngày Quốc tế Lao động'),
    (gen_random_uuid(), 'Tết Nguyên Đán',          '2026-02-17', '2026-02-22', 'NATIONAL', TRUE, 2026, 'Nghỉ Tết Âm lịch Bính Ngọ'),
    (gen_random_uuid(), 'Giỗ Tổ Hùng Vương',       '2026-04-23', NULL,          'NATIONAL', TRUE, 2026, '10/3 Âm lịch'),
    (gen_random_uuid(), 'Ngày Giải phóng miền Nam', '2026-04-30', NULL,          'NATIONAL', TRUE, 2026, '30/4'),
    (gen_random_uuid(), 'Ngày Quốc tế Lao động',   '2026-05-01', NULL,          'NATIONAL', TRUE, 2026, '1/5'),
    (gen_random_uuid(), 'Quốc khánh',              '2026-09-02', '2026-09-03', 'NATIONAL', TRUE, 2026, '2/9 + nghỉ bù');
