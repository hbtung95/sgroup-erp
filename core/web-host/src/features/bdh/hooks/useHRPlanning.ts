import { useQuery } from '@tanstack/react-query';
import { HrPlanningAPI } from '../../../core/api/hr-planning.api';

export const useGetHRLatest = (year: number, options = {}) => {
  return useQuery({
    queryKey: ['hrPlanning', 'latest', year],
    queryFn: () => HrPlanningAPI.getLatest(year),
    ...options,
  });
};

export const useGetHRDepartments = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['hrPlanning', 'departments', planId],
    queryFn: () => HrPlanningAPI.getDepartments(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetHRHeadcounts = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['hrPlanning', 'headcounts', planId],
    queryFn: () => HrPlanningAPI.getHeadcounts(planId),
    enabled: !!planId,
    ...options,
  });
};
