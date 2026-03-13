/**
 * useBookings — TanStack Query hook for booking CRUD
 * Replaces Zustand store booking operations with real API calls
 * Falls back to empty array if API is unavailable
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export interface BookingEntry {
  id: string;
  project: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  bookingCount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  staffName?: string;
  staffId?: string;
}

// GET bookings
export const useGetBookings = (params?: { year?: number; month?: number; status?: string }) =>
  useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/sales-ops/bookings', { params });
        const data = res.data;
        return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      } catch {
        return []; // API may not exist yet — return empty
      }
    },
  });

// CREATE booking
export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<BookingEntry, 'id' | 'date' | 'status'>) => {
      const res = await apiClient.post('/sales-ops/bookings', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

// UPDATE booking
export const useUpdateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BookingEntry> }) => {
      const res = await apiClient.patch(`/sales-ops/bookings/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

// DELETE booking
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

// APPROVE booking (Admin)
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

// REJECT booking (Admin)
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
