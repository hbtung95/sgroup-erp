import axios from 'axios';

const financeApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/finance` : 'http://localhost:3000/finance',
  timeout: 10000,
});

financeApi.interceptors.request.use(config => {
  return config; // Add auth tokens here
});

export const FinanceApi = {
  getAccounts: async () => {
    const res = await financeApi.get('/accounts');
    return res.data;
  },
  getAccountDetails: async (id: string) => {
    const res = await financeApi.get(`/accounts/${id}`);
    return res.data;
  },
  getTransactions: async (params?: { skip?: number, take?: number, type?: string }) => {
    const res = await financeApi.get('/transactions', { params });
    return res.data;
  },
  recordTransaction: async (data: any) => {
    const res = await financeApi.post('/transactions/record', data);
    return res.data;
  },
  getDebts: async () => {
    const res = await financeApi.get('/debts');
    return res.data;
  },
  payDebt: async (id: string, data: any) => {
    const res = await financeApi.post(`/debts/${id}/pay`, data);
    return res.data;
  },
  // CFO Custom Reports
  getPnl: async (startDate?: string, endDate?: string) => {
    const res = await financeApi.get('/reports/pnl', { params: { startDate, endDate } });
    return res.data;
  },
  getCashFlow: async (year?: number) => {
    const res = await financeApi.get('/reports/cash-flow', { params: { year } });
    return res.data;
  },
  getBalanceSheet: async () => {
    const res = await financeApi.get('/reports/balance-sheet');
    return res.data;
  }
};
