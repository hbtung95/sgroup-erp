/**
 * useSalesStore — Slimmed Zustand store
 * Only manages client-side UI state. All data fetching is via TanStack Query hooks.
 * Inventory/Transaction actions delegate to useProducts hook (TanStack Query).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- TYPES (kept for backward compat) ---
export type UnitStatus = 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'PENDING_DEPOSIT' | 'DEPOSIT' | 'SOLD' | 'WAITING_CONTRACT' | 'COMPLETED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ActivityEntry = {
  id: string;
  date: string;
  postsCount: number;
  callsCount: number;
  newLeads: number;
  meetingsMade: number;
};

export type BookingEntry = {
  id: string;
  date: string;
  project: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  bookingCount: number;
  status: BookingStatus;
};

export type TransactionEntry = {
  id: string;
  date: string;
  project: string;
  unitCode: string;
  customerName: string;
  customerPhone: string;
  transactionValue: number;
  status: UnitStatus;
  notes?: string;
};

// --- STORE ---
interface SalesState {
  // Client-side state only
  selectedProject: string;
  activities: ActivityEntry[];
  bookings: BookingEntry[];

  // Actions
  setSelectedProject: (proj: string) => void;
  addActivity: (data: Omit<ActivityEntry, 'id' | 'date'>) => void;
  updateActivity: (id: string, data: Omit<ActivityEntry, 'id' | 'date'>) => void;
  deleteActivity: (id: string) => void;
  addBooking: (data: Omit<BookingEntry, 'id' | 'date' | 'status'>) => void;
  updateBooking: (id: string, data: Omit<BookingEntry, 'id' | 'date' | 'status'>) => void;
  deleteBooking: (id: string) => void;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      selectedProject: '',
      activities: [],
      bookings: [],

      setSelectedProject: (proj) => set({ selectedProject: proj }),

      addActivity: (data) => set(state => ({
        activities: [{ ...data, id: `a${Date.now()}`, date: new Date().toISOString() }, ...state.activities]
      })),
      updateActivity: (id, data) => set(state => ({
        activities: state.activities.map(a => a.id === id ? { ...a, ...data } : a)
      })),
      deleteActivity: (id) => set(state => ({
        activities: state.activities.filter(a => a.id !== id)
      })),

      addBooking: (data) => set(state => ({
        bookings: [{ ...data, id: `b${Date.now()}`, date: new Date().toISOString(), status: 'PENDING' as const }, ...state.bookings]
      })),
      updateBooking: (id, data) => set(state => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, ...data } : b)
      })),
      deleteBooking: (id) => set(state => ({
        bookings: state.bookings.filter(b => b.id !== id)
      })),
      approveBooking: (id) => set(state => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'APPROVED' as const } : b)
      })),
      rejectBooking: (id) => set(state => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'REJECTED' as const } : b)
      })),
    }),
    {
      name: 'sgroup-sales-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        activities: state.activities,
        bookings: state.bookings,
      }),
    }
  )
);
