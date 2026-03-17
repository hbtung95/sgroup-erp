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
  getCandidates: async (params?: { jobId?: string; stage?: string }) => {
    const res = await apiClient.get('/hr/candidates', { params });
    return res.data;
  },

  // Training
  getCourses: async (status?: string) => {
    const res = await apiClient.get('/hr/courses', { params: status ? { status } : {} });
    return res.data;
  },
  getTrainees: async (params?: { courseId?: string; status?: string }) => {
    const res = await apiClient.get('/hr/trainees', { params });
    return res.data;
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
};
