import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinanceApi } from '../../infrastructure/api/finance-api';

export const financeKeys = {
  all: ['finance'] as const,
  accounts: () => [...financeKeys.all, 'accounts'] as const,
  accountDetails: (id: string) => [...financeKeys.accounts(), id] as const,
  transactions: () => [...financeKeys.all, 'transactions'] as const,
  debts: () => [...financeKeys.all, 'debts'] as const,
  reports: () => [...financeKeys.all, 'reports'] as const,
};

export const useGetAccounts = () => {
  return useQuery({ queryKey: financeKeys.accounts(), queryFn: FinanceApi.getAccounts });
};

export const useGetTransactions = (filters?: { type?: string }) => {
  return useQuery({ queryKey: [...financeKeys.transactions(), filters], queryFn: () => FinanceApi.getTransactions(filters) });
};

export const useRecordTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => FinanceApi.recordTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.reports() });
    },
  });
};

export const useGetDebts = () => {
  return useQuery({ queryKey: financeKeys.debts(), queryFn: FinanceApi.getDebts });
};

export const usePayDebt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => FinanceApi.payDebt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.debts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.reports() });
    },
  });
};

// ==========================================
// CFO REPORTING HOOKS
// ==========================================
export const useGetPnl = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...financeKeys.reports(), 'pnl', startDate, endDate],
    queryFn: () => FinanceApi.getPnl(startDate, endDate)
  });
};

export const useGetCashFlow = (year?: number) => {
  return useQuery({
    queryKey: [...financeKeys.reports(), 'cash-flow', year],
    queryFn: () => FinanceApi.getCashFlow(year)
  });
};

export const useGetBalanceSheet = () => {
  return useQuery({
    queryKey: [...financeKeys.reports(), 'balance-sheet'],
    queryFn: FinanceApi.getBalanceSheet
  });
};
