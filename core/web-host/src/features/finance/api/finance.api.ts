import { apiClient } from '../../../core/api/apiClient';
import {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
  DebtRecord,
} from '../types/finance.types';

export const financeApi = {
  // Accounts
  getAccounts: async () => {
    const res = await apiClient.get<FinanceAccount[]>('/finance/accounts');
    return res.data;
  },
  createAccount: async (data: Partial<FinanceAccount>) => {
    const res = await apiClient.post<FinanceAccount>('/finance/accounts', data);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await apiClient.get<FinanceCategory[]>('/finance/categories');
    return res.data;
  },

  // Transactions
  getDashboardStats: async () => {
    const res = await apiClient.get<any>('/finance/transactions/dashboard');
    return res.data;
  },
  getTransactions: async (params?: any) => {
    const res = await apiClient.get<{ data: FinanceTransaction[]; meta: any }>(
      '/finance/transactions',
      { params }
    );
    return res.data;
  },
  createTransaction: async (data: Partial<FinanceTransaction>) => {
    const res = await apiClient.post<FinanceTransaction>(
      '/finance/transactions',
      data
    );
    return res.data;
  },
  approveTransaction: async (id: string) => {
    const res = await apiClient.patch<FinanceTransaction>(
      `/finance/transactions/${id}/approve`,
      {}
    );
    return res.data;
  },

  // Debts
  getDebts: async (params?: any) => {
    const res = await apiClient.get<{ data: DebtRecord[]; meta: any }>(
      '/finance/debts',
      { params }
    );
    return res.data;
  },
  createDebt: async (data: Partial<DebtRecord>) => {
    const res = await apiClient.post<DebtRecord>('/finance/debts', data);
    return res.data;
  },
};
