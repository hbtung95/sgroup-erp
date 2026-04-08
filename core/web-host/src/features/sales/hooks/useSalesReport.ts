import { useQuery } from '@tanstack/react-query';
import { SalesReportAPI } from '../../../core/api/sales-report.api';

export const useGetKpiCards = (params: { year: number; month?: number; teamId?: string; staffId?: string }) =>
  useQuery({ queryKey: ['salesReport', 'kpi', params], queryFn: () => SalesReportAPI.getKpiCards(params) });

export const useGetPlanVsActual = (params: { year: number; scenarioKey?: string; teamId?: string }) =>
  useQuery({ queryKey: ['salesReport', 'planVsActual', params], queryFn: () => SalesReportAPI.getPlanVsActual(params) });

export const useGetTeamPerformance = (params: { year: number; month?: number }) =>
  useQuery({ queryKey: ['salesReport', 'teamPerf', params], queryFn: () => SalesReportAPI.getTeamPerformance(params) });

export const useGetStaffPerformance = (params: { year: number; month?: number; teamId?: string }) =>
  useQuery({ queryKey: ['salesReport', 'staffPerf', params], queryFn: () => SalesReportAPI.getStaffPerformance(params) });

export const useGetActualFunnel = (params: { year: number; month?: number; teamId?: string }) =>
  useQuery({ queryKey: ['salesReport', 'funnel', params], queryFn: () => SalesReportAPI.getActualFunnel(params) });

export const useGetCommissionReport = (params: { year: number; month?: number; teamId?: string; staffId?: string }) =>
  useQuery({ queryKey: ['salesReport', 'commission', params], queryFn: () => SalesReportAPI.getCommissionReport(params) });

export const useGetProjectPerformance = (params: { year: number }) =>
  useQuery({ queryKey: ['salesReport', 'projectPerf', params], queryFn: () => SalesReportAPI.getProjectPerformance(params) });
