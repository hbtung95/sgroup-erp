import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, ProjectData, PropertyProductData, GenerateInventoryParams } from '../api/projectApi';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  products: (projectId: string) => [...projectKeys.detail(projectId), 'products'] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectApi.getProjects(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectApi.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProjectData>) => projectApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectData> }) => projectApi.updateProject(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useProjectProducts(projectId: string) {
  return useQuery({
    queryKey: projectKeys.products(projectId),
    queryFn: () => projectApi.getProducts(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<PropertyProductData> }) =>
      projectApi.createProduct(projectId, data),
    onSuccess: (data) => {
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.products(data.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyProductData> }) => projectApi.updateProduct(id, data),
    onSuccess: (data) => {
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.products(data.projectId) });
      } else {
        queryClient.invalidateQueries({ queryKey: projectKeys.all });
      }
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useLockProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, staffName }: { id: string; staffName?: string }) =>
      projectApi.lockProduct(id, staffName),
    onSuccess: (data) => {
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.products(data.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUnlockProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.unlockProduct(id),
    onSuccess: (data) => {
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.products(data.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useGenerateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, params }: { projectId: string; params: GenerateInventoryParams }) =>
      projectApi.generateInventory(projectId, params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.products(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}
