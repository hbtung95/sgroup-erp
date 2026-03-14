import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  DEAL_REPOSITORY,
  PROJECT_REPOSITORY,
  STAFF_REPOSITORY,
  TARGET_REPOSITORY,
  TEAM_REPOSITORY,
} from '../../common/database/repository-tokens';
import {
  IDealRepository,
  IProjectRepository,
  IStaffRepository,
  ITargetRepository,
  ITeamRepository,
} from '../../common/database/entity-repositories';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  CreateBookingDto,
  CreateDepositDto,
  ListBookingsDto,
  ListDepositsDto,
  UpdateBookingDto,
  UpdateDepositDto,
} from './dto/sales-ops.dto';

type SalesBookingRecord = Awaited<ReturnType<PrismaService['salesBooking']['findFirst']>>;
type SalesDepositRecord = Awaited<ReturnType<PrismaService['salesDeposit']['findFirst']>>;

@Injectable()
export class SalesOpsService {
  private readonly logger = new Logger(SalesOpsService.name);
  private readonly reviewerRoles = new Set(['sales_manager', 'sales_director', 'sales_admin', 'ceo']);

  constructor(
    @Inject(TEAM_REPOSITORY) private teamRepo: ITeamRepository,
    @Inject(STAFF_REPOSITORY) private staffRepo: IStaffRepository,
    @Inject(PROJECT_REPOSITORY) private projectRepo: IProjectRepository,
    @Inject(DEAL_REPOSITORY) private dealRepo: IDealRepository,
    @Inject(TARGET_REPOSITORY) private targetRepo: ITargetRepository,
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Teams

  async getTeams(filters?: { status?: string }) {
    return this.teamRepo.findAll(filters as any);
  }

  async getTeamById(id: string) {
    const team = await this.teamRepo.findById(id);
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async createTeam(data: {
    code: string;
    name: string;
    leaderId?: string;
    leaderName?: string;
    region?: string;
  }) {
    return this.teamRepo.create(data as any);
  }

  async updateTeam(id: string, data: Partial<{
    name: string;
    leaderId: string;
    leaderName: string;
    region: string;
    status: string;
    sortOrder: number;
  }>) {
    return this.teamRepo.update(id, data as any);
  }

  async deleteTeam(id: string) {
    return this.teamRepo.update(id, { status: 'DELETED' } as any);
  }

  // Staff

  async getStaff(filters?: { teamId?: string; status?: string; role?: string }) {
    return this.staffRepo.findAll(filters as any);
  }

  async getStaffById(id: string) {
    const staff = await this.staffRepo.findById(id);
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async createStaff(data: {
    fullName: string;
    employeeCode?: string;
    phone?: string;
    email?: string;
    teamId?: string;
    role?: string;
    leadsCapacity?: number;
    personalTarget?: number;
  }) {
    return this.staffRepo.create(data as any);
  }

  async updateStaff(id: string, data: Partial<{
    fullName: string;
    phone: string;
    email: string;
    teamId: string;
    role: string;
    status: string;
    leadsCapacity: number;
    personalTarget: number;
  }>) {
    return this.staffRepo.update(id, data as any);
  }

  // Projects

  async getProjects(filters?: { status?: string; type?: string }) {
    return this.projectRepo.findAll(filters as any);
  }

  async getProjectById(id: string) {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async createProject(data: {
    projectCode: string;
    name: string;
    developer?: string;
    location?: string;
    type?: string;
    feeRate?: number;
    avgPrice?: number;
    totalUnits?: number;
  }) {
    return this.projectRepo.create(data as any);
  }

  async updateProject(id: string, data: Partial<{
    name: string;
    developer: string;
    location: string;
    type: string;
    feeRate: number;
    avgPrice: number;
    totalUnits: number;
    soldUnits: number;
    status: string;
  }>) {
    return this.projectRepo.update(id, data as any);
  }

  // Deals

  async getDeals(filters?: {
    year?: number;
    month?: number;
    teamId?: string;
    staffId?: string;
    stage?: string;
    projectId?: string;
    status?: string;
  }) {
    return this.dealRepo.findAll(filters as any);
  }

  async getDealById(id: string) {
    const deal = await this.dealRepo.findById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async createDeal(data: {
    projectId?: string;
    projectName?: string;
    staffId?: string;
    staffName?: string;
    teamId?: string;
    teamName?: string;
    customerName?: string;
    customerPhone?: string;
    productCode?: string;
    productType?: string;
    dealValue: number;
    feeRate: number;
    source?: string;
    year: number;
    month: number;
    stage?: string;
    note?: string;
  }) {
    const commission = data.dealValue * (data.feeRate / 100);
    const dealCode = `GD-${data.year}${String(data.month).padStart(2, '0')}-${Date.now()
      .toString(36)
      .toUpperCase()}`;
    const deal = await this.dealRepo.create({ ...data, commission, dealCode } as any);
    this.eventEmitter.emit('deal.created', deal);
    return deal;
  }

  async updateDeal(id: string, data: Partial<{
    stage: string;
    dealValue: number;
    feeRate: number;
    customerName: string;
    customerPhone: string;
    productCode: string;
    dealDate: Date;
    bookingDate: Date;
    contractDate: Date;
    note: string;
    status: string;
  }>) {
    const updateData: any = { ...data };
    if (data.dealValue !== undefined && data.feeRate !== undefined) {
      updateData.commission = data.dealValue * (data.feeRate / 100);
    }
    const oldDeal = await this.dealRepo.findById(id);
    const newDeal = await this.dealRepo.update(id, updateData);
    if (oldDeal && oldDeal.stage !== data.stage) {
      this.eventEmitter.emit('deal.status_changed', { oldDeal, newDeal });
    }
    return newDeal;
  }

  async getDealStats(filters: { year: number; month?: number; teamId?: string }) {
    return this.dealRepo.getStats(filters);
  }

  // Bookings

  async getBookings(query: ListBookingsDto) {
    const records = await this.prisma.salesBooking.findMany({
      where: {
        deletedAt: null,
        year: query.year,
        month: query.month,
        status: query.status,
        projectId: query.projectId,
      },
      orderBy: [{ bookingDate: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map(record => this.mapBooking(record));
  }

  async createBooking(body: CreateBookingDto, user: JwtPayload) {
    const userId = this.getUserId(user);
    const now = new Date();
    const project = await this.resolveProject(body.project, body.projectId);
    const team = await this.resolveTeamInfo(user);

    const record = await this.prisma.salesBooking.create({
      data: {
        projectId: project.projectId,
        projectName: project.projectName,
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone.trim(),
        bookingAmount: body.bookingAmount,
        bookingCount: body.bookingCount ?? 1,
        staffId: user.salesStaffId ?? null,
        staffName: user.name ?? null,
        teamId: team.teamId,
        teamName: team.teamName,
        status: 'PENDING',
        bookingDate: now,
        note: body.note?.trim() || null,
        createdByUserId: userId ?? null,
        createdByName: user.name ?? null,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    });

    return this.mapBooking(record);
  }

  async updateBooking(id: string, body: UpdateBookingDto, user: JwtPayload) {
    const existing = await this.ensureBookingExists(id);
    this.assertCanManageBooking(existing, user);

    if (body.status && !this.isReviewer(user)) {
      throw new ForbiddenException('Only reviewers can change booking status directly');
    }

    const project = body.project || body.projectId
      ? await this.resolveProject(body.project, body.projectId)
      : null;

    const record = await this.prisma.salesBooking.update({
      where: { id },
      data: {
        ...(project ? { projectId: project.projectId, projectName: project.projectName } : {}),
        ...(body.customerName !== undefined ? { customerName: body.customerName.trim() } : {}),
        ...(body.customerPhone !== undefined ? { customerPhone: body.customerPhone.trim() } : {}),
        ...(body.bookingAmount !== undefined ? { bookingAmount: body.bookingAmount } : {}),
        ...(body.bookingCount !== undefined ? { bookingCount: body.bookingCount } : {}),
        ...(body.note !== undefined ? { note: body.note?.trim() || null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });

    return this.mapBooking(record);
  }

  async deleteBooking(id: string, user: JwtPayload) {
    const existing = await this.ensureBookingExists(id);
    this.assertCanManageBooking(existing, user);

    const record = await this.prisma.salesBooking.update({
      where: { id },
      data: {
        status: 'CANCELED',
        deletedAt: new Date(),
      },
    });

    return this.mapBooking(record);
  }

  async approveBooking(id: string, user: JwtPayload) {
    this.assertReviewer(user);
    const existing = await this.ensureBookingExists(id);

    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    const record = await this.prisma.salesBooking.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedByUserId: this.getUserId(user) ?? null,
        reviewedByName: user.name ?? null,
        reviewedAt: new Date(),
      },
    });

    return this.mapBooking(record);
  }

  async rejectBooking(id: string, user: JwtPayload) {
    this.assertReviewer(user);
    const existing = await this.ensureBookingExists(id);

    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    const record = await this.prisma.salesBooking.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedByUserId: this.getUserId(user) ?? null,
        reviewedByName: user.name ?? null,
        reviewedAt: new Date(),
      },
    });

    return this.mapBooking(record);
  }

  // Deposits

  async getDeposits(query: ListDepositsDto) {
    const records = await this.prisma.salesDeposit.findMany({
      where: {
        deletedAt: null,
        year: query.year,
        month: query.month,
        status: query.status,
        projectId: query.projectId,
      },
      orderBy: [{ depositDate: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map(record => this.mapDeposit(record));
  }

  async createDeposit(body: CreateDepositDto, user: JwtPayload) {
    const userId = this.getUserId(user);
    const now = new Date();
    const project = await this.resolveProject(body.project, body.projectId);
    const team = await this.resolveTeamInfo(user);

    const record = await this.prisma.salesDeposit.create({
      data: {
        projectId: project.projectId,
        projectName: project.projectName,
        unitCode: body.unitCode.trim(),
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone.trim(),
        depositAmount: body.depositAmount,
        staffId: user.salesStaffId ?? null,
        staffName: user.name ?? null,
        teamId: team.teamId,
        teamName: team.teamName,
        paymentMethod: body.paymentMethod?.trim() || null,
        receiptNo: body.receiptNo?.trim() || null,
        notes: body.notes?.trim() || null,
        status: 'PENDING',
        depositDate: now,
        createdByUserId: userId ?? null,
        createdByName: user.name ?? null,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    });

    return this.mapDeposit(record);
  }

  async updateDeposit(id: string, body: UpdateDepositDto, user: JwtPayload) {
    const existing = await this.ensureDepositExists(id);
    this.assertCanManageDeposit(existing, user);

    if (body.status && !this.isReviewer(user)) {
      throw new ForbiddenException('Only reviewers can change deposit status directly');
    }

    const project = body.project || body.projectId
      ? await this.resolveProject(body.project, body.projectId)
      : null;

    const record = await this.prisma.salesDeposit.update({
      where: { id },
      data: {
        ...(project ? { projectId: project.projectId, projectName: project.projectName } : {}),
        ...(body.unitCode !== undefined ? { unitCode: body.unitCode.trim() } : {}),
        ...(body.customerName !== undefined ? { customerName: body.customerName.trim() } : {}),
        ...(body.customerPhone !== undefined ? { customerPhone: body.customerPhone.trim() } : {}),
        ...(body.depositAmount !== undefined ? { depositAmount: body.depositAmount } : {}),
        ...(body.paymentMethod !== undefined ? { paymentMethod: body.paymentMethod?.trim() || null } : {}),
        ...(body.receiptNo !== undefined ? { receiptNo: body.receiptNo?.trim() || null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes?.trim() || null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });

    return this.mapDeposit(record);
  }

  async confirmDeposit(id: string, user: JwtPayload) {
    this.assertReviewer(user);
    const existing = await this.ensureDepositExists(id);

    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending deposits can be confirmed');
    }

    const record = await this.prisma.salesDeposit.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        reviewedByUserId: this.getUserId(user) ?? null,
        reviewedByName: user.name ?? null,
        reviewedAt: new Date(),
      },
    });

    return this.mapDeposit(record);
  }

  async cancelDeposit(id: string, user: JwtPayload) {
    this.assertReviewer(user);
    const existing = await this.ensureDepositExists(id);

    if (!['PENDING', 'CONFIRMED'].includes(existing.status)) {
      throw new BadRequestException('Only pending or confirmed deposits can be cancelled');
    }

    const record = await this.prisma.salesDeposit.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        reviewedByUserId: this.getUserId(user) ?? null,
        reviewedByName: user.name ?? null,
        reviewedAt: new Date(),
      },
    });

    return this.mapDeposit(record);
  }

  // Targets

  async getTargets(filters: {
    year: number;
    month?: number;
    teamId?: string;
    staffId?: string;
    scenarioKey?: string;
  }) {
    return this.targetRepo.findAll(filters as any);
  }

  async distributeTargets(data: {
    year: number;
    scenarioKey: string;
    targets: Array<{
      month: number;
      teamId?: string;
      staffId?: string;
      targetGMV: number;
      targetDeals: number;
      targetLeads: number;
      targetMeetings: number;
      targetBookings: number;
    }>;
  }) {
    const results = [];
    for (const t of data.targets) {
      const result = await this.targetRepo.upsertTarget(
        {
          year: data.year,
          month: t.month,
          teamId: t.teamId || '',
          staffId: t.staffId || '',
          scenarioKey: data.scenarioKey,
        },
        { ...t, year: data.year, scenarioKey: data.scenarioKey } as any,
      );
      results.push(result);
    }
    return results;
  }

  // Event listeners

  @OnEvent('transaction.approved')
  async handleFinanceTransactionApproved(transaction: any) {
    if (transaction.type === 'INCOME' && transaction.dealId) {
      this.logger.log(`Received income transaction approval for Deal ${transaction.dealId}`);
      try {
        const deal = (await this.dealRepo.findById(transaction.dealId)) as any;
        if (deal && deal.stage === 'DEPOSIT') {
          await this.updateDeal(deal.id, { stage: 'CONTRACT' });
          this.logger.log(`Deal ${deal.id} automatically moved from DEPOSIT to CONTRACT`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to process transaction.approved for Deal ${transaction.dealId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  @OnEvent('hr.employee_created')
  async handleHrEmployeeCreated(employee: any) {
    this.logger.log(`Received hr.employee_created event for Employee ${employee.employeeCode}`);

    const existing = await this.staffRepo.findByCode(employee.employeeCode);
    if (!existing) {
      try {
        await this.staffRepo.create({
          hrEmployeeId: employee.id,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          phone: employee.phone,
          email: employee.email,
          role: 'sales',
          status: 'ACTIVE',
          leadsCapacity: 30,
          personalTarget: 0,
        });
        this.logger.log(`Auto-created SalesStaff profile for HR Employee ${employee.employeeCode}`);
      } catch (err) {
        this.logger.error(
          `Failed to auto-create SalesStaff for HR Employee ${employee.employeeCode}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }
  }

  private getUserId(user: JwtPayload) {
    return (user as any).id ?? user.sub;
  }

  private isReviewer(user: JwtPayload) {
    return user.role === 'admin' || this.reviewerRoles.has(user.salesRole || '');
  }

  private assertReviewer(user: JwtPayload) {
    if (!this.isReviewer(user)) {
      throw new ForbiddenException('You do not have permission to review this item');
    }
  }

  private canManageOwnRecord(user: JwtPayload, createdByUserId?: string | null, staffId?: string | null) {
    const userId = this.getUserId(user);
    if (this.isReviewer(user)) return true;
    if (createdByUserId && userId && createdByUserId === userId) return true;
    if (staffId && user.salesStaffId && staffId === user.salesStaffId) return true;
    return false;
  }

  private assertCanManageBooking(record: SalesBookingRecord, user: JwtPayload) {
    if (!record) {
      throw new NotFoundException('Booking not found');
    }
    if (record.status !== 'PENDING' && !this.isReviewer(user)) {
      throw new ForbiddenException('Only pending bookings can be edited');
    }
    if (!this.canManageOwnRecord(user, record.createdByUserId, record.staffId)) {
      throw new ForbiddenException('You do not have permission to manage this booking');
    }
  }

  private assertCanManageDeposit(record: SalesDepositRecord, user: JwtPayload) {
    if (!record) {
      throw new NotFoundException('Deposit not found');
    }
    if (record.status !== 'PENDING' && !this.isReviewer(user)) {
      throw new ForbiddenException('Only pending deposits can be edited');
    }
    if (!this.canManageOwnRecord(user, record.createdByUserId, record.staffId)) {
      throw new ForbiddenException('You do not have permission to manage this deposit');
    }
  }

  private async ensureBookingExists(id: string) {
    const record = await this.prisma.salesBooking.findFirst({
      where: { id, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException('Booking not found');
    }

    return record;
  }

  private async ensureDepositExists(id: string) {
    const record = await this.prisma.salesDeposit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException('Deposit not found');
    }

    return record;
  }

  private async resolveProject(projectName?: string, projectId?: string) {
    if (projectId) {
      const project = await this.prisma.dimProject.findUnique({
        where: { id: projectId },
        select: { id: true, name: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return { projectId: project.id, projectName: project.name };
    }

    if (projectName) {
      const trimmedProjectName = projectName.trim();
      const project = await this.prisma.dimProject.findFirst({
        where: { name: trimmedProjectName },
        select: { id: true, name: true },
      });

      return {
        projectId: project?.id ?? null,
        projectName: project?.name ?? trimmedProjectName,
      };
    }

    throw new BadRequestException('Project is required');
  }

  private async resolveTeamInfo(user: JwtPayload) {
    const userTeamId = user.teamId;

    if (userTeamId) {
      const team = await this.prisma.salesTeam.findUnique({
        where: { id: userTeamId },
        select: { id: true, name: true },
      });

      if (team) {
        return { teamId: team.id, teamName: team.name };
      }
    }

    if (user.salesStaffId) {
      const staff = await this.prisma.salesStaff.findUnique({
        where: { id: user.salesStaffId },
        select: { teamId: true, team: { select: { name: true } } },
      });

      if (staff?.teamId) {
        return { teamId: staff.teamId, teamName: staff.team?.name ?? null };
      }
    }

    return { teamId: null, teamName: null };
  }

  private mapBooking(record: NonNullable<SalesBookingRecord>) {
    return {
      id: record.id,
      projectId: record.projectId,
      project: record.projectName,
      projectName: record.projectName,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      bookingAmount: record.bookingAmount,
      bookingCount: record.bookingCount,
      date: record.bookingDate.toISOString(),
      status: record.status,
      staffName: record.staffName,
      staffId: record.staffId,
      teamId: record.teamId,
      teamName: record.teamName,
      note: record.note,
      createdByUserId: record.createdByUserId,
      createdByName: record.createdByName,
      reviewedByName: record.reviewedByName,
      reviewedAt: record.reviewedAt?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private mapDeposit(record: NonNullable<SalesDepositRecord>) {
    return {
      id: record.id,
      projectId: record.projectId,
      project: record.projectName,
      projectName: record.projectName,
      unitCode: record.unitCode,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      depositAmount: record.depositAmount,
      date: record.depositDate.toISOString(),
      status: record.status,
      staffName: record.staffName,
      staffId: record.staffId,
      teamId: record.teamId,
      teamName: record.teamName,
      paymentMethod: record.paymentMethod,
      receiptNo: record.receiptNo,
      notes: record.notes,
      createdByUserId: record.createdByUserId,
      createdByName: record.createdByName,
      reviewedByName: record.reviewedByName,
      reviewedAt: record.reviewedAt?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
