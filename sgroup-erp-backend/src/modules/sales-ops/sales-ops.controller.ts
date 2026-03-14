import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateBookingDto,
  CreateDealDto,
  CreateDepositDto,
  CreateProjectDto,
  CreateStaffDto,
  CreateTeamDto,
  ListBookingsDto,
  ListDepositsDto,
  UpdateBookingDto,
  UpdateDepositDto,
  UpdateStaffDto,
  UpdateTeamDto,
} from './dto/sales-ops.dto';
import { SalesOpsService } from './sales-ops.service';

@Controller('sales-ops')
@UseGuards(RolesGuard)
export class SalesOpsController {
  constructor(private readonly service: SalesOpsService) {}

  // Teams
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

  // Staff
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

  // Projects
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

  // Deals
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
      teamId,
      staffId,
      stage,
      projectId,
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

  // Bookings
  @Get('bookings')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getBookings(@Query() query: ListBookingsDto) {
    return this.service.getBookings(query);
  }

  @Post('bookings')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async createBooking(@Body() body: CreateBookingDto, @CurrentUser() user: JwtPayload) {
    return this.service.createBooking(body, user);
  }

  @Patch('bookings/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async updateBooking(
    @Param('id') id: string,
    @Body() body: UpdateBookingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateBooking(id, body, user);
  }

  @Delete('bookings/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async deleteBooking(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.deleteBooking(id, user);
  }

  @Post('bookings/:id/approve')
  @Roles('admin', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async approveBooking(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.approveBooking(id, user);
  }

  @Post('bookings/:id/reject')
  @Roles('admin', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async rejectBooking(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.rejectBooking(id, user);
  }

  // Deposits
  @Get('deposits')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getDeposits(@Query() query: ListDepositsDto) {
    return this.service.getDeposits(query);
  }

  @Post('deposits')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async createDeposit(@Body() body: CreateDepositDto, @CurrentUser() user: JwtPayload) {
    return this.service.createDeposit(body, user);
  }

  @Patch('deposits/:id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async updateDeposit(
    @Param('id') id: string,
    @Body() body: UpdateDepositDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateDeposit(id, body, user);
  }

  @Post('deposits/:id/confirm')
  @Roles('admin', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async confirmDeposit(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.confirmDeposit(id, user);
  }

  @Post('deposits/:id/cancel')
  @Roles('admin', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async cancelDeposit(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.cancelDeposit(id, user);
  }

  // Targets
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
      teamId,
      staffId,
      scenarioKey,
    });
  }

  @Post('targets/distribute')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'ceo', 'sales_admin')
  async distributeTargets(@Body() body: {
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
    return this.service.distributeTargets(body);
  }
}
