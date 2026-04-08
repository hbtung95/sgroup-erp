import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HRApi } from '../../infrastructure/api/hr-api';

export const hrKeys = {
  all: ['hr'] as const,
  employees: () => [...hrKeys.all, 'employees'] as const,
  employee: (id: string) => [...hrKeys.employees(), id] as const,
  leaves: () => [...hrKeys.all, 'leaves'] as const,
  payroll: (period: string) => [...hrKeys.all, 'payroll', period] as const,
  attendance: () => [...hrKeys.all, 'attendance'] as const,
};

// ======================
// Employee Hooks
// ======================
export const useGetEmployees = (params?: { search?: string, departmentId?: string }) => {
  return useQuery({
    queryKey: [...hrKeys.employees(), params],
    queryFn: () => HRApi.getEmployees(params),
  });
};

export const useGetEmployeeById = (id: string) => {
  return useQuery({
    queryKey: hrKeys.employee(id),
    queryFn: () => HRApi.getEmployeeById(id),
    enabled: !!id,
  });
};

// ======================
// Leave Hooks
// ======================
export const useGetLeaves = (params?: { employeeId?: string, status?: string }) => {
  return useQuery({
    queryKey: [...hrKeys.leaves(), params],
    queryFn: () => HRApi.getLeaves(params),
  });
};

export const useRequestLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: HRApi.requestLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves() });
    },
  });
};

// ======================
// Payroll Hooks
// ======================
export const useGetPayroll = (period: string, status?: string) => {
  return useQuery({
    queryKey: [...hrKeys.payroll(period), status],
    queryFn: () => HRApi.getPayroll(period, status),
    enabled: !!period,
  });
};

export const useGeneratePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ year, month }: { year: number, month: number }) => HRApi.generatePayroll(year, month),
    onSuccess: (_, variables) => {
      const period = `${variables.year}-${String(variables.month).padStart(2, '0')}`;
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll(period) });
    },
  });
};

// ======================
// Attendance Hooks
// ======================
export const useGetAttendance = (params?: { employeeId?: string, month?: number, year?: number }) => {
  return useQuery({
    queryKey: [...hrKeys.attendance(), params],
    queryFn: () => HRApi.getAttendance(params),
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: HRApi.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
    },
  });
};
