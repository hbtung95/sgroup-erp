import axios from 'axios';

const salesApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/sales-crm` : 'http://localhost:3000/sales-crm',
  timeout: 10000,
});

salesApi.interceptors.request.use(config => {
  return config; // Add auth tokens here
});

export const SalesApi = {
  // Customers
  getCustomers: async (params?: { skip?: number, take?: number, status?: string }) => {
    const res = await salesApi.get('/customers', { params });
    return res.data;
  },
  getCustomerById: async (id: string) => {
    const res = await salesApi.get(`/customers/${id}`);
    return res.data;
  },
  createCustomer: async (data: any, staffId: string) => {
    const res = await salesApi.post('/customers', { ...data, staffId });
    return res.data;
  },

  // Activities
  getActivities: async () => {
    const res = await salesApi.get('/activities');
    return res.data;
  },

  // Appointments
  getAppointments: async () => {
    const res = await salesApi.get('/appointments');
    return res.data;
  }
};
