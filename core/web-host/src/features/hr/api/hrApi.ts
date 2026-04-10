import { apiClient } from '../../../core/api/apiClient';
import { mockHRData, mockRespond } from './hrMocks';
import { Employee, Department, Team, Position } from '../types';

export const hrApi = {
  // Dashboard
  getDashboard: async () => mockRespond(mockHRData.getDashboard),

  // Departments
  getDepartments: async () => mockRespond(mockHRData.getDepartments),
  createDepartment: async (data: Omit<Department, 'id'>) => {
    const res = await apiClient.post('/hr/departments', data);
    return res.data;
  },
  updateDepartment: async (id: string, data: Partial<Department>) => {
    const res = await apiClient.patch(`/hr/departments/${id}`, data);
    return res.data;
  },
  deleteDepartment: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Positions
  getPositions: async () => mockRespond(mockHRData.getPositions),
  createPosition: async (data: Omit<Position, 'id'>) => {
    const res = await apiClient.post('/hr/positions', data);
    return res.data;
  },
  updatePosition: async (id: string, data: Partial<Position>) => {
    const res = await apiClient.patch(`/hr/positions/${id}`, data);
    return res.data;
  },

  // Teams
  getTeams: async (deptId?: string) => mockRespond(mockHRData.getTeams),
  createTeam: async (data: Omit<Team, 'id'>) => {
    const res = await apiClient.post('/hr/teams', data);
    return res.data;
  },
  updateTeam: async (id: string, data: Partial<Team>) => {
    const res = await apiClient.patch(`/hr/teams/${id}`, data);
    return res.data;
  },
  deleteTeam: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Employees
  getEmployees: async (params?: Record<string, unknown>) => mockRespond(mockHRData.getEmployees),
  getEmployee: async (id: string) => mockRespond(mockHRData.getEmployee),
  createEmployee: async (data: Omit<Employee, 'id'>) => {
    // Mock: simulate creating employee and add to local mock data
    const newId = String(Date.now());
    const newEmployee = {
      id: newId,
      employeeCode: `SGR-${String(mockHRData.getEmployees.data.length + 1).padStart(3, '0')}`,
      ...data,
      status: 'active',
      workStatus: 'Đang làm việc',
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockHRData.getEmployees.data.push(newEmployee as any);
    mockHRData.getEmployees.meta.total = mockHRData.getEmployees.data.length;
    return mockRespond(newEmployee as Employee);
  },
  updateEmployee: async (id: string, data: Partial<Employee>) => {
    const idx = mockHRData.getEmployees.data.findIndex((e: any) => e.id === id);
    if (idx >= 0) {
      mockHRData.getEmployees.data[idx] = { ...mockHRData.getEmployees.data[idx], ...data };
    }
    return mockRespond({ success: true });
  },
  deleteEmployee: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Contracts
  getContracts: async (params?: any) => mockRespond(mockHRData.getContracts),
  createContract: async (data: any) => {
    const res = await apiClient.post('/hr/contracts', data);
    return res.data;
  },
  updateContract: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/contracts/${id}`, data);
    return res.data;
  },

  // Attendance
  getAttendance: async (params?: any) => mockRespond(mockHRData.getAttendance),
  createAttendance: async (data: any) => {
    const res = await apiClient.post('/hr/attendance', data);
    return res.data;
  },
  updateAttendance: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/attendance/${id}`, data);
    return res.data;
  },

  // Leaves
  getLeaves: async (params?: any) => mockRespond(mockHRData.getLeaves),
  createLeave: async (data: any) => {
    const res = await apiClient.post('/hr/leaves', data);
    return res.data;
  },
  updateLeave: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/leaves/${id}`, data);
    return res.data;
  },
  approveLeave: async (id: string, approverId: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },
  rejectLeave: async (id: string, approverId: string, note?: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Payroll
  getPayroll: async (params?: any) => mockRespond(mockHRData.getPayroll),
  generatePayroll: async (year: number, month: number) => {
    const res = await apiClient.post('/hr/payroll/generate', { year, month });
    return res.data;
  },
  approvePayroll: async (period: string, approvedBy: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Performance
  getPerformance: async (params?: any) => mockRespond(mockHRData.getPerformance),
  createPerformance: async (data: any) => {
    const res = await apiClient.post('/hr/performance', data);
    return res.data;
  },
  updatePerformance: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/performance/${id}`, data);
    return res.data;
  },

  // Recruitment
  getJobs: async (status?: string) => mockRespond(mockHRData.getJobs),
  createJob: async (data: any) => {
    const res = await apiClient.post('/hr/jobs', data);
    return res.data;
  },
  updateJob: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/jobs/${id}`, data);
    return res.data;
  },
  deleteJob: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },
  getCandidates: async (params?: any) => mockRespond(mockHRData.getCandidates),
  createCandidate: async (data: any) => {
    const res = await apiClient.post('/hr/candidates', data);
    return res.data;
  },
  updateCandidate: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/candidates/${id}`, data);
    return res.data;
  },
  deleteCandidate: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Training
  getCourses: async (status?: string) => mockRespond(mockHRData.getCourses),
  createCourse: async (data: any) => {
    const res = await apiClient.post('/hr/courses', data);
    return res.data;
  },
  updateCourse: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/courses/${id}`, data);
    return res.data;
  },
  deleteCourse: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },
  getTrainees: async (params?: any) => mockRespond(mockHRData.getTrainees),
  createTrainee: async (data: any) => {
    const res = await apiClient.post('/hr/trainees', data);
    return res.data;
  },
  updateTrainee: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/trainees/${id}`, data);
    return res.data;
  },
  deleteTrainee: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Dashboard Extras
  getDashboardEvents: async () => mockRespond(mockHRData.getDashboardEvents),
  getDashboardActivities: async () => mockRespond(mockHRData.getDashboardActivities),

  // Transfer History
  getTransfers: async (employeeId?: string) => mockRespond(mockHRData.getTransfers),

  // Leave Balance
  getLeaveBalances: async (year?: number) => mockRespond(mockHRData.getLeaveBalances),
  getLeaveBalance: async (employeeId: string, year?: number) => mockRespond(mockHRData.getLeaveBalance),
  recalculateLeaveBalance: async (employeeId: string, year: number) => {
    const res = await apiClient.post('/hr/leave-balance/recalculate', { employeeId, year });
    return res.data;
  },

  // Benefits
  getBenefits: async (params?: any) => mockRespond(mockHRData.getBenefits),
  createBenefit: async (data: any) => {
    const res = await apiClient.post('/hr/benefits', data);
    return res.data;
  },
  updateBenefit: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/benefits/${id}`, data);
    return res.data;
  },
  deleteBenefit: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Policies
  getPolicies: async (category?: string) => mockRespond(mockHRData.getPolicies),
  createPolicy: async (data: any) => {
    const res = await apiClient.post('/hr/policies', data);
    return res.data;
  },
  updatePolicy: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/policies/${id}`, data);
    return res.data;
  },
  deletePolicy: async (id: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },

  // Overtime
  getOvertime: async (params?: any) => mockRespond(mockHRData.getOvertime),
  createOvertime: async (data: any) => {
    const res = await apiClient.post('/hr/overtime', data);
    return res.data;
  },
  updateOvertime: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/overtime/${id}`, data);
    return res.data;
  },
  approveOvertime: async (id: string, approverId: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },
  rejectOvertime: async (id: string, approverId: string, note?: string) => { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400)); },
};
