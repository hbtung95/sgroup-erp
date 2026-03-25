import { apiClient } from '../../../core/api/apiClient';

export const hrApi = {
  // Dashboard
  getDashboard: async () => {
    const res = await apiClient.get('/hr/dashboard');
    return res.data;
  },

  // Departments
  getDepartments: async () => {
    const res = await apiClient.get('/hr/departments');
    return res.data;
  },
  createDepartment: async (data: any) => {
    const res = await apiClient.post('/hr/departments', data);
    return res.data;
  },
  updateDepartment: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/departments/${id}`, data);
    return res.data;
  },
  deleteDepartment: async (id: string) => {
    await apiClient.delete(`/hr/departments/${id}`);
  },

  // Positions
  getPositions: async () => {
    const res = await apiClient.get('/hr/positions');
    return res.data;
  },
  createPosition: async (data: any) => {
    const res = await apiClient.post('/hr/positions', data);
    return res.data;
  },
  updatePosition: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/positions/${id}`, data);
    return res.data;
  },

  // Teams
  getTeams: async (departmentId?: string) => {
    const res = await apiClient.get('/hr/teams', { params: departmentId ? { departmentId } : {} });
    return res.data;
  },
  createTeam: async (data: any) => {
    const res = await apiClient.post('/hr/teams', data);
    return res.data;
  },
  updateTeam: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/teams/${id}`, data);
    return res.data;
  },
  deleteTeam: async (id: string) => {
    await apiClient.delete(`/hr/teams/${id}`);
  },

  // Employees
  getEmployees: async (params?: {
    search?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/hr/employees', { params });
    return res.data;
  },
  getEmployee: async (id: string) => {
    const res = await apiClient.get(`/hr/employees/${id}`);
    return res.data;
  },
  createEmployee: async (data: any) => {
    const res = await apiClient.post('/hr/employees', data);
    return res.data;
  },
  updateEmployee: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/employees/${id}`, data);
    return res.data;
  },
  deleteEmployee: async (id: string) => {
    await apiClient.delete(`/hr/employees/${id}`);
  },

  // Contracts
  getContracts: async (params?: { employeeId?: string; status?: string }) => {
    const res = await apiClient.get('/hr/contracts', { params });
    return res.data;
  },
  createContract: async (data: any) => {
    const res = await apiClient.post('/hr/contracts', data);
    return res.data;
  },
  updateContract: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/contracts/${id}`, data);
    return res.data;
  },

  // Attendance
  getAttendance: async (params?: {
    employeeId?: string;
    date?: string;
    month?: string;
    year?: string;
  }) => {
    const res = await apiClient.get('/hr/attendance', { params });
    return res.data;
  },
  createAttendance: async (data: any) => {
    const res = await apiClient.post('/hr/attendance', data);
    return res.data;
  },
  updateAttendance: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/attendance/${id}`, data);
    return res.data;
  },

  // Leaves
  getLeaves: async (params?: { employeeId?: string; status?: string }) => {
    const res = await apiClient.get('/hr/leaves', { params });
    return res.data;
  },
  createLeave: async (data: any) => {
    const res = await apiClient.post('/hr/leaves', data);
    return res.data;
  },
  updateLeave: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/leaves/${id}`, data);
    return res.data;
  },
  approveLeave: async (id: string, approverId: string) => {
    const res = await apiClient.post(`/hr/leaves/${id}/approve`, { approverId });
    return res.data;
  },
  rejectLeave: async (id: string, approverId: string, note?: string) => {
    const res = await apiClient.post(`/hr/leaves/${id}/reject`, { approverId, note });
    return res.data;
  },

  // Payroll
  getPayroll: async (params?: {
    period?: string;
    year?: string;
    month?: string;
    status?: string;
  }) => {
    const res = await apiClient.get('/hr/payroll', { params });
    return res.data;
  },
  generatePayroll: async (year: number, month: number) => {
    const res = await apiClient.post('/hr/payroll/generate', { year, month });
    return res.data;
  },
  approvePayroll: async (period: string, approvedBy: string) => {
    const res = await apiClient.post('/hr/payroll/approve', { period, approvedBy });
    return res.data;
  },

  // Performance
  getPerformance: async (params?: { employeeId?: string; period?: string }) => {
    const res = await apiClient.get('/hr/performance', { params });
    return res.data;
  },
  createPerformance: async (data: any) => {
    const res = await apiClient.post('/hr/performance', data);
    return res.data;
  },
  updatePerformance: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/performance/${id}`, data);
    return res.data;
  },

  // Recruitment
  getJobs: async (status?: string) => {
    const res = await apiClient.get('/hr/jobs', { params: status ? { status } : {} });
    return res.data;
  },
  createJob: async (data: any) => {
    const res = await apiClient.post('/hr/jobs', data);
    return res.data;
  },
  updateJob: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/jobs/${id}`, data);
    return res.data;
  },
  deleteJob: async (id: string) => {
    await apiClient.delete(`/hr/jobs/${id}`);
  },
  getCandidates: async (params?: { jobId?: string; stage?: string }) => {
    const res = await apiClient.get('/hr/candidates', { params });
    return res.data;
  },
  createCandidate: async (data: any) => {
    const res = await apiClient.post('/hr/candidates', data);
    return res.data;
  },
  updateCandidate: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/candidates/${id}`, data);
    return res.data;
  },
  deleteCandidate: async (id: string) => {
    await apiClient.delete(`/hr/candidates/${id}`);
  },

  // Training
  getCourses: async (status?: string) => {
    const res = await apiClient.get('/hr/courses', { params: status ? { status } : {} });
    return res.data;
  },
  createCourse: async (data: any) => {
    const res = await apiClient.post('/hr/courses', data);
    return res.data;
  },
  updateCourse: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/courses/${id}`, data);
    return res.data;
  },
  deleteCourse: async (id: string) => {
    await apiClient.delete(`/hr/courses/${id}`);
  },
  getTrainees: async (params?: { courseId?: string; status?: string }) => {
    const res = await apiClient.get('/hr/trainees', { params });
    return res.data;
  },
  createTrainee: async (data: any) => {
    const res = await apiClient.post('/hr/trainees', data);
    return res.data;
  },
  updateTrainee: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/trainees/${id}`, data);
    return res.data;
  },
  deleteTrainee: async (id: string) => {
    await apiClient.delete(`/hr/trainees/${id}`);
  },

  // Dashboard Extras
  getDashboardEvents: async () => {
    const res = await apiClient.get('/hr/dashboard/events');
    return res.data;
  },
  getDashboardActivities: async () => {
    const res = await apiClient.get('/hr/dashboard/activities');
    return res.data;
  },

  // Transfer History
  getTransfers: async (employeeId?: string) => {
    const res = await apiClient.get('/hr/transfers', { params: employeeId ? { employeeId } : {} });
    return res.data;
  },

  // Leave Balance
  getLeaveBalances: async (year?: number) => {
    const res = await apiClient.get('/hr/leave-balance', { params: year ? { year } : {} });
    return res.data;
  },
  getLeaveBalance: async (employeeId: string, year?: number) => {
    const res = await apiClient.get(`/hr/leave-balance/${employeeId}`, { params: year ? { year } : {} });
    return res.data;
  },
  recalculateLeaveBalance: async (employeeId: string, year: number) => {
    const res = await apiClient.post('/hr/leave-balance/recalculate', { employeeId, year });
    return res.data;
  },

  // Benefits
  getBenefits: async (params?: { employeeId?: string; benefitType?: string; status?: string }) => {
    const res = await apiClient.get('/hr/benefits', { params });
    return res.data;
  },
  createBenefit: async (data: any) => {
    const res = await apiClient.post('/hr/benefits', data);
    return res.data;
  },
  updateBenefit: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/benefits/${id}`, data);
    return res.data;
  },
  deleteBenefit: async (id: string) => {
    await apiClient.delete(`/hr/benefits/${id}`);
  },

  // Policies
  getPolicies: async (category?: string) => {
    const res = await apiClient.get('/hr/policies', { params: category ? { category } : {} });
    return res.data;
  },
  createPolicy: async (data: any) => {
    const res = await apiClient.post('/hr/policies', data);
    return res.data;
  },
  updatePolicy: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/policies/${id}`, data);
    return res.data;
  },
  deletePolicy: async (id: string) => {
    await apiClient.delete(`/hr/policies/${id}`);
  },

  // Overtime
  getOvertime: async (params?: { employeeId?: string; status?: string; month?: string; year?: string }) => {
    const res = await apiClient.get('/hr/overtime', { params });
    return res.data;
  },
  createOvertime: async (data: any) => {
    const res = await apiClient.post('/hr/overtime', data);
    return res.data;
  },
  updateOvertime: async (id: string, data: any) => {
    const res = await apiClient.patch(`/hr/overtime/${id}`, data);
    return res.data;
  },
  approveOvertime: async (id: string, approverId: string) => {
    const res = await apiClient.post(`/hr/overtime/${id}/approve`, { approverId });
    return res.data;
  },
  rejectOvertime: async (id: string, approverId: string, note?: string) => {
    const res = await apiClient.post(`/hr/overtime/${id}/reject`, { approverId, note });
    return res.data;
  },
};
