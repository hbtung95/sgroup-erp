import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { HrService } from './hr.service';

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ═══════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════
  @Get('dashboard')
  getDashboard() {
    return this.hrService.getDashboardStats();
  }

  // ═══════════════════════════════════════════
  // DEPARTMENTS
  // ═══════════════════════════════════════════
  @Get('departments')
  getDepartments() {
    return this.hrService.findAllDepartments();
  }

  @Post('departments')
  createDepartment(@Body() data: any) {
    return this.hrService.createDepartment(data);
  }

  @Patch('departments/:id')
  updateDepartment(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateDepartment(id, data);
  }

  @Delete('departments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDepartment(@Param('id') id: string) {
    return this.hrService.deleteDepartment(id);
  }

  // ═══════════════════════════════════════════
  // POSITIONS
  // ═══════════════════════════════════════════
  @Get('positions')
  getPositions() {
    return this.hrService.findAllPositions();
  }

  @Post('positions')
  createPosition(@Body() data: any) {
    return this.hrService.createPosition(data);
  }

  @Patch('positions/:id')
  updatePosition(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updatePosition(id, data);
  }

  // ═══════════════════════════════════════════
  // TEAMS
  // ═══════════════════════════════════════════
  @Get('teams')
  getTeams(@Query('departmentId') departmentId?: string) {
    return this.hrService.findAllTeams(departmentId);
  }

  @Post('teams')
  createTeam(@Body() data: any) {
    return this.hrService.createTeam(data);
  }

  @Patch('teams/:id')
  updateTeam(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateTeam(id, data);
  }

  @Delete('teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTeam(@Param('id') id: string) {
    return this.hrService.deleteTeam(id);
  }

  // ═══════════════════════════════════════════
  // EMPLOYEES
  // ═══════════════════════════════════════════
  @Get('employees')
  getEmployees(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hrService.findAllEmployees({
      search,
      departmentId,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('employees/:id')
  getEmployee(@Param('id') id: string) {
    return this.hrService.findEmployee(id);
  }

  @Post('employees')
  createEmployeeEndpoint(@Body() data: any) {
    return this.hrService.createEmployee(data);
  }

  @Patch('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateEmployee(id, data);
  }

  @Delete('employees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEmployee(@Param('id') id: string) {
    return this.hrService.deleteEmployee(id);
  }

  // ═══════════════════════════════════════════
  // CONTRACTS
  // ═══════════════════════════════════════════
  @Get('contracts')
  getContracts(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.hrService.findAllContracts({ employeeId, status });
  }

  @Post('contracts')
  createContract(@Body() data: any) {
    return this.hrService.createContract(data);
  }

  @Patch('contracts/:id')
  updateContract(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateContract(id, data);
  }

  // ═══════════════════════════════════════════
  // ATTENDANCE
  // ═══════════════════════════════════════════
  @Get('attendance')
  getAttendance(
    @Query('employeeId') employeeId?: string,
    @Query('date') date?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.hrService.findAllAttendance({ employeeId, date, month, year });
  }

  @Post('attendance')
  createAttendance(@Body() data: any) {
    return this.hrService.createAttendance(data);
  }

  @Patch('attendance/:id')
  updateAttendance(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateAttendance(id, data);
  }

  // ═══════════════════════════════════════════
  // LEAVES
  // ═══════════════════════════════════════════
  @Get('leaves')
  getLeaves(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.hrService.findAllLeaves({ employeeId, status });
  }

  @Post('leaves')
  createLeave(@Body() data: any) {
    return this.hrService.createLeave(data);
  }

  @Patch('leaves/:id')
  updateLeave(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateLeave(id, data);
  }

  @Post('leaves/:id/approve')
  approveLeave(@Param('id') id: string, @Body() data: any) {
    return this.hrService.approveLeave(id, data.approverId);
  }

  @Post('leaves/:id/reject')
  rejectLeave(@Param('id') id: string, @Body() data: any) {
    return this.hrService.rejectLeave(id, data.approverId, data.note);
  }

  // ═══════════════════════════════════════════
  // PAYROLL
  // ═══════════════════════════════════════════
  @Get('payroll')
  getPayroll(
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('status') status?: string,
  ) {
    return this.hrService.findAllPayroll({ period, year, month, status });
  }

  @Post('payroll/generate')
  generatePayroll(@Body() data: { year: number; month: number }) {
    return this.hrService.generateMonthlyPayroll(data.year, data.month);
  }

  @Post('payroll/approve')
  approvePayrollEndpoint(@Body() data: { period: string; approvedBy: string }) {
    return this.hrService.approvePayroll(data.period, data.approvedBy);
  }

  // ═══════════════════════════════════════════
  // PERFORMANCE REVIEWS
  // ═══════════════════════════════════════════
  @Get('performance')
  getPerformance(
    @Query('employeeId') employeeId?: string,
    @Query('period') period?: string,
  ) {
    return this.hrService.findAllPerformance({ employeeId, period });
  }

  @Post('performance')
  createPerformance(@Body() data: any) {
    return this.hrService.createPerformance(data);
  }

  @Patch('performance/:id')
  updatePerformance(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updatePerformance(id, data);
  }

  // ═══════════════════════════════════════════
  // RECRUITMENT
  // ═══════════════════════════════════════════
  @Get('jobs')
  getJobs(@Query('status') status?: string) {
    return this.hrService.findAllJobs(status);
  }

  @Post('jobs')
  createJob(@Body() data: any) {
    return this.hrService.createJob(data);
  }

  @Patch('jobs/:id')
  updateJob(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateJob(id, data);
  }

  @Delete('jobs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteJob(@Param('id') id: string) {
    return this.hrService.deleteJob(id);
  }

  @Get('candidates')
  getCandidates(@Query('jobId') jobId?: string, @Query('stage') stage?: string) {
    return this.hrService.findAllCandidates({ jobId, stage });
  }

  @Post('candidates')
  createCandidate(@Body() data: any) {
    return this.hrService.createCandidate(data);
  }

  @Patch('candidates/:id')
  updateCandidate(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateCandidate(id, data);
  }

  @Delete('candidates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCandidate(@Param('id') id: string) {
    return this.hrService.deleteCandidate(id);
  }

  // ═══════════════════════════════════════════
  // TRAINING
  // ═══════════════════════════════════════════
  @Get('courses')
  getCourses(@Query('status') status?: string) {
    return this.hrService.findAllCourses(status);
  }

  @Post('courses')
  createCourse(@Body() data: any) {
    return this.hrService.createCourse(data);
  }

  @Patch('courses/:id')
  updateCourse(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateCourse(id, data);
  }

  @Delete('courses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCourse(@Param('id') id: string) {
    return this.hrService.deleteCourse(id);
  }

  @Get('trainees')
  getTrainees(@Query('courseId') courseId?: string, @Query('status') status?: string) {
    return this.hrService.findAllTrainees({ courseId, status });
  }

  @Post('trainees')
  createTrainee(@Body() data: any) {
    return this.hrService.createTrainee(data);
  }

  @Patch('trainees/:id')
  updateTrainee(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateTrainee(id, data);
  }

  @Delete('trainees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTrainee(@Param('id') id: string) {
    return this.hrService.deleteTrainee(id);
  }

  // ═══════════════════════════════════════════
  // DASHBOARD EXTRAS
  // ═══════════════════════════════════════════
  @Get('dashboard/events')
  getDashboardEvents() {
    return this.hrService.getDashboardEvents();
  }

  @Get('dashboard/activities')
  getDashboardActivities() {
    return this.hrService.getDashboardActivities();
  }

  // ═══════════════════════════════════════════
  // TRANSFER HISTORY
  // ═══════════════════════════════════════════
  @Get('transfers')
  getTransfers(@Query('employeeId') employeeId?: string) {
    return this.hrService.getTransferHistory(employeeId);
  }

  // ═══════════════════════════════════════════
  // LEAVE BALANCE
  // ═══════════════════════════════════════════
  @Get('leave-balance')
  getAllLeaveBalances(@Query('year') year?: string) {
    return this.hrService.getAllLeaveBalances(year ? parseInt(year) : undefined);
  }

  @Get('leave-balance/:employeeId')
  getLeaveBalance(@Param('employeeId') employeeId: string, @Query('year') year?: string) {
    return this.hrService.getLeaveBalance(employeeId, year ? parseInt(year) : undefined);
  }

  @Post('leave-balance/recalculate')
  recalculateLeaveBalance(@Body() data: { employeeId: string; year: number }) {
    return this.hrService.recalculateLeaveBalance(data.employeeId, data.year);
  }

  // ═══════════════════════════════════════════
  // BENEFITS
  // ═══════════════════════════════════════════
  @Get('benefits')
  getBenefits(
    @Query('employeeId') employeeId?: string,
    @Query('benefitType') benefitType?: string,
    @Query('status') status?: string,
  ) {
    return this.hrService.findAllBenefits({ employeeId, benefitType, status });
  }

  @Post('benefits')
  createBenefit(@Body() data: any) {
    return this.hrService.createBenefit(data);
  }

  @Patch('benefits/:id')
  updateBenefit(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateBenefit(id, data);
  }

  @Delete('benefits/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBenefit(@Param('id') id: string) {
    return this.hrService.deleteBenefit(id);
  }

  // ═══════════════════════════════════════════
  // POLICIES
  // ═══════════════════════════════════════════
  @Get('policies')
  getPolicies(@Query('category') category?: string) {
    return this.hrService.findAllPolicies({ category, isActive: true });
  }

  @Post('policies')
  createPolicy(@Body() data: any) {
    return this.hrService.createPolicy(data);
  }

  @Patch('policies/:id')
  updatePolicy(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updatePolicy(id, data);
  }

  @Delete('policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePolicy(@Param('id') id: string) {
    return this.hrService.deletePolicy(id);
  }

  // ═══════════════════════════════════════════
  // OVERTIME
  // ═══════════════════════════════════════════
  @Get('overtime')
  getOvertime(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.hrService.findAllOvertime({ employeeId, status, month, year });
  }

  @Post('overtime')
  createOvertime(@Body() data: any) {
    return this.hrService.createOvertime(data);
  }

  @Patch('overtime/:id')
  updateOvertime(@Param('id') id: string, @Body() data: any) {
    return this.hrService.updateOvertime(id, data);
  }

  @Post('overtime/:id/approve')
  approveOvertime(@Param('id') id: string, @Body() data: any) {
    return this.hrService.approveOvertime(id, data.approverId);
  }

  @Post('overtime/:id/reject')
  rejectOvertime(@Param('id') id: string, @Body() data: any) {
    return this.hrService.rejectOvertime(id, data.approverId, data.note);
  }
}
