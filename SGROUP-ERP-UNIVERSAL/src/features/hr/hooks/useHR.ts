import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../api/hrApi';

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
export function useHRDashboard() {
  return useQuery({
    queryKey: ['hr', 'dashboard'],
    queryFn: hrApi.getDashboard,
  });
}

// ═══════════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════════
export function useDepartments() {
  return useQuery({
    queryKey: ['hr', 'departments'],
    queryFn: hrApi.getDepartments,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createDepartment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateDepartment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// POSITIONS
// ═══════════════════════════════════════════
export function usePositions() {
  return useQuery({
    queryKey: ['hr', 'positions'],
    queryFn: hrApi.getPositions,
  });
}

export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createPosition(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updatePosition(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// TEAMS
// ═══════════════════════════════════════════
export function useTeams(departmentId?: string) {
  return useQuery({
    queryKey: ['hr', 'teams', departmentId],
    queryFn: () => hrApi.getTeams(departmentId),
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createTeam(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateTeam(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════
export function useEmployees(params?: {
  search?: string;
  departmentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['hr', 'employees', params],
    queryFn: () => hrApi.getEmployees(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['hr', 'employees', id],
    queryFn: () => hrApi.getEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createEmployee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateEmployee(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// CONTRACTS
// ═══════════════════════════════════════════
export function useContracts(params?: { employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: ['hr', 'contracts', params],
    queryFn: () => hrApi.getContracts(params),
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createContract(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════
export function useAttendance(params?: {
  employeeId?: string;
  date?: string;
  month?: string;
  year?: string;
}) {
  return useQuery({
    queryKey: ['hr', 'attendance', params],
    queryFn: () => hrApi.getAttendance(params),
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createAttendance(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'attendance'] }),
  });
}

// ═══════════════════════════════════════════
// LEAVES
// ═══════════════════════════════════════════
export function useLeaves(params?: { employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: ['hr', 'leaves', params],
    queryFn: () => hrApi.getLeaves(params),
  });
}

export function useCreateLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createLeave(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approverId }: { id: string; approverId: string }) =>
      hrApi.approveLeave(id, approverId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approverId, note }: { id: string; approverId: string; note?: string }) =>
      hrApi.rejectLeave(id, approverId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// PAYROLL
// ═══════════════════════════════════════════
export function usePayroll(params?: {
  period?: string;
  year?: string;
  month?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['hr', 'payroll', params],
    queryFn: () => hrApi.getPayroll(params),
  });
}

export function useGeneratePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      hrApi.generatePayroll(year, month),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'payroll'] }),
  });
}

export function useApprovePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ period, approvedBy }: { period: string; approvedBy: string }) =>
      hrApi.approvePayroll(period, approvedBy),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'payroll'] }),
  });
}

// ═══════════════════════════════════════════
// PERFORMANCE
// ═══════════════════════════════════════════
export function usePerformance(params?: { employeeId?: string; period?: string }) {
  return useQuery({
    queryKey: ['hr', 'performance', params],
    queryFn: () => hrApi.getPerformance(params),
  });
}

export function useCreatePerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createPerformance(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'performance'] }),
  });
}

// ═══════════════════════════════════════════
// RECRUITMENT
// ═══════════════════════════════════════════
export function useJobs(status?: string) {
  return useQuery({
    queryKey: ['hr', 'jobs', status],
    queryFn: () => hrApi.getJobs(status),
  });
}

export function useCandidates(params?: { jobId?: string; stage?: string }) {
  return useQuery({
    queryKey: ['hr', 'candidates', params],
    queryFn: () => hrApi.getCandidates(params),
  });
}

// ═══════════════════════════════════════════
// TRAINING
// ═══════════════════════════════════════════
export function useCourses(status?: string) {
  return useQuery({
    queryKey: ['hr', 'courses', status],
    queryFn: () => hrApi.getCourses(status),
  });
}

export function useTrainees(params?: { courseId?: string; status?: string }) {
  return useQuery({
    queryKey: ['hr', 'trainees', params],
    queryFn: () => hrApi.getTrainees(params),
  });
}

// ═══════════════════════════════════════════
// DASHBOARD EXTRAS
// ═══════════════════════════════════════════
export function useDashboardEvents() {
  return useQuery({
    queryKey: ['hr', 'dashboard', 'events'],
    queryFn: hrApi.getDashboardEvents,
  });
}

export function useDashboardActivities() {
  return useQuery({
    queryKey: ['hr', 'dashboard', 'activities'],
    queryFn: hrApi.getDashboardActivities,
  });
}

// ═══════════════════════════════════════════
// TRANSFER HISTORY
// ═══════════════════════════════════════════
export function useTransferHistory(employeeId?: string) {
  return useQuery({
    queryKey: ['hr', 'transfers', employeeId],
    queryFn: () => hrApi.getTransfers(employeeId),
    enabled: !!employeeId,
  });
}
