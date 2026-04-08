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

export type PropertyUnit = {
  id: string;
  code: string;
  floor: number;
  block: string;
  project: string;
  area: number;
  price: number;
  status: UnitStatus;
  direction: string;
  bedrooms: number;
  bookedBy?: string;
  lockedUntil?: Date;
  customerPhone?: string;
};

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

  // @deprecated — backward compat for screens not yet migrated to API hooks
  units: any[];
  transactions: TransactionEntry[];
  availableProjects: { name: string; status: 'OPEN' | 'CLOSED' }[];

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

  // @deprecated — compat stubs
  lockUnit: (unitId: string, customerName: string) => void;
  requestDeposit: (unitId: string, customerName: string, customerPhone: string) => void;
  approveDeposit: (unitId: string) => void;
  cancelDeposit: (unitId: string) => void;
  addTransaction: (data: Omit<TransactionEntry, 'id' | 'date'>) => void;
  updateTransaction: (id: string, data: Partial<Omit<TransactionEntry, 'id' | 'date'>>) => void;
  deleteTransaction: (id: string) => void;
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  addProject: (name: string) => void;
  removeProject: (name: string) => void;
  toggleProjectStatus: (name: string) => void;
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

      // @deprecated — backward compat stubs (use API hooks instead)
      units: [],
      transactions: [],
      availableProjects: [],
      lockUnit: () => console.warn('[useSalesStore] lockUnit deprecated — use useProducts().lockUnit'),
      requestDeposit: () => console.warn('[useSalesStore] requestDeposit deprecated — use useProducts().requestDeposit'),
      approveDeposit: () => console.warn('[useSalesStore] approveDeposit deprecated — use useProducts().approveDeposit'),
      cancelDeposit: () => console.warn('[useSalesStore] cancelDeposit deprecated — use useProducts().cancelBooking'),
      addTransaction: () => console.warn('[useSalesStore] addTransaction deprecated'),
      updateTransaction: () => console.warn('[useSalesStore] updateTransaction deprecated'),
      deleteTransaction: () => console.warn('[useSalesStore] deleteTransaction deprecated'),
      approveTransaction: () => console.warn('[useSalesStore] approveTransaction deprecated'),
      rejectTransaction: () => console.warn('[useSalesStore] rejectTransaction deprecated'),
      addProject: (name) => set(state => ({
        availableProjects: [...state.availableProjects, { name, status: 'OPEN' as const }]
      })),
      removeProject: (name) => set(state => ({
        availableProjects: state.availableProjects.filter(p => p.name !== name)
      })),
      toggleProjectStatus: (name) => set(state => ({
        availableProjects: state.availableProjects.map(p =>
          p.name === name ? { ...p, status: p.status === 'OPEN' ? 'CLOSED' as const : 'OPEN' as const } : p
        )
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
