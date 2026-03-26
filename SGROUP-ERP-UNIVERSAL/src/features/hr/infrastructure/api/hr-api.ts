import axios from 'axios';

// Ensure the baseURL points to the NestJS HR endpoints
const hrApiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/hr` : 'http://localhost:3000/hr',
  timeout: 10000,
});

// Request Interceptor: Attach JWT token here if needed
hrApiClient.interceptors.request.use(config => {
  // const token = await SecureStore.getItemAsync('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const HRApi = {
  // Employees
  getEmployees: async (params?: { search?: string, departmentId?: string, page?: number, limit?: number }) => {
    const res = await hrApiClient.get('/employees', { params });
    return res.data;
  },
  getEmployeeById: async (id: string) => {
    const res = await hrApiClient.get(`/employees/${id}`);
    return res.data;
  },

  // Leave Requests
  getLeaves: async (params?: { employeeId?: string, status?: string }) => {
    const res = await hrApiClient.get('/leaves', { params });
    return res.data;
  },
  requestLeave: async (data: { employeeId: string, leaveType: string, startDate: string, endDate: string, totalDays: number, reason: string }) => {
    const res = await hrApiClient.post('/leaves', data);
    return res.data;
  },

  // Payroll
  getPayroll: async (period: string, status?: string) => {
    const res = await hrApiClient.get('/payroll', { params: { period, status } });
    return res.data;
  },
  generatePayroll: async (year: number, month: number) => {
    const res = await hrApiClient.post('/payroll/generate', { year, month });
    return res.data;
  },

  // Attendance
  getAttendance: async (params?: { employeeId?: string, month?: number, year?: number }) => {
    const res = await hrApiClient.get('/attendance', { params });
    return res.data;
  },
  checkIn: async (data: { employeeId: string, date: string, checkInTime?: string, checkOutTime?: string, note?: string }) => {
    const res = await hrApiClient.post('/attendance', data);
    return res.data;
  }
};
