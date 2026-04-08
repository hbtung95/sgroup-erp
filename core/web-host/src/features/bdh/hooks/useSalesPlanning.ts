import { useQuery } from '@tanstack/react-query';
import { SalesPlanningAPI } from '../../../core/api/sales-planning.api';

export const useGetSalesLatest = (year: number, scenario: string, options = {}) => {
  return useQuery({
    queryKey: ['salesPlanning', 'latest', { year, scenario }],
    queryFn: () => SalesPlanningAPI.getLatest(year, scenario),
    ...options,
  });
};

export const useGetSalesHeader = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['salesPlanning', 'header', planId],
    queryFn: () => SalesPlanningAPI.getHeader(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetSalesMonths = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['salesPlanning', 'months', planId],
    queryFn: () => SalesPlanningAPI.getMonths(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetSalesTeams = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['salesPlanning', 'teams', planId],
    queryFn: () => SalesPlanningAPI.getTeams(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetSalesStaff = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['salesPlanning', 'staff', planId],
    queryFn: () => SalesPlanningAPI.getStaff(planId),
    enabled: !!planId,
    ...options,
  });
};
