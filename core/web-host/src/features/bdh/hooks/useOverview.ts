import { useQuery } from '@tanstack/react-query';
import { OverviewAPI } from '../../../core/api/overview.api';

export const useGetDashboardData = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'dashboard', year],
    queryFn: () => OverviewAPI.getDashboard(year),
    ...options,
  });
};

export const useGetOverviewAlerts = (options = {}) => {
  return useQuery({
    queryKey: ['overview', 'alerts'],
    queryFn: () => OverviewAPI.getAlerts(),
    refetchInterval: 60000, // Refresh alerts every minute
    ...options,
  });
};

export const useGetMarketingPerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'marketing-performance', year],
    queryFn: () => OverviewAPI.getMarketingPerformance(year),
    ...options,
  });
};

export const useGetSalesPerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'sales-performance', year],
    queryFn: () => OverviewAPI.getSalesPerformance(year),
    ...options,
  });
};

export const useGetHRPerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'hr-performance', year],
    queryFn: () => OverviewAPI.getHRPerformance(year),
    ...options,
  });
};

export const useGetFinancePerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'finance-performance', year],
    queryFn: () => OverviewAPI.getFinancePerformance(year),
    ...options,
  });
};

export const useGetAgencyPerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'agency-performance', year],
    queryFn: () => OverviewAPI.getAgencyPerformance(year),
    ...options,
  });
};

export const useGetSHomesPerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'shomes-performance', year],
    queryFn: () => OverviewAPI.getSHomesPerformance(year),
    ...options,
  });
};

export const useGetProjectPerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'project-performance', year],
    queryFn: () => OverviewAPI.getProjectPerformance(year),
    ...options,
  });
};

export const useGetOpsPerformance = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['overview', 'ops-performance', year],
    queryFn: () => OverviewAPI.getOpsPerformance(year),
    ...options,
  });
};
