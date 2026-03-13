import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards,
} from '@nestjs/common';
import { SalesOpsService } from './sales-ops.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateTeamDto, UpdateTeamDto, CreateStaffDto, UpdateStaffDto, CreateDealDto, CreateProjectDto } from './dto/sales-ops.dto';

@Controller('sales-ops')
@UseGuards(RolesGuard)
export class SalesOpsController {
  constructor(private readonly service: SalesOpsService) {}

  // ── TEAMS ──

  @Get('teams')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getTeams(@Query('status') status?: string) {
    return this.service.getTeams({ status });
  }

  @Get('teams/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getTeamById(@Param('id') id: string) {
    return this.service.getTeamById(id);
  }

  @Post('teams')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'sales_admin')
  async createTeam(@Body() body: CreateTeamDto) {
    return this.service.createTeam(body);
  }

  @Patch('teams/:id')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'sales_admin')
  async updateTeam(@Param('id') id: string, @Body() body: UpdateTeamDto) {
    return this.service.updateTeam(id, body);
  }

  @Delete('teams/:id')
  @Roles('admin', 'sales_admin')
  async deleteTeam(@Param('id') id: string) {
    return this.service.deleteTeam(id);
  }

  // ── STAFF ──

  @Get('staff')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getStaff(
    @Query('teamId') teamId?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    return this.service.getStaff({ teamId, status, role });
  }

  @Get('staff/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getStaffById(@Param('id') id: string) {
    return this.service.getStaffById(id);
  }

  @Post('staff')
  @Roles('admin', 'employee', 'team_lead', 'sales_manager', 'sales_director', 'sales_admin')
  async createStaff(@Body() body: CreateStaffDto) {
    return this.service.createStaff(body);
  }

  @Patch('staff/:id')
  @Roles('admin', 'employee', 'team_lead', 'sales_manager', 'sales_director', 'sales_admin')
  async updateStaff(@Param('id') id: string, @Body() body: UpdateStaffDto) {
    return this.service.updateStaff(id, body);
  }

  // ── PROJECTS ──

  @Get('projects')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getProjects(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.service.getProjects({ status, type });
  }

  @Get('projects/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getProjectById(@Param('id') id: string) {
    return this.service.getProjectById(id);
  }

  @Post('projects')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'sales_admin')
  async createProject(@Body() body: CreateProjectDto) {
    return this.service.createProject(body);
  }

  @Patch('projects/:id')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'sales_admin')
  async updateProject(@Param('id') id: string, @Body() body: CreateProjectDto) {
    return this.service.updateProject(id, body);
  }

  // ── DEALS ──

  @Get('deals')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getDeals(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
    @Query('staffId') staffId?: string,
    @Query('stage') stage?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.getDeals({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      teamId, staffId, stage, projectId,
    });
  }

  @Get('deals/stats')
  @Roles('admin', 'employee', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getDealStats(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.service.getDealStats({
      year: Number(year),
      month: month ? Number(month) : undefined,
      teamId,
    });
  }

  @Get('deals/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getDealById(@Param('id') id: string) {
    return this.service.getDealById(id);
  }

  @Post('deals')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_admin')
  async createDeal(@Body() body: CreateDealDto) {
    return this.service.createDeal(body);
  }


  @Patch('deals/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'sales_admin')
  async updateDeal(@Param('id') id: string, @Body() body: CreateDealDto) {
    return this.service.updateDeal(id, body);
  }

  // ── TARGETS ──

  @Get('targets')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getTargets(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
    @Query('staffId') staffId?: string,
    @Query('scenarioKey') scenarioKey?: string,
  ) {
    return this.service.getTargets({
      year: Number(year),
      month: month ? Number(month) : undefined,
      teamId, staffId, scenarioKey,
    });
  }

  @Post('targets/distribute')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'ceo', 'sales_admin')
  async distributeTargets(@Body() body: {
    year: number; scenarioKey: string;
    targets: Array<{
      month: number; teamId?: string; staffId?: string;
      targetGMV: number; targetDeals: number;
      targetLeads: number; targetMeetings: number;
      targetBookings: number;
    }>;
  }) {
    return this.service.distributeTargets(body);
  }
}
