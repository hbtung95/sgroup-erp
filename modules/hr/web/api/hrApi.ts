import { createApiClient } from '@sgroup/api-client';
import { mockHRData, mockRespond } from './hrMocks';
import { Employee, Department, Team, Position } from '../types';

export const hrApiClient = createApiClient({ baseUrl: '/api/v1/hr' });

const fakeDelay = async (data: any = { success: true }) => {
  return new Promise(resolve => setTimeout(() => resolve(data), 400));
};

export const hrApi = {
  // Dashboard
  getDashboard: async () => mockRespond(mockHRData.getDashboard),

  // Departments
  getDepartments: async () => mockRespond(mockHRData.getDepartments),
  createDepartment: async (data: Omit<Department, 'id'>) => fakeDelay({ data }),
  updateDepartment: async (id: string, data: Partial<Department>) => fakeDelay({ data }),
  deleteDepartment: async (id: string) => fakeDelay(),

  // Positions
  getPositions: async () => mockRespond(mockHRData.getPositions),
  createPosition: async (data: Omit<Position, 'id'>) => fakeDelay({ data }),
  updatePosition: async (id: string, data: Partial<Position>) => fakeDelay({ data }),
  deletePosition: async (id: string) => fakeDelay(),

  // Teams
  getTeams: async (deptId?: string) => mockRespond(mockHRData.getTeams),
  createTeam: async (data: Omit<Team, 'id'>) => fakeDelay({ data }),
  updateTeam: async (id: string, data: Partial<Team>) => fakeDelay({ data }),
  deleteTeam: async (id: string) => fakeDelay(),

  // Employees
  getEmployees: async (params?: Record<string, unknown>) => mockRespond(mockHRData.getEmployees),
  getEmployee: async (id: string) => mockRespond({ data: mockHRData.getEmployee }),
  createEmployee: async (data: Omit<Employee, 'id'>) => fakeDelay({ data }),
  updateEmployee: async (id: string, data: Partial<Employee>) => fakeDelay({ data }),
  deleteEmployee: async (id: string) => fakeDelay(),

  // Contracts
  getContracts: async (params?: any) => mockRespond(mockHRData.getContracts),
  createContract: async (data: any) => fakeDelay({ data }),
  updateContract: async (id: string, data: any) => fakeDelay({ data }),

  // Attendance
  getAttendance: async (params?: any) => mockRespond(mockHRData.getAttendance),
  createAttendance: async (data: any) => fakeDelay({ data }),
  updateAttendance: async (id: string, data: any) => fakeDelay({ data }),

  // Leaves
  getLeaves: async (params?: any) => mockRespond(mockHRData.getLeaves),
  createLeave: async (data: any) => fakeDelay({ data }),
  updateLeave: async (id: string, data: any) => fakeDelay({ data }),
  approveLeave: async (id: string, approverId: string) => fakeDelay(),
  rejectLeave: async (id: string, approverId: string, note?: string) => fakeDelay(),

  // Payroll
  getPayrollRuns: async (params?: any) => mockRespond({ data: mockHRData.getPayroll.runs }),
  getPayslips: async (runId: number | string) => mockRespond({ data: mockHRData.getPayroll.payslips }),
  generatePayroll: async (data: any) => fakeDelay({ data }),
  approvePayroll: async (period: string, approvedBy: string) => fakeDelay(),

  // Performance
  getPerformance: async (params?: any) => mockRespond(mockHRData.getPerformance),
  createPerformance: async (data: any) => fakeDelay({ data }),
  updatePerformance: async (id: string, data: any) => fakeDelay({ data }),

  // Recruitment
  getJobs: async (status?: string) => mockRespond(mockHRData.getJobs),
  createJob: async (data: any) => fakeDelay({ data }),
  updateJob: async (id: string, data: any) => fakeDelay({ data }),
  deleteJob: async (id: string) => fakeDelay(),
  getCandidates: async (params?: any) => mockRespond(mockHRData.getCandidates),
  createCandidate: async (data: any) => fakeDelay({ data }),
  updateCandidate: async (id: string, data: any) => fakeDelay({ data }),
  deleteCandidate: async (id: string) => fakeDelay(),

  // Training
  getCourses: async (status?: string) => mockRespond(mockHRData.getCourses),
  createCourse: async (data: any) => fakeDelay({ data }),
  updateCourse: async (id: string, data: any) => fakeDelay({ data }),
  deleteCourse: async (id: string) => fakeDelay(),
  getTrainees: async (params?: any) => mockRespond(mockHRData.getTrainees),
  createTrainee: async (data: any) => fakeDelay({ data }),
  updateTrainee: async (id: string, data: any) => fakeDelay({ data }),
  deleteTrainee: async (id: string) => fakeDelay(),

  // Dashboard Extras
  getDashboardEvents: async () => mockRespond(mockHRData.getDashboardEvents),
  getDashboardActivities: async () => mockRespond(mockHRData.getDashboardActivities),

  // Transfer History
  getTransfers: async (employeeId?: string) => mockRespond(mockHRData.getTransfers),

  // Leave Balance
  getLeaveBalances: async (year?: number) => mockRespond(mockHRData.getLeaveBalances),
  getLeaveBalance: async (employeeId: string, year?: number) => mockRespond({ data: mockHRData.getLeaveBalance }),
  recalculateLeaveBalance: async (employeeId: string, year: number) => fakeDelay(),

  // Benefits
  getBenefits: async (params?: any) => mockRespond(mockHRData.getBenefits),
  createBenefit: async (data: any) => fakeDelay({ data }),
  updateBenefit: async (id: string, data: any) => fakeDelay({ data }),
  deleteBenefit: async (id: string) => fakeDelay(),

  // Policies
  getPolicies: async (category?: string) => mockRespond(mockHRData.getPolicies),
  createPolicy: async (data: any) => fakeDelay({ data }),
  updatePolicy: async (id: string, data: any) => fakeDelay({ data }),
  deletePolicy: async (id: string) => fakeDelay(),

  // Overtime
  getOvertime: async (params?: any) => mockRespond(mockHRData.getOvertime),
  createOvertime: async (data: any) => fakeDelay({ data }),
  updateOvertime: async (id: string, data: any) => fakeDelay({ data }),
  approveOvertime: async (id: string, approverId: string) => fakeDelay(),
  rejectOvertime: async (id: string, approverId: string, note?: string) => fakeDelay(),
};
