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

  @Get('candidates')
  getCandidates(@Query('jobId') jobId?: string, @Query('stage') stage?: string) {
    return this.hrService.findAllCandidates({ jobId, stage });
  }

  @Post('candidates')
  createCandidate(@Body() data: any) {
    return this.hrService.createCandidate(data);
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

  @Get('trainees')
  getTrainees(@Query('courseId') courseId?: string, @Query('status') status?: string) {
    return this.hrService.findAllTrainees({ courseId, status });
  }

  @Post('trainees')
  createTrainee(@Body() data: any) {
    return this.hrService.createTrainee(data);
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
}
