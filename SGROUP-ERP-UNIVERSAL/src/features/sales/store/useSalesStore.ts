import { create } from 'zustand';

// --- INVENTORY TYPES ---
export type UnitStatus = 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'PENDING_DEPOSIT' | 'DEPOSIT' | 'SOLD' | 'WAITING_CONTRACT' | 'COMPLETED';

export type PropertyUnit = {
  id: string;
  code: string;
  floor: number;
  block: string;
  project: string;
  area: number;
  price: number; // in Tỷ VND
  status: UnitStatus;
  direction: string;
  bedrooms: number;
  bookedBy?: string; // Tên Sales hoặc Khách
  lockedUntil?: Date; // Dùng cho trạng thái BOOKED đếm ngược
  customerPhone?: string; // Dùng cho quá trình cọc
};

// --- SALES/DEAL TYPES ---
export type ActivityEntry = {
  id: string;
  date: string;
  postsCount: number;
  callsCount: number;
  newLeads: number;
  meetingsMade: number;
};

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  transactionValue: number; // in Tỷ VND
  status: UnitStatus;
  notes?: string;
};

// --- MOCK INITIAL DATA ---
const MOCK_INVENTORY: PropertyUnit[] = [];
const blocks = ['S4.01', 'S4.02'];
const directions = ['Đông Nam', 'Tây Bắc', 'Đông Bắc', 'Tây Nam'];

blocks.forEach(block => {
  for (let floor = 2; floor <= 12; floor++) {
    for (let pos = 1; pos <= 6; pos++) {
      const isCorner = pos === 1 || pos === 6;
      let status: UnitStatus = 'AVAILABLE';
      
      const rand = Math.random();
      if (rand > 0.85) status = 'COMPLETED';
      else if (rand > 0.75) status = 'DEPOSIT';
      else if (rand > 0.65) status = 'BOOKED';
      else if (rand > 0.60) status = 'LOCKED';

      MOCK_INVENTORY.push({
        id: `${block}-${floor}${(pos < 10 ? '0' : '')}${pos}`,
        code: `${block}-${floor}${(pos < 10 ? '0' : '')}${pos}`,
        floor,
        block,
        project: 'Vinhomes Smart City',
        area: isCorner ? 85 : Math.floor(Math.random() * 30 + 45),
        price: Number((Math.random() * 3 + 2).toFixed(2)),
        status,
        direction: directions[Math.floor(Math.random() * directions.length)],
        bedrooms: isCorner ? 3 : (Math.random() > 0.5 ? 2 : 1),
        ...(status === 'BOOKED' ? { 
          bookedBy: 'Sale: Trần A', 
          lockedUntil: new Date(Date.now() + Math.random() * 1800000) 
        } : {})
      });
    }
  }
});

const INITIAL_ACTIVITIES: ActivityEntry[] = [
  { id: 'a1', date: new Date().toISOString(), postsCount: 2, callsCount: 45, newLeads: 12, meetingsMade: 3 },
];

const INITIAL_BOOKINGS: BookingEntry[] = [
  { id: 'b1', date: new Date().toISOString(), project: 'Vinhomes Ocean Park', customerName: 'Nguyễn Văn A', customerPhone: '0901234567', bookingAmount: 50000000, bookingCount: 2, status: 'APPROVED' },
  { id: 'b2', date: new Date(Date.now() - 86400000).toISOString(), project: 'Vinhomes Smart City', customerName: 'Trần Thị B', customerPhone: '0912345678', bookingAmount: 100000000, bookingCount: 5, status: 'APPROVED' },
  { id: 'b3', date: new Date(Date.now() - 86400000).toISOString(), project: 'Masteri Waterfront', customerName: 'Lê Văn C', customerPhone: '0923456789', bookingAmount: 50000000, bookingCount: 1, status: 'PENDING' },
  { id: 'b4', date: new Date(Date.now() - 2 * 86400000).toISOString(), project: 'Vinhomes Ocean Park', customerName: 'Phạm Minh D', customerPhone: '0934567890', bookingAmount: 150000000, bookingCount: 3, status: 'APPROVED' },
  { id: 'b5', date: new Date(Date.now() - 3 * 86400000).toISOString(), project: 'Vinhomes Smart City', customerName: 'Hoàng Thị E', customerPhone: '0945678901', bookingAmount: 100000000, bookingCount: 2, status: 'REJECTED' },
  { id: 'b6', date: new Date(Date.now() - 4 * 86400000).toISOString(), project: 'Masteri Waterfront', customerName: 'Đỗ Quang F', customerPhone: '0956789012', bookingAmount: 200000000, bookingCount: 4, status: 'APPROVED' },
  { id: 'b7', date: new Date(Date.now() - 5 * 86400000).toISOString(), project: 'Vinhomes Ocean Park', customerName: 'Vũ Thị G', customerPhone: '0967890123', bookingAmount: 50000000, bookingCount: 1, status: 'APPROVED' },
];

const INITIAL_TRANSACTIONS: TransactionEntry[] = [
  { id: 't1', date: new Date().toISOString(), project: 'Masteri Waterfront', unitCode: 'M2-1205', customerName: 'Lê Thị B', customerPhone: '0987654321', transactionValue: 4.5, status: 'WAITING_CONTRACT', notes: 'Chờ ký HĐMB' },
  { id: 't2', date: new Date().toISOString(), project: 'Vinhomes Smart City', unitCode: 'S4-0812', customerName: 'Trần Văn C', customerPhone: '0912345678', transactionValue: 3.2, status: 'COMPLETED', notes: 'Đã hoàn tất thủ tục' },
  { id: 't3', date: new Date().toISOString(), project: 'Vinhomes Ocean Park', unitCode: 'O2-0511', customerName: 'Nguyễn Văn D', customerPhone: '0900000000', transactionValue: 2.1, status: 'PENDING_DEPOSIT', notes: 'Mới tạo cọc' },
  { id: 't4', date: new Date().toISOString(), project: 'Vinhomes Smart City', unitCode: 'S4-1005', customerName: 'Hoàng Thị E', customerPhone: '0911111111', transactionValue: 2.8, status: 'DEPOSIT', notes: 'Đã chuyển khoản thành công' },
];

// --- ZUSTAND STORE ---
interface SalesState {
  // Inventory
  selectedProject: string;
  units: PropertyUnit[];
  
  // Deals & Activities
  activities: ActivityEntry[];
  bookings: BookingEntry[];
  transactions: TransactionEntry[];

  // Admin-configured projects (accepting bookings)
  availableProjects: { name: string; status: 'OPEN' | 'CLOSED' }[];

  // Actions
  setSelectedProject: (proj: string) => void;
  lockUnit: (unitId: string, customerName: string) => void;
  requestDeposit: (unitId: string, customerName: string, customerPhone: string) => void;
  approveDeposit: (unitId: string) => void;
  cancelDeposit: (unitId: string) => void;
  addActivity: (data: Omit<ActivityEntry, 'id' | 'date'>) => void;
  updateActivity: (id: string, data: Omit<ActivityEntry, 'id' | 'date'>) => void;
  deleteActivity: (id: string) => void;
  addBooking: (data: Omit<BookingEntry, 'id' | 'date' | 'status'>) => void;
  updateBooking: (id: string, data: Omit<BookingEntry, 'id' | 'date' | 'status'>) => void;
  deleteBooking: (id: string) => void;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  addTransaction: (data: Omit<TransactionEntry, 'id' | 'date'>) => void;
  addProject: (name: string) => void;
  removeProject: (name: string) => void;
  toggleProjectStatus: (name: string) => void;
  
  // Transaction direct actions
  updateTransaction: (id: string, data: Partial<Omit<TransactionEntry, 'id' | 'date'>>) => void;
  deleteTransaction: (id: string) => void;
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  selectedProject: 'Vinhomes Smart City',
  units: MOCK_INVENTORY,
  activities: INITIAL_ACTIVITIES,
  bookings: INITIAL_BOOKINGS,
  transactions: INITIAL_TRANSACTIONS,
  availableProjects: [
    { name: 'Vinhomes Ocean Park', status: 'OPEN' },
    { name: 'Vinhomes Smart City', status: 'OPEN' },
    { name: 'Masteri Waterfront', status: 'OPEN' },
    { name: 'Grand Park', status: 'OPEN' },
    { name: 'The Origami', status: 'OPEN' },
    { name: 'Ecopark', status: 'OPEN' },
    { name: 'Sun Grand City', status: 'CLOSED' },
    { name: 'Vinhomes Central Park', status: 'OPEN' },
    { name: 'The Beverly Solari', status: 'OPEN' },
  ],

  setSelectedProject: (proj) => set({ selectedProject: proj }),
  
  lockUnit: (unitId, customerName) => {
    set(state => ({
      units: state.units.map(u => 
        u.id === unitId 
          ? { ...u, status: 'BOOKED', bookedBy: customerName, lockedUntil: new Date(Date.now() + 30 * 60 * 1000) } 
          : u
      )
    }));
  },

  // Sales requests deposit -> unit moves to PENDING_DEPOSIT and transaction is added with PENDING_DEPOSIT status
  requestDeposit: (unitId, customerName, customerPhone) => {
    set(state => {
      const unit = state.units.find(u => u.id === unitId);
      if (!unit) return state;

      const newTransaction: TransactionEntry = {
        id: `t${Date.now()}`,
        date: new Date().toISOString(),
        project: unit.project,
        unitCode: unit.code,
        customerName,
        customerPhone,
        transactionValue: unit.price,
        status: 'PENDING_DEPOSIT',
        notes: 'Chờ Kế Toán Duyệt Cọc'
      };

      return {
        units: state.units.map(u => 
          u.id === unitId 
            ? { ...u, status: 'PENDING_DEPOSIT', bookedBy: customerName, customerPhone } 
            : u
        ),
        transactions: [newTransaction, ...state.transactions]
      };
    });
  },

  // Admin approves deposit -> unit moves to DEPOSIT and transaction updates
  approveDeposit: (unitId) => {
    set(state => {
      const unit = state.units.find(u => u.id === unitId);
      if (!unit) return state;

      return {
        units: state.units.map(u => u.id === unitId ? { ...u, status: 'DEPOSIT' } : u),
        transactions: state.transactions.map(t => 
          t.unitCode === unit.code && t.status === 'PENDING_DEPOSIT' 
            ? { ...t, status: 'DEPOSIT', notes: 'Đã Nhận Cọc' } 
            : t
        )
      };
    });
  },

  // Cancel pending deposit or lock
  cancelDeposit: (unitId) => {
    set(state => {
      const unit = state.units.find(u => u.id === unitId);
      if (!unit) return state;

      return {
        units: state.units.map(u => 
          u.id === unitId 
            ? { ...u, status: 'AVAILABLE', bookedBy: undefined, customerPhone: undefined, lockedUntil: undefined } 
            : u
        ),
        transactions: state.transactions.map(t => 
          t.unitCode === unit.code && t.status === 'PENDING_DEPOSIT' 
            ? { ...t, status: 'AVAILABLE', notes: 'Bị hủy do không nhận được cọc' } // Mark as canceled or remove
            : t
        )
      };
    });
  },

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

  addTransaction: (data) => set(state => ({ 
    transactions: [{ ...data, id: `t${Date.now()}`, date: new Date().toISOString() }, ...state.transactions] 
  })),

  updateTransaction: (id, data) => set(state => ({
    transactions: state.transactions.map(t => t.id === id ? { ...t, ...data } : t)
  })),

  deleteTransaction: (id) => set(state => ({
    transactions: state.transactions.filter(t => t.id !== id)
  })),

  approveTransaction: (id) => set(state => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return state;
    
    // Also try to update the unit status if it exists in inventory
    const unit = state.units.find(u => u.code === tx.unitCode);
    const newUnits = unit 
      ? state.units.map(u => u.id === unit.id ? { ...u, status: 'DEPOSIT' as const } : u)
      : state.units;

    return {
      units: newUnits,
      transactions: state.transactions.map(t => t.id === id ? { ...t, status: 'DEPOSIT' as const, notes: 'Đã Nhận Cọc' } : t)
    };
  }),

  rejectTransaction: (id) => set(state => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return state;

    // Also try to free up the unit if it exists
    const unit = state.units.find(u => u.code === tx.unitCode);
    const newUnits = unit
      ? state.units.map(u => u.id === unit.id ? { ...u, status: 'AVAILABLE' as const, bookedBy: undefined, customerPhone: undefined, lockedUntil: undefined } : u)
      : state.units;

    return {
      units: newUnits,
      transactions: state.transactions.map(t => t.id === id ? { ...t, status: 'AVAILABLE' as const, notes: 'Từ chối cọc' } : t)
    };
  }),

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
}));
