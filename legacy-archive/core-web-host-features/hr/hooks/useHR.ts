import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../api/hrApi';
import { Employee, Department, Position, Team } from '../types';

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
    mutationFn: (data: Omit<Employee, 'id'>) => hrApi.createEmployee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) => hrApi.updateEmployee(id, data),
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
export function usePayrollRuns(params?: any) {
  return useQuery({
    queryKey: ['hr', 'payroll-runs', params],
    queryFn: () => hrApi.getPayrollRuns(params),
  });
}

export function usePayslips(runId: number | string) {
  return useQuery({
    queryKey: ['hr', 'payslips', runId],
    queryFn: () => hrApi.getPayslips(runId),
    enabled: !!runId,
  });
}

export function useGeneratePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string, cycle_start: string, cycle_end: string, standard_days: number, admin_id: number }) =>
      hrApi.generatePayroll(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'payroll-runs'] }),
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

// ═══════════════════════════════════════════
// RECRUITMENT — Mutations
// ═══════════════════════════════════════════
export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createJob(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'jobs'] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateJob(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'jobs'] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createCandidate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'candidates'] }),
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateCandidate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'candidates'] }),
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteCandidate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// TRAINING — Mutations
// ═══════════════════════════════════════════
export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createCourse(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'courses'] }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateCourse(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'courses'] }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useCreateTrainee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createTrainee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'trainees'] }),
  });
}

export function useUpdateTrainee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateTrainee(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'trainees'] }),
  });
}

export function useDeleteTrainee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteTrainee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

// ═══════════════════════════════════════════
// LEAVE BALANCE
// ═══════════════════════════════════════════
export function useLeaveBalances(year?: number) {
  return useQuery({
    queryKey: ['hr', 'leave-balance', year],
    queryFn: () => hrApi.getLeaveBalances(year),
  });
}

export function useLeaveBalance(employeeId: string, year?: number) {
  return useQuery({
    queryKey: ['hr', 'leave-balance', employeeId, year],
    queryFn: () => hrApi.getLeaveBalance(employeeId, year),
    enabled: !!employeeId,
  });
}

export function useRecalculateLeaveBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, year }: { employeeId: string; year: number }) =>
      hrApi.recalculateLeaveBalance(employeeId, year),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'leave-balance'] }),
  });
}

// ═══════════════════════════════════════════
// BENEFITS
// ═══════════════════════════════════════════
export function useBenefits(params?: { employeeId?: string; benefitType?: string; status?: string }) {
  return useQuery({
    queryKey: ['hr', 'benefits', params],
    queryFn: () => hrApi.getBenefits(params),
  });
}

export function useCreateBenefit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createBenefit(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'benefits'] }),
  });
}

export function useUpdateBenefit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateBenefit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'benefits'] }),
  });
}

export function useDeleteBenefit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteBenefit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'benefits'] }),
  });
}

// ═══════════════════════════════════════════
// POLICIES
// ═══════════════════════════════════════════
export function usePolicies(category?: string) {
  return useQuery({
    queryKey: ['hr', 'policies', category],
    queryFn: () => hrApi.getPolicies(category),
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createPolicy(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'policies'] }),
  });
}

export function useUpdatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updatePolicy(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'policies'] }),
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deletePolicy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'policies'] }),
  });
}

// ═══════════════════════════════════════════
// OVERTIME
// ═══════════════════════════════════════════
export function useOvertime(params?: { employeeId?: string; status?: string; month?: string; year?: string }) {
  return useQuery({
    queryKey: ['hr', 'overtime', params],
    queryFn: () => hrApi.getOvertime(params),
  });
}

export function useCreateOvertime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createOvertime(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'overtime'] }),
  });
}

export function useUpdateOvertime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateOvertime(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'overtime'] }),
  });
}

export function useApproveOvertime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approverId }: { id: string; approverId: string }) =>
      hrApi.approveOvertime(id, approverId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'overtime'] }),
  });
}

export function useRejectOvertime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approverId, note }: { id: string; approverId: string; note?: string }) =>
      hrApi.rejectOvertime(id, approverId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'overtime'] }),
  });
}

