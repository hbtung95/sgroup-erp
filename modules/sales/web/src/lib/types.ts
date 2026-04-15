export type SalesProject = {
  id: string;
  name: string;
  location?: string;
  feeRate?: number;
};

export type InventoryProduct = {
  id: string;
  projectId: string;
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  status: "AVAILABLE" | "LOCKED" | "SOLD" | "DEPOSIT";
};

export type TxStatus = "PENDING_LOCK" | "LOCKED" | "DEPOSIT" | "SOLD" | "CANCELLED" | "REJECTED";

export type Transaction = {
  id: string;
  productId: string;
  productCode?: string;
  salesStaffId: string;
  salesStaffName?: string;
  status: TxStatus;
  priceAtLock: number;
};
