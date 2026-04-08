import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectApi } from '../../infrastructure/api/project-api';

export const projectKeys = {
  all: ['project'] as const,
  core: () => [...projectKeys.all, 'core'] as const,
  products: (projectId: string) => [...projectKeys.all, 'products', projectId] as const,
  policies: () => [...projectKeys.all, 'policies'] as const,
  docs: () => [...projectKeys.all, 'docs'] as const,
  assignments: () => [...projectKeys.all, 'assignments'] as const,
};

export const useGetProjects = () => {
  return useQuery({
    queryKey: projectKeys.core(),
    queryFn: ProjectApi.getProjects,
  });
};

export const useGetProjectById = (id: string) => {
  return useQuery({
    queryKey: [...projectKeys.core(), id],
    queryFn: () => ProjectApi.getProjectById(id),
    enabled: !!id,
  });
};

export const useGetInventory = (projectId: string, filters?: { status?: string }) => {
  return useQuery({
    queryKey: [...projectKeys.products(projectId), filters],
    queryFn: () => ProjectApi.getProducts(projectId, filters),
    enabled: !!projectId,
  });
};

export const useLockProduct = () => {
  const queryCustom = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, productId, staffName }: { projectId: string, productId: string, staffName?: string }) => 
      ProjectApi.lockProduct(projectId, productId, staffName),
    onSuccess: (_, variables) => {
      queryCustom.invalidateQueries({ queryKey: projectKeys.products(variables.projectId) });
    },
  });
};

export const useGetProjectPolicies = (status?: string) => {
  return useQuery({
    queryKey: [...projectKeys.policies(), status],
    queryFn: () => ProjectApi.getPolicies(status),
  });
};
