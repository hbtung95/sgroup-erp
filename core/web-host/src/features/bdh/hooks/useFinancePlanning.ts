import { useQuery } from '@tanstack/react-query';
import { FinancePlanningAPI } from '../../../core/api/finance-planning.api';

export const useGetFinanceLatest = (year: number, scenario: string, options = {}) => {
  return useQuery({
    queryKey: ['financePlanning', 'latest', { year, scenario }],
    queryFn: () => FinancePlanningAPI.getLatest(year, scenario),
    ...options,
  });
};

export const useGetFinancePnl = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['financePlanning', 'pnl', planId],
    queryFn: () => FinancePlanningAPI.getPnl(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetFinanceCashflow = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['financePlanning', 'cashflow', planId],
    queryFn: () => FinancePlanningAPI.getCashflow(planId),
    enabled: !!planId,
    ...options,
  });
};
