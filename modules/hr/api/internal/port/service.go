package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
)

// ── Employee Service Port (Inbound) ─────────────────────

// EmployeeService defines the inbound port for employee business operations.
type EmployeeService interface {
	CreateEmployee(ctx context.Context, employee *domain.Employee) error
	GetEmployee(ctx context.Context, id string) (*domain.Employee, error)
	ListEmployees(ctx context.Context, page, pageSize int) ([]domain.Employee, int64, error)
	UpdateEmployee(ctx context.Context, employee *domain.Employee) error
	DeleteEmployee(ctx context.Context, id string) error
}

// ── Attendance Service Port (Inbound) ───────────────────

// AttendanceService defines the inbound port for attendance business operations.
type AttendanceService interface {
	CheckIn(ctx context.Context, employeeID string) (*domain.AttendanceRecord, error)
	CheckOut(ctx context.Context, employeeID string) error
	GetAttendanceByEmployee(ctx context.Context, employeeID string) ([]domain.AttendanceRecord, error)
	GetAttendanceByDateRange(ctx context.Context, startDate, endDate string) ([]domain.AttendanceRecord, error)
}

// ── Leave Service Port (Inbound) ────────────────────────

// LeaveService defines the inbound port for leave management business operations.
type LeaveService interface {
	SubmitLeaveRequest(ctx context.Context, leave *domain.LeaveRequest) error
	ApproveLeave(ctx context.Context, id string, approverID string) error
	RejectLeave(ctx context.Context, id string, approverID string, reason string) error
	GetLeaveRequest(ctx context.Context, id string) (*domain.LeaveRequest, error)
	ListLeaveRequests(ctx context.Context, filters map[string]interface{}, page, pageSize int) ([]domain.LeaveRequest, int64, error)
	GetPendingCount(ctx context.Context) (int64, error)
}

// ── Payroll Service Port (Inbound) ──────────────────────

// PayrollService defines the inbound port for payroll calculation operations.
type PayrollService interface {
	CalculatePayroll(ctx context.Context, month, year int) (*domain.PayrollRun, error)
	GetPayslipByEmployee(ctx context.Context, employeeID string, month, year int) (*domain.Payslip, error)
	ListPayrollRuns(ctx context.Context, month, year, page, pageSize int) ([]domain.PayrollRun, int64, error)
	ApprovePayrollRun(ctx context.Context, id string, approverID string) error
}

// ── Organization Config Service Port (Inbound) ──────────

// OrgConfigService defines the inbound port for organization configuration.
type OrgConfigService interface {
	// Departments
	CreateDepartment(ctx context.Context, dept *domain.Department) error
	ListDepartments(ctx context.Context) ([]domain.Department, error)
	UpdateDepartment(ctx context.Context, dept *domain.Department) error
	DeleteDepartment(ctx context.Context, id uint) error

	// Positions
	CreatePosition(ctx context.Context, pos *domain.Position) error
	ListPositions(ctx context.Context) ([]domain.Position, error)
	UpdatePosition(ctx context.Context, pos *domain.Position) error
	DeletePosition(ctx context.Context, id uint) error

	// Teams
	CreateTeam(ctx context.Context, team *domain.Team) error
	ListTeams(ctx context.Context) ([]domain.Team, error)
	UpdateTeam(ctx context.Context, team *domain.Team) error
	DeleteTeam(ctx context.Context, id uint) error
}
