import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../../infrastructure/api/projectApi';

// Policies
export function usePolicies(status?: string) {
  return useQuery({
    queryKey: ['project', 'policies', status],
    queryFn: () => projectApi.getPolicies(status),
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => projectApi.createPolicy(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', 'policies'] }),
  });
}

// Documents
export function useProjectDocs(projectId?: string) {
  return useQuery({
    queryKey: ['project', 'docs', projectId],
    queryFn: () => projectApi.getDocs(projectId),
  });
}

export function useCreateDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => projectApi.createDoc(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', 'docs'] }),
  });
}

// Assignments
export function useAssignments(params?: { projectId?: string; status?: string }) {
  return useQuery({
    queryKey: ['project', 'assignments', params],
    queryFn: () => projectApi.getAssignments(params),
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => projectApi.createAssignment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', 'assignments'] }),
  });
}
