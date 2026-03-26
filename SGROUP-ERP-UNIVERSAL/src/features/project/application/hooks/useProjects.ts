import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, GenerateInventoryParams } from '../../infrastructure/api/projectApi';
import { DimProject, PropertyProduct } from '../../domain/models';

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
    mutationFn: (data: Partial<DimProject>) => projectApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DimProject> }) => projectApi.updateProject(id, data),
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
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<PropertyProduct> }) =>
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
    mutationFn: ({ projectId, id, data }: { projectId: string; id: string; data: Partial<PropertyProduct> }) => projectApi.updateProduct(projectId, id, data),
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
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) => projectApi.deleteProduct(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useLockProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, id, staffName }: { projectId: string; id: string; staffName?: string }) =>
      projectApi.lockProduct(projectId, id, staffName),
    onMutate: async ({ projectId, id, staffName }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.products(projectId) });

      const previousProducts = queryClient.getQueryData<PropertyProduct[]>(projectKeys.products(projectId));

      if (previousProducts) {
        queryClient.setQueryData<PropertyProduct[]>(
          projectKeys.products(projectId),
          previousProducts.map(p =>
            p.id === id ? { ...p, status: 'LOCKED', bookedBy: staffName || 'Unknown' } : p
          )
        );
      }

      return { previousProducts, projectId };
    },
    onError: (_err, _newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(projectKeys.products(context.projectId), context.previousProducts);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.products(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUnlockProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) => projectApi.unlockProduct(projectId, id),
    onMutate: async ({ projectId, id }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.products(projectId) });

      const previousProducts = queryClient.getQueryData<PropertyProduct[]>(projectKeys.products(projectId));

      if (previousProducts) {
        queryClient.setQueryData<PropertyProduct[]>(
          projectKeys.products(projectId),
          previousProducts.map(p =>
            p.id === id ? { ...p, status: 'AVAILABLE', bookedBy: null, lockedUntil: null } as unknown as PropertyProduct : p
          )
        );
      }

      return { previousProducts, projectId };
    },
    onError: (_err, _newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(projectKeys.products(context.projectId), context.previousProducts);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.products(variables.projectId) });
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
