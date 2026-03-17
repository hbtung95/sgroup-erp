import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ═══════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════
  async getDashboardStats() {
    const [
      totalEmployees,
      activeEmployees,
      probationEmployees,
      onLeaveCount,
      departmentCount,
      positionCount,
      pendingLeaves,
      recentHires,
    ] = await Promise.all([
      this.prisma.hrEmployee.count(),
      this.prisma.hrEmployee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.hrEmployee.count({ where: { status: 'PROBATION' } }),
      this.prisma.hrEmployee.count({ where: { status: 'ON_LEAVE' } }),
      this.prisma.hrDepartment.count({ where: { status: 'ACTIVE' } }),
      this.prisma.hrPosition.count({ where: { status: 'ACTIVE' } }),
      this.prisma.hrLeaveRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.hrEmployee.findMany({
        take: 5,
        orderBy: { joinDate: 'desc' },
        include: { department: true, position: true },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      probationEmployees,
      onLeaveCount,
      departmentCount,
      positionCount,
      pendingLeaves,
      recentHires,
    };
  }

  // ═══════════════════════════════════════════
  // DEPARTMENTS
  // ═══════════════════════════════════════════
  async findAllDepartments() {
    return this.prisma.hrDepartment.findMany({
      include: {
        manager: { select: { id: true, fullName: true, employeeCode: true } },
        _count: { select: { employees: true } },
        teams: {
          include: { _count: { select: { employees: true } } },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(data: any) {
    return this.prisma.hrDepartment.create({ data });
  }

  async updateDepartment(id: string, data: any) {
    return this.prisma.hrDepartment.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    return this.prisma.hrDepartment.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // POSITIONS
  // ═══════════════════════════════════════════
  async findAllPositions() {
    return this.prisma.hrPosition.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createPosition(data: any) {
    return this.prisma.hrPosition.create({ data });
  }

  async updatePosition(id: string, data: any) {
    return this.prisma.hrPosition.update({ where: { id }, data });
  }

  // ═══════════════════════════════════════════
  // TEAMS
  // ═══════════════════════════════════════════
  async findAllTeams(departmentId?: string) {
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    return this.prisma.hrTeam.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { employees: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTeam(data: any) {
    return this.prisma.hrTeam.create({
      data,
      include: { department: { select: { id: true, name: true } }, _count: { select: { employees: true } } },
    });
  }

  async updateTeam(id: string, data: any) {
    return this.prisma.hrTeam.update({
      where: { id }, data,
      include: { department: { select: { id: true, name: true } }, _count: { select: { employees: true } } },
    });
  }

  async deleteTeam(id: string) {
    return this.prisma.hrTeam.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // EMPLOYEES
  // ═══════════════════════════════════════════
  async findAllEmployees(opts: {
    search?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, departmentId, status, page = 1, limit = 50 } = opts;
    const where: Prisma.HrEmployeeWhereInput = {};

    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { englishName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.hrEmployee.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
          position: { select: { id: true, name: true, level: true } },
          team: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hrEmployee.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findEmployee(id: string) {
    const employee = await this.prisma.hrEmployee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        contracts: { orderBy: { startDate: 'desc' } },
        manager: { select: { id: true, fullName: true, employeeCode: true } },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async createEmployee(data: any) {
    // Generate Employee Code
    const count = await this.prisma.hrEmployee.count();
    const seq = (count + 1).toString().padStart(4, '0');
    const employeeCode = `NV${seq}`;

    // Parse dates
    if (data.joinDate && typeof data.joinDate === 'string') {
      data.joinDate = new Date(data.joinDate);
    }
    if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }
    if (!data.joinDate) {
      data.joinDate = new Date();
    }

    const employee = await this.prisma.hrEmployee.create({
      data: {
        ...data,
        employeeCode,
      },
      include: {
        department: true,
        position: true,
      },
    });

    // If assigned to a department with "Sales" or "Kinh doanh" in the name, emit event
    if (
      employee.department &&
      (employee.department.name.toLowerCase().includes('sale') ||
        employee.department.name.toLowerCase().includes('kinh doanh'))
    ) {
      this.eventEmitter.emit('hr.employee_created', employee);
      this.logger.log(`Emitted hr.employee_created for employee ${employee.employeeCode}`);
    }

    return employee;
  }

  async updateEmployee(id: string, data: any) {
    if (data.joinDate && typeof data.joinDate === 'string') data.joinDate = new Date(data.joinDate);
    if (data.dateOfBirth && typeof data.dateOfBirth === 'string') data.dateOfBirth = new Date(data.dateOfBirth);
    if (data.leaveDate && typeof data.leaveDate === 'string') data.leaveDate = new Date(data.leaveDate);

    // Fetch current employee for transfer comparison
    const current = await this.prisma.hrEmployee.findUnique({
      where: { id },
      select: { departmentId: true, teamId: true },
    });

    if (!current) throw new NotFoundException('Employee not found');

    const deptChanged = data.departmentId !== undefined && data.departmentId !== current.departmentId;
    const teamChanged = data.teamId !== undefined && data.teamId !== current.teamId;

    // Perform the update
    const updated = await this.prisma.hrEmployee.update({
      where: { id },
      data,
      include: { department: true, position: true, team: true },
    });

    // Auto-log transfer history if dept or team changed
    if (deptChanged || teamChanged) {
      const transferType = deptChanged && teamChanged ? 'BOTH' : deptChanged ? 'DEPARTMENT' : 'TEAM';

      await this.prisma.hrTransferHistory.create({
        data: {
          employeeId: id,
          transferType,
          fromDepartmentId: deptChanged ? current.departmentId : null,
          toDepartmentId: deptChanged ? data.departmentId : null,
          fromTeamId: teamChanged ? current.teamId : null,
          toTeamId: teamChanged ? data.teamId : null,
          effectiveDate: new Date(),
        },
      });

      this.logger.log(
        `Transfer logged: ${updated.employeeCode} — ${transferType} ` +
        `(dept: ${current.departmentId} → ${data.departmentId}, team: ${current.teamId} → ${data.teamId})`,
      );
    }

    return updated;
  }

  // ═══════════════════════════════════════════
  // TRANSFER HISTORY
  // ═══════════════════════════════════════════
  async getTransferHistory(employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.hrTransferHistory.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        fromDepartment: { select: { id: true, name: true } },
        toDepartment: { select: { id: true, name: true } },
        fromTeam: { select: { id: true, name: true } },
        toTeam: { select: { id: true, name: true } },
      },
      orderBy: { effectiveDate: 'desc' },
      take: 50,
    });
  }

  async deleteEmployee(id: string) {
    return this.prisma.hrEmployee.update({
      where: { id },
      data: { status: 'TERMINATED', leaveDate: new Date() },
    });
  }

  // ═══════════════════════════════════════════
  // CONTRACTS
  // ═══════════════════════════════════════════
  async findAllContracts(opts: { employeeId?: string; status?: string }) {
    const where: Prisma.HrContractWhereInput = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.status) where.status = opts.status;

    return this.prisma.hrContract.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createContract(data: any) {
    // Generate contract code
    const count = await this.prisma.hrContract.count();
    const contractCode = `HD${(count + 1).toString().padStart(5, '0')}`;

    if (data.startDate && typeof data.startDate === 'string') data.startDate = new Date(data.startDate);
    if (data.endDate && typeof data.endDate === 'string') data.endDate = new Date(data.endDate);

    return this.prisma.hrContract.create({
      data: { ...data, contractCode },
      include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
    });
  }

  async updateContract(id: string, data: any) {
    if (data.startDate && typeof data.startDate === 'string') data.startDate = new Date(data.startDate);
    if (data.endDate && typeof data.endDate === 'string') data.endDate = new Date(data.endDate);

    return this.prisma.hrContract.update({
      where: { id },
      data,
      include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
    });
  }

  // ═══════════════════════════════════════════
  // ATTENDANCE
  // ═══════════════════════════════════════════
  async findAllAttendance(opts: {
    employeeId?: string;
    date?: string;
    month?: string;
    year?: string;
  }) {
    const where: Prisma.HrAttendanceWhereInput = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.date) {
      const d = new Date(opts.date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    } else if (opts.year && opts.month) {
      const year = parseInt(opts.year);
      const month = parseInt(opts.month);
      where.date = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }

    return this.prisma.hrAttendance.findMany({
      where,
      include: {
        employee: {
          select: { id: true, fullName: true, employeeCode: true, department: { select: { name: true } } },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAttendance(data: any) {
    if (data.date && typeof data.date === 'string') data.date = new Date(data.date);
    if (data.checkInTime && typeof data.checkInTime === 'string') data.checkInTime = new Date(data.checkInTime);
    if (data.checkOutTime && typeof data.checkOutTime === 'string') data.checkOutTime = new Date(data.checkOutTime);

    // Calculate working hours if both check-in and check-out
    if (data.checkInTime && data.checkOutTime) {
      const diffMs = new Date(data.checkOutTime).getTime() - new Date(data.checkInTime).getTime();
      data.workingHours = Math.round((diffMs / 3600000) * 100) / 100;
    }

    return this.prisma.hrAttendance.create({
      data,
      include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
    });
  }

  async updateAttendance(id: string, data: any) {
    if (data.checkInTime && typeof data.checkInTime === 'string') data.checkInTime = new Date(data.checkInTime);
    if (data.checkOutTime && typeof data.checkOutTime === 'string') data.checkOutTime = new Date(data.checkOutTime);

    if (data.checkInTime && data.checkOutTime) {
      const diffMs = new Date(data.checkOutTime).getTime() - new Date(data.checkInTime).getTime();
      data.workingHours = Math.round((diffMs / 3600000) * 100) / 100;
    }

    return this.prisma.hrAttendance.update({ where: { id }, data });
  }

  // ═══════════════════════════════════════════
  // LEAVES
  // ═══════════════════════════════════════════
  async findAllLeaves(opts: { employeeId?: string; status?: string }) {
    const where: Prisma.HrLeaveRequestWhereInput = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.status) where.status = opts.status;

    return this.prisma.hrLeaveRequest.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        approver: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeave(data: any) {
    if (data.startDate && typeof data.startDate === 'string') data.startDate = new Date(data.startDate);
    if (data.endDate && typeof data.endDate === 'string') data.endDate = new Date(data.endDate);

    // Auto-calculate totalDays
    if (data.startDate && data.endDate && !data.totalDays) {
      const diffMs = new Date(data.endDate).getTime() - new Date(data.startDate).getTime();
      data.totalDays = Math.ceil(diffMs / 86400000) + 1; // Include both start and end
    }

    return this.prisma.hrLeaveRequest.create({
      data,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
      },
    });
  }

  async updateLeave(id: string, data: any) {
    if (data.startDate && typeof data.startDate === 'string') data.startDate = new Date(data.startDate);
    if (data.endDate && typeof data.endDate === 'string') data.endDate = new Date(data.endDate);

    return this.prisma.hrLeaveRequest.update({ where: { id }, data });
  }

  async approveLeave(id: string, approverId: string) {
    return this.prisma.hrLeaveRequest.update({
      where: { id },
      data: { status: 'APPROVED', approverId, approvedAt: new Date() },
    });
  }

  async rejectLeave(id: string, approverId: string, note?: string) {
    return this.prisma.hrLeaveRequest.update({
      where: { id },
      data: { status: 'REJECTED', approverId, approvedAt: new Date(), note },
    });
  }

  // ═══════════════════════════════════════════
  // PAYROLL
  // ═══════════════════════════════════════════
  async findAllPayroll(opts: {
    period?: string;
    year?: string;
    month?: string;
    status?: string;
  }) {
    const where: Prisma.HrSalaryRecordWhereInput = {};
    if (opts.period) where.period = opts.period;
    if (opts.year) where.year = parseInt(opts.year);
    if (opts.month) where.month = parseInt(opts.month);
    if (opts.status) where.status = opts.status;

    return this.prisma.hrSalaryRecord.findMany({
      where,
      include: {
        employee: {
          select: { id: true, fullName: true, employeeCode: true, department: { select: { name: true } } },
        },
        salaryItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateMonthlyPayroll(year: number, month: number) {
    const period = `${year}-${String(month).padStart(2, '0')}`;

    // Check if payroll already exists
    const existing = await this.prisma.hrSalaryRecord.findFirst({
      where: { period },
    });

    if (existing) {
      throw new BadRequestException(`Payroll for period ${period} already exists.`);
    }

    const employees = await this.prisma.hrEmployee.findMany({
      where: { status: { in: ['ACTIVE', 'PROBATION'] } },
      include: { contracts: { where: { status: 'ACTIVE' } } },
    });

    const salaryRecords = [];

    // Aggregate commissions from Sales Module
    const commissions = await this.prisma.commissionRecord.groupBy({
      by: ['staffId'],
      where: { year, month, status: 'APPROVED' },
      _sum: { commissionAmount: true },
    });

    const commissionMap = new Map<string, number>();
    for (const c of commissions) {
      const salesStaff = await this.prisma.salesStaff.findUnique({
        where: { id: c.staffId },
        select: { hrEmployeeId: true },
      });
      if (salesStaff && salesStaff.hrEmployeeId) {
        commissionMap.set(
          salesStaff.hrEmployeeId,
          Number(c._sum.commissionAmount) || 0,
        );
      }
    }

    for (const emp of employees) {
      const activeContract = emp.contracts[0];
      const baseSalary = activeContract ? Number(activeContract.baseSalary) : 0;
      const commission = commissionMap.get(emp.id) || 0;

      const record = await this.prisma.hrSalaryRecord.create({
        data: {
          employeeId: emp.id,
          period,
          year,
          month,
          baseSalaryValue: baseSalary,
          commission: commission,
          netPay: baseSalary + commission,
          status: 'DRAFT',
        },
      });
      salaryRecords.push(record);
    }

    this.logger.log(`Generated payroll for ${period} with ${salaryRecords.length} records.`);
    return salaryRecords;
  }

  async approvePayroll(period: string, approvedBy: string) {
    const records = await this.prisma.hrSalaryRecord.findMany({
      where: { period, status: 'DRAFT' },
    });

    if (records.length === 0) {
      throw new NotFoundException(`No draft payroll records found for period ${period}`);
    }

    const totalPayout = records.reduce((sum, r) => sum + Number(r.netPay), 0);

    // Update status to APPROVED
    await this.prisma.hrSalaryRecord.updateMany({
      where: { period, status: 'DRAFT' },
      data: { status: 'APPROVED' },
    });

    try {
      // Auto-generate FinanceTransaction for the payroll
      const bankAccount = await this.prisma.financeAccount.findFirst({
        where: { accountType: 'BANK', status: 'ACTIVE' },
      });

      let category = await this.prisma.financeCategory.findUnique({
        where: { categoryCode: 'SALARY' },
      });

      if (!category) {
        category = await this.prisma.financeCategory.create({
          data: { categoryCode: 'SALARY', categoryName: 'Lương nhân viên', type: 'EXPENSE' },
        });
      }

      if (bankAccount) {
        const count = await this.prisma.financeTransaction.count({ where: { type: 'EXPENSE' } });
        const ptCode = `PC${(count + 1).toString().padStart(5, '0')}`;

        await this.prisma.financeTransaction.create({
          data: {
            type: 'EXPENSE',
            amount: totalPayout,
            accountId: bankAccount.id,
            categoryId: category.id,
            note: `Thanh toán lương tháng ${period}`,
            status: 'DRAFT',
            receiverName: 'Tập thể Nhân viên',
            paymentMethod: 'BANK_TRANSFER',
            paymentDate: new Date(),
            transactionCode: ptCode,
          },
        });
        this.logger.log(`Created FinanceTransaction Draft for Payroll ${period}`);
      }
    } catch (e) {
      this.logger.error(`Failed to auto-generate FinanceTransaction for Payroll`, e);
    }

    return { message: 'Payroll approved successfully' };
  }

  // ═══════════════════════════════════════════
  // PERFORMANCE REVIEWS
  // ═══════════════════════════════════════════
  async findAllPerformance(opts: { employeeId?: string; period?: string }) {
    const where: Prisma.HrPerformanceReviewWhereInput = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.period) where.period = opts.period;

    return this.prisma.hrPerformanceReview.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        reviewer: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPerformance(data: any) {
    return this.prisma.hrPerformanceReview.create({
      data,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        reviewer: { select: { id: true, fullName: true } },
      },
    });
  }

  async updatePerformance(id: string, data: any) {
    return this.prisma.hrPerformanceReview.update({
      where: { id },
      data,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        reviewer: { select: { id: true, fullName: true } },
      },
    });
  }

  // ═══════════════════════════════════════════
  // RECRUITMENT — Job Postings & Candidates
  // ═══════════════════════════════════════════
  async findAllJobs(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.hrJobPosting.findMany({
      where,
      include: { _count: { select: { applicants: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJob(data: any) {
    return this.prisma.hrJobPosting.create({ data });
  }

  async findAllCandidates(opts?: { jobId?: string; stage?: string }) {
    const where: any = {};
    if (opts?.jobId) where.jobId = opts.jobId;
    if (opts?.stage) where.stage = opts.stage;
    return this.prisma.hrCandidate.findMany({
      where,
      include: { job: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCandidate(data: any) {
    return this.prisma.hrCandidate.create({ data });
  }

  // ═══════════════════════════════════════════
  // TRAINING — Courses & Trainees
  // ═══════════════════════════════════════════
  async findAllCourses(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.hrCourse.findMany({
      where,
      include: { _count: { select: { trainees: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCourse(data: any) {
    return this.prisma.hrCourse.create({ data });
  }

  async findAllTrainees(opts?: { courseId?: string; status?: string }) {
    const where: any = {};
    if (opts?.courseId) where.courseId = opts.courseId;
    if (opts?.status) where.status = opts.status;
    return this.prisma.hrTrainee.findMany({
      where,
      include: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTrainee(data: any) {
    return this.prisma.hrTrainee.create({ data });
  }

  // ═══════════════════════════════════════════
  // DASHBOARD EXTRAS — Events & Activities
  // ═══════════════════════════════════════════
  async getDashboardEvents() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const employees = await this.prisma.hrEmployee.findMany({
      where: { status: 'ACTIVE', dateOfBirth: { not: null } },
      select: { fullName: true, dateOfBirth: true, joinDate: true, position: { select: { name: true } } },
    });

    const events: any[] = [];
    for (const emp of employees) {
      if (emp.dateOfBirth) {
        const bd = new Date(emp.dateOfBirth);
        const bdThisMonth = new Date(today.getFullYear(), today.getMonth(), bd.getDate());
        if (bdThisMonth >= monthStart && bdThisMonth <= monthEnd) {
          const age = today.getFullYear() - bd.getFullYear();
          events.push({ name: emp.fullName, role: emp.position?.name || '', date: `${bd.getDate()}/${today.getMonth()+1}`, type: 'birthday', desc: `Sinh nhật (${age} tuổi)` });
        }
      }
      if (emp.joinDate) {
        const jd = new Date(emp.joinDate);
        const anniv = new Date(today.getFullYear(), jd.getMonth(), jd.getDate());
        if (anniv >= monthStart && anniv <= monthEnd && anniv.getFullYear() > jd.getFullYear()) {
          const years = today.getFullYear() - jd.getFullYear();
          events.push({ name: emp.fullName, role: emp.position?.name || '', date: `${jd.getDate()}/${today.getMonth()+1}`, type: 'anniversary', desc: `Kỷ niệm ${years} năm làm việc` });
        }
      }
    }
    return events.slice(0, 10);
  }

  async getDashboardActivities() {
    const [recentLeaves, recentContracts] = await Promise.all([
      this.prisma.hrLeaveRequest.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { employee: { select: { fullName: true } } } }),
      this.prisma.hrContract.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { employee: { select: { fullName: true } } } }),
    ]);

    const activities: any[] = [];
    for (const l of recentLeaves) {
      activities.push({ id: l.id, title: `Yêu cầu nghỉ phép`, detail: `${l.employee.fullName} — ${l.leaveType} (${l.status})`, time: new Date(l.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), tone: '#f59e0b' });
    }
    for (const c of recentContracts) {
      activities.push({ id: c.id, title: `Cập nhật hợp đồng`, detail: `${c.employee.fullName} — ${c.contractCode}`, time: new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), tone: '#3b82f6' });
    }
    return activities.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 5);
  }
}
