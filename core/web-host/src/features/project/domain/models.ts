export interface DimProject {
  id: string;
  projectCode: string;
  name: string;
  developer: string | null;
  location: string | null;
  type: string | null; // "Chung cư", "Biệt thự", "Shophouse"
  feeRate: number; // %
  avgPrice: number; // Tỷ
  totalUnits: number;
  soldUnits: number;
  status: string; // ACTIVE, PAUSED, CLOSED
  startDate: string | null;
  endDate: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyProduct {
  id: string;
  projectId: string;
  projectName: string | null;
  code: string;
  block: string | null;
  floor: number;
  area: number;
  price: number; // Tỷ VND
  direction: string | null;
  bedrooms: number;
  status: string; // AVAILABLE, BOOKED, LOCKED, PENDING_DEPOSIT, DEPOSIT, SOLD, COMPLETED
  bookedBy: string | null;
  lockedUntil: string | null;
  customerPhone: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
