import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../api/finance.api';
import { FinanceTransaction, DebtRecord, FinanceAccount } from '../types/finance.types';

export function useFinanceDashboard() {
  return useQuery({
    queryKey: ['finance', 'dashboard'],
    queryFn: financeApi.getDashboardStats,
  });
}

export function useFinanceAccounts() {
  return useQuery({
    queryKey: ['finance', 'accounts'],
    queryFn: financeApi.getAccounts,
  });
}

export function useFinanceCategories() {
  return useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: financeApi.getCategories,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FinanceAccount>) => financeApi.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

export function useFinanceTransactions(params?: any) {
  return useQuery({
    queryKey: ['finance', 'transactions', params],
    queryFn: () => financeApi.getTransactions(params),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FinanceTransaction>) =>
      financeApi.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'dashboard'] });
    },
  });
}

export function useApproveTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.approveTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

export function useFinanceDebts(params?: any) {
  return useQuery({
    queryKey: ['finance', 'debts', params],
    queryFn: () => financeApi.getDebts(params),
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DebtRecord>) => financeApi.createDebt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'debts'] });
    },
  });
}
