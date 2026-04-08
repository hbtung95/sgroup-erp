/**
 * useAppointments — TanStack Query hook for Appointment calendar CRUD
 * Migrated from useState + salesApi to useQuery/useMutation + apiClient
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export type AppointmentType = 'MEETING' | 'SITE_VISIT' | 'FOLLOW_UP' | 'SIGNING';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type AppointmentEntry = {
  id: string;
  staffId: string;
  staffName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  projectId?: string;
  projectName?: string;
  type: AppointmentType;
  scheduledAt: string;
  duration: number;
  location?: string;
  status: AppointmentStatus;
  outcome?: string;
  note?: string;
  createdAt: string;
};

const APPOINTMENTS_KEY = 'appointments';

export function useAppointments(filters?: Record<string, any>) {
  const qc = useQueryClient();

  const { data: appointments = [], isLoading: loading } = useQuery({
    queryKey: [APPOINTMENTS_KEY, filters],
    queryFn: async () => {
      const res = await apiClient.get('/appointments', { params: filters });
      return res.data as AppointmentEntry[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<AppointmentEntry>) => {
      const res = await apiClient.post('/appointments', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AppointmentEntry> }) => {
      const res = await apiClient.patch(`/appointments/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/appointments/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });

  return {
    appointments,
    loading,
    fetchAppointments: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
    createAppointment: (data: Partial<AppointmentEntry>) => createMutation.mutateAsync(data),
    updateAppointment: (id: string, data: Partial<AppointmentEntry>) => updateMutation.mutateAsync({ id, data }),
    cancelAppointment: (id: string) => cancelMutation.mutateAsync(id),
  };
}
