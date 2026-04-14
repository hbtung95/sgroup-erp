-- 002_hr_full_schema.down.sql
-- Rollback: Drop all tables in reverse dependency order

-- System
DROP TABLE IF EXISTS hr_audit_logs CASCADE;

-- Onboarding & Assets
DROP TABLE IF EXISTS hr_onboarding_tasks CASCADE;
DROP TABLE IF EXISTS hr_employee_assets CASCADE;
DROP TABLE IF EXISTS hr_employee_benefits CASCADE;
DROP TABLE IF EXISTS hr_benefit_plans CASCADE;

-- Performance
DROP TABLE IF EXISTS hr_rewards_disciplines CASCADE;
DROP TABLE IF EXISTS hr_review_kpis CASCADE;
DROP TABLE IF EXISTS hr_performance_reviews CASCADE;
DROP TABLE IF EXISTS hr_review_cycles CASCADE;

-- Training
DROP TABLE IF EXISTS hr_course_enrollments CASCADE;
DROP TABLE IF EXISTS hr_courses CASCADE;

-- Recruitment
DROP TABLE IF EXISTS hr_interview_interviewers CASCADE;
DROP TABLE IF EXISTS hr_interview_schedules CASCADE;
DROP TABLE IF EXISTS hr_candidates CASCADE;
DROP TABLE IF EXISTS hr_jobs CASCADE;

-- Payroll
DROP TABLE IF EXISTS hr_tax_brackets CASCADE;
DROP TABLE IF EXISTS hr_payslip_items CASCADE;
DROP TABLE IF EXISTS hr_payslips CASCADE;
DROP TABLE IF EXISTS hr_payroll_runs CASCADE;

-- Attendance & Leave
DROP TABLE IF EXISTS hr_holidays CASCADE;
DROP TABLE IF EXISTS hr_leave_balances CASCADE;
DROP TABLE IF EXISTS hr_leave_requests CASCADE;
DROP TABLE IF EXISTS hr_overtime_records CASCADE;
DROP TABLE IF EXISTS hr_attendance_records CASCADE;

-- Contracts
DROP TABLE IF EXISTS hr_transfer_history CASCADE;
DROP TABLE IF EXISTS hr_salary_adjustments CASCADE;
DROP TABLE IF EXISTS hr_employment_contracts CASCADE;

-- Employees (remove circular FK first)
ALTER TABLE IF EXISTS hr_departments DROP CONSTRAINT IF EXISTS fk_dept_manager;
ALTER TABLE IF EXISTS hr_teams DROP CONSTRAINT IF EXISTS fk_team_leader;
DROP TABLE IF EXISTS hr_employee_contacts CASCADE;
DROP TABLE IF EXISTS hr_employee_documents CASCADE;
DROP TABLE IF EXISTS hr_employees CASCADE;

-- Organization
DROP TABLE IF EXISTS hr_teams CASCADE;
DROP TABLE IF EXISTS hr_positions CASCADE;
DROP TABLE IF EXISTS hr_departments CASCADE;
