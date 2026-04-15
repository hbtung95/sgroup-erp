package port

import (
	"context"

	"github.com/vctplatform/sgroup-erp/modules/hr/api/internal/domain"
)

// ── Employee Repository Port ────────────────────────────

// EmployeeRepository defines the outbound port for employee data persistence.
type EmployeeRepository interface {
	Create(ctx context.Context, employee *domain.Employee) error
	GetByID(ctx context.Context, id string) (*domain.Employee, error)
	List(ctx context.Context, offset, limit int) ([]domain.Employee, int64, error)
	Update(ctx context.Context, employee *domain.Employee) error
	Delete(ctx context.Context, id string) error
}

// ── Department Repository Port ──────────────────────────

// DepartmentRepository defines the outbound port for department data persistence.
type DepartmentRepository interface {
	Create(ctx context.Context, dept *domain.Department) error
	GetByID(ctx context.Context, id uint) (*domain.Department, error)
	List(ctx context.Context) ([]domain.Department, error)
	Update(ctx context.Context, dept *domain.Department) error
	Delete(ctx context.Context, id uint) error
}

// ── Position Repository Port ────────────────────────────

// PositionRepository defines the outbound port for position data persistence.
type PositionRepository interface {
	Create(ctx context.Context, pos *domain.Position) error
	GetByID(ctx context.Context, id uint) (*domain.Position, error)
	List(ctx context.Context) ([]domain.Position, error)
	Update(ctx context.Context, pos *domain.Position) error
	Delete(ctx context.Context, id uint) error
}

// ── Team Repository Port ────────────────────────────────

// TeamRepository defines the outbound port for team data persistence.
type TeamRepository interface {
	Create(ctx context.Context, team *domain.Team) error
	GetByID(ctx context.Context, id uint) (*domain.Team, error)
	List(ctx context.Context) ([]domain.Team, error)
	Update(ctx context.Context, team *domain.Team) error
	Delete(ctx context.Context, id uint) error
}

// ── Attendance Repository Port ──────────────────────────

// AttendanceRepository defines the outbound port for attendance data persistence.
type AttendanceRepository interface {
	Create(ctx context.Context, record *domain.AttendanceRecord) error
	GetByEmployeeID(ctx context.Context, employeeID string) ([]domain.AttendanceRecord, error)
	GetByDateRange(ctx context.Context, startDate, endDate string) ([]domain.AttendanceRecord, error)
	Update(ctx context.Context, record *domain.AttendanceRecord) error
}

// ── Leave Repository Port ───────────────────────────────

// LeaveRepository defines the outbound port for leave request data persistence.
type LeaveRepository interface {
	Create(ctx context.Context, leave *domain.LeaveRequest) error
	GetByID(ctx context.Context, id string) (*domain.LeaveRequest, error)
	List(ctx context.Context, filters map[string]interface{}, offset, limit int) ([]domain.LeaveRequest, int64, error)
	GetByEmployeeID(ctx context.Context, employeeID string) ([]domain.LeaveRequest, error)
	GetPendingCount(ctx context.Context) (int64, error)
	Update(ctx context.Context, leave *domain.LeaveRequest) error
	Delete(ctx context.Context, id string) error
}

// ── Payroll Repository Port ─────────────────────────────

// PayrollRunRepository defines the outbound port for payroll run persistence.
type PayrollRunRepository interface {
	Create(ctx context.Context, run *domain.PayrollRun) error
	GetByID(ctx context.Context, id string) (*domain.PayrollRun, error)
	List(ctx context.Context, month, year int, offset, limit int) ([]domain.PayrollRun, int64, error)
	Update(ctx context.Context, run *domain.PayrollRun) error
}

// PayslipRepository defines the outbound port for payslip persistence.
type PayslipRepository interface {
	Create(ctx context.Context, payslip *domain.Payslip) error
	GetByID(ctx context.Context, id string) (*domain.Payslip, error)
	GetByEmployeeMonth(ctx context.Context, employeeID string, month, year int) (*domain.Payslip, error)
	ListByRun(ctx context.Context, runID string) ([]domain.Payslip, error)
	BulkCreate(ctx context.Context, payslips []domain.Payslip) error
}
