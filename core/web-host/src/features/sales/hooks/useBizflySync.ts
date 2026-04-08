import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BizflySyncAPI } from '../../../core/api/bizfly-sync.api';

export const useGetSyncStatus = () =>
  useQuery({ queryKey: ['bizflySync', 'status'], queryFn: BizflySyncAPI.getSyncStatus, refetchInterval: 30000 });

export const useGetSyncHistory = (limit = 20) =>
  useQuery({ queryKey: ['bizflySync', 'history', limit], queryFn: () => BizflySyncAPI.getSyncHistory(limit) });

export const useTriggerSync = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: BizflySyncAPI.triggerSync,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bizflySync'] });
      qc.invalidateQueries({ queryKey: ['salesOps'] });
      qc.invalidateQueries({ queryKey: ['salesReport'] });
    },
  });
};

export const useReconcile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: BizflySyncAPI.reconcile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bizflySync'] }),
  });
};
