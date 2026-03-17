import { Injectable, Inject } from '@nestjs/common';
import {
  DEAL_REPOSITORY, TEAM_REPOSITORY, STAFF_REPOSITORY,
  TARGET_REPOSITORY, COMMISSION_REPOSITORY, PROJECT_REPOSITORY,
} from '../../common/database/repository-tokens';
import {
  IDealRepository, ITeamRepository, IStaffRepository,
  ITargetRepository, ICommissionRepository, IProjectRepository,
} from '../../common/database/entity-repositories';

@Injectable()
export class SalesReportService {
  constructor(
    @Inject(DEAL_REPOSITORY) private dealRepo: IDealRepository,
    @Inject(TEAM_REPOSITORY) private teamRepo: ITeamRepository,
    @Inject(STAFF_REPOSITORY) private staffRepo: IStaffRepository,
    @Inject(TARGET_REPOSITORY) private targetRepo: ITargetRepository,
    @Inject(COMMISSION_REPOSITORY) private commissionRepo: ICommissionRepository,
    @Inject(PROJECT_REPOSITORY) private projectRepo: IProjectRepository,
  ) {}

  // ── KPI CARDS (scope-aware) ──
  async getKpiCards(filters: {
    year: number; month?: number; teamId?: string; staffId?: string;
  }) {
    const dealFilters: any = { year: filters.year, status: 'ACTIVE' };
    if (filters.month) dealFilters.month = filters.month;
    if (filters.teamId) dealFilters.teamId = filters.teamId;
    if (filters.staffId) dealFilters.staffId = filters.staffId;

    const deals = await this.dealRepo.findAll(dealFilters);
    const completed = deals.filter(d => d.stage === 'COMPLETED');

    const totalDeals = completed.length;
    const totalGMV = completed.reduce((s, d) => s + Number(d.dealValue), 0);
    const totalRevenue = completed.reduce((s, d) => s + Number(d.commission), 0);
    const avgDealSize = totalDeals > 0 ? totalGMV / totalDeals : 0;

    const staffFilters: any = { status: 'ACTIVE' };
    if (filters.teamId) staffFilters.teamId = filters.teamId;
    const staffCount = await this.staffRepo.count(staffFilters);

    return {
      totalDeals, totalGMV, totalRevenue, avgDealSize, staffCount,
      revenuePerStaff: staffCount > 0 ? totalRevenue / staffCount : 0,
    };
  }

  // ── PLAN VS ACTUAL ──
  async getPlanVsActual(filters: { year: number; scenarioKey?: string; teamId?: string }) {
    const scenarioKey = filters.scenarioKey || 'base';

    const targetFilters: any = { year: filters.year, scenarioKey };
    if (filters.teamId) targetFilters.teamId = filters.teamId;
    const targets = await this.targetRepo.findAll(targetFilters);

    const dealFilters: any = { year: filters.year, status: 'ACTIVE' };
    if (filters.teamId) dealFilters.teamId = filters.teamId;
    const deals = (await this.dealRepo.findAll(dealFilters)).filter(d => d.stage === 'COMPLETED');

    const monthlyActual: Record<number, { gmv: number; deals: number; revenue: number }> = {};
    deals.forEach(d => {
      if (!monthlyActual[d.month]) monthlyActual[d.month] = { gmv: 0, deals: 0, revenue: 0 };
      monthlyActual[d.month].gmv += Number(d.dealValue);
      monthlyActual[d.month].deals += 1;
      monthlyActual[d.month].revenue += Number(d.commission);
    });

    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const target = targets.find(t => t.month === month);
      const actual = monthlyActual[month] || { gmv: 0, deals: 0, revenue: 0 };
      return {
        month,
        target: {
          gmv: target?.targetGMV || 0,
          deals: target?.targetDeals || 0,
          leads: target?.targetLeads || 0,
        },
        actual,
        achievementRate: target?.targetGMV
          ? Math.round((actual.gmv / Number(target.targetGMV)) * 100)
          : 0,
      };
    });

    return { year: filters.year, scenarioKey, months };
  }

  // ── TEAM PERFORMANCE ──
  async getTeamPerformance(filters: { year: number; month?: number }) {
    const teams = await this.teamRepo.findAll({ status: 'ACTIVE' });

    const dealFilters: any = { year: filters.year, status: 'ACTIVE' };
    if (filters.month) dealFilters.month = filters.month;
    const deals = await this.dealRepo.findAll(dealFilters);
    const staff = await this.staffRepo.findAll({ status: 'ACTIVE' });

    return teams.map(team => {
      const teamDeals = deals.filter(d => d.teamId === team.id);
      const completed = teamDeals.filter(d => d.stage === 'COMPLETED');
      const teamStaff = staff.filter(s => s.teamId === team.id);
      return {
        team: { id: team.id, code: team.code, name: team.name, leaderName: team.leaderName },
        staffCount: teamStaff.length,
        totalDeals: completed.length,
        totalGMV: completed.reduce((s, d) => s + Number(d.dealValue), 0),
        totalRevenue: completed.reduce((s, d) => s + Number(d.commission), 0),
        pipelineDeals: teamDeals.filter(d => d.stage !== 'COMPLETED' && d.stage !== 'CANCELLED').length,
        pipelineValue: teamDeals
          .filter(d => d.stage !== 'COMPLETED' && d.stage !== 'CANCELLED')
          .reduce((s, d) => s + Number(d.dealValue), 0),
      };
    });
  }

  // ── STAFF PERFORMANCE ──
  async getStaffPerformance(filters: { year: number; month?: number; teamId?: string }) {
    const staffFilters: any = { status: 'ACTIVE' };
    if (filters.teamId) staffFilters.teamId = filters.teamId;
    const staff = await this.staffRepo.findAll(staffFilters);

    const dealFilters: any = { year: filters.year, status: 'ACTIVE' };
    if (filters.month) dealFilters.month = filters.month;
    if (filters.teamId) dealFilters.teamId = filters.teamId;
    const deals = await this.dealRepo.findAll(dealFilters);

    return staff.map(s => {
      const staffDeals = deals.filter(d => d.staffId === s.id);
      const completed = staffDeals.filter(d => d.stage === 'COMPLETED');
      return {
        staff: { id: s.id, code: s.employeeCode, name: s.fullName, team: s.teamId, role: s.role },
        totalDeals: completed.length,
        totalGMV: completed.reduce((sum, d) => sum + Number(d.dealValue), 0),
        totalRevenue: completed.reduce((sum, d) => sum + Number(d.commission), 0),
        pipeline: staffDeals.filter(d => d.stage !== 'COMPLETED' && d.stage !== 'CANCELLED').length,
        target: Number(s.personalTarget) || 0,
      };
    }).sort((a, b) => b.totalGMV - a.totalGMV);
  }

  // ── FUNNEL (ACTUAL) ──
  async getActualFunnel(filters: { year: number; month?: number; teamId?: string }) {
    const dealFilters: any = { year: filters.year, status: 'ACTIVE' };
    if (filters.month) dealFilters.month = filters.month;
    if (filters.teamId) dealFilters.teamId = filters.teamId;

    const deals = await this.dealRepo.findAll(dealFilters);
    const stages = ['LEAD', 'MEETING', 'BOOKING', 'DEPOSIT', 'CONTRACT', 'COMPLETED'];
    const stageLabels: Record<string, string> = {
      LEAD: 'Khách hàng QT', MEETING: 'Đã hẹn gặp', BOOKING: 'Giữ chỗ',
      DEPOSIT: 'Đặt cọc', CONTRACT: 'Ký HĐMB', COMPLETED: 'Hoàn tất GD',
    };

    return stages.map(stage => {
      const idx = stages.indexOf(stage);
      const count = deals.filter(d => stages.indexOf(d.stage) >= idx).length;
      const value = deals
        .filter(d => stages.indexOf(d.stage) >= idx)
        .reduce((s, d) => s + Number(d.dealValue), 0);
      return { stage, label: stageLabels[stage] || stage, count, value };
    });
  }

  // ── COMMISSION REPORT ──
  async getCommissionReport(filters: {
    year: number; month?: number; teamId?: string; staffId?: string; status?: string;
  }) {
    return this.commissionRepo.findAll(filters as any);
  }

  // ── PROJECT PERFORMANCE ──
  async getProjectPerformance(filters: { year: number }) {
    const projects = await this.projectRepo.findAll({ status: 'ACTIVE' });
    const deals = await this.dealRepo.findAll({ year: filters.year, status: 'ACTIVE', stage: 'COMPLETED' });

    return projects.map(p => {
      const projDeals = deals.filter(d => d.projectId === p.id);
      return {
        project: { id: p.id, code: p.projectCode, name: p.name, developer: p.developer },
        feeRate: p.feeRate,
        totalUnits: p.totalUnits,
        soldUnits: p.soldUnits + projDeals.length,
        dealsThisYear: projDeals.length,
        gmv: projDeals.reduce((s, d) => s + Number(d.dealValue), 0),
        revenue: projDeals.reduce((s, d) => s + Number(d.commission), 0),
      };
    });
  }
}
