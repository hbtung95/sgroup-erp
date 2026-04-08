import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export interface BookingEntry {
  id: string;
  project: string;
  projectId?: string | null;
  projectName?: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  bookingCount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  staffName?: string | null;
  staffId?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  note?: string | null;
  createdByName?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
}

export type BookingPayload = {
  project: string;
  projectId?: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  bookingCount: number;
  note?: string;
};

type BookingUpdatePayload = Partial<BookingPayload> & {
  status?: BookingEntry['status'];
};

function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

export const useGetBookings = (params?: {
  year?: number;
  month?: number;
  status?: string;
  projectId?: string;
}) =>
  useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const res = await apiClient.get('/sales-ops/bookings', { params });
      return normalizeListResponse<BookingEntry>(res.data);
    },
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingPayload) => {
      const res = await apiClient.post('/sales-ops/bookings', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useUpdateBooking = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BookingUpdatePayload }) => {
      const res = await apiClient.patch(`/sales-ops/bookings/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useDeleteBooking = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/sales-ops/bookings/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useApproveBooking = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sales-ops/bookings/${id}/approve`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useRejectBooking = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sales-ops/bookings/${id}/reject`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};
