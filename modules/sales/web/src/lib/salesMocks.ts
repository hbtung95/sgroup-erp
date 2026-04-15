// MOCK DATA CHO MODULE BÁN HÀNG
// Chứa toàn bộ logic Fake API và in-memory data
import type { SalesProject, InventoryProduct, Transaction, TxStatus } from "./types";

export const MOCK_PROJECTS: SalesProject[] = [
  { id: "proj-1", name: "Vinhomes Grand Park", location: "Quận 9, TP. Thủ Đức", feeRate: 3.5 },
  { id: "proj-2", name: "Aqua City", location: "Biên Hòa, Đồng Nai", feeRate: 4.0 },
  { id: "proj-3", name: "Masteri Centre Point", location: "Quận 9, TP. Thủ Đức", feeRate: 4.5 },
  { id: "proj-4", name: "The Global City", location: "An Phú, TP. Thủ Đức", feeRate: 3.0 },
];

export const MOCK_PRODUCTS: InventoryProduct[] = [
  // Vinhomes Grand Park (proj-1)
  { id: "prd-1", projectId: "proj-1", code: "VHO-S1.01-05", block: "S1.01", floor: 5, area: 45.5, price: 3.25, status: "AVAILABLE" },
  { id: "prd-2", projectId: "proj-1", code: "VHO-S2.05-12A", block: "S2.05", floor: 12, area: 68.0, price: 4.10, status: "AVAILABLE" },
  { id: "prd-3", projectId: "proj-1", code: "VHO-S1.02-15", block: "S1.02", floor: 15, area: 55.4, price: 2.85, status: "LOCKED" },
  { id: "prd-4", projectId: "proj-1", code: "VHO-S3.01-20", block: "S3.01", floor: 20, area: 88.0, price: 5.50, status: "LOCKED" },
  { id: "prd-5", projectId: "proj-1", code: "VHO-S1.01-08", block: "S1.01", floor: 8, area: 45.5, price: 2.95, status: "DEPOSIT" },
  { id: "prd-6", projectId: "proj-1", code: "VHO-S1.05-22", block: "S1.05", floor: 22, area: 72.0, price: 3.80, status: "SOLD" },
  { id: "prd-7", projectId: "proj-1", code: "VHO-S6.01-10", block: "S6.01", floor: 10, area: 47.0, price: 3.30, status: "AVAILABLE" },
  { id: "prd-8", projectId: "proj-1", code: "VHO-S6.02-30", block: "S6.02", floor: 30, area: 90.0, price: 6.00, status: "AVAILABLE" },
  { id: "prd-9", projectId: "proj-1", code: "VHO-S6.03-05", block: "S6.03", floor: 5, area: 110.0, price: 8.50, status: "AVAILABLE" },

  // Aqua City (proj-2)
  { id: "prd-10", projectId: "proj-2", code: "AQC-SV-01", block: "Sun Harbor", floor: 1, area: 120.0, price: 15.50, status: "AVAILABLE" },
  { id: "prd-11", projectId: "proj-2", code: "AQC-SV-15", block: "Sun Harbor", floor: 1, area: 160.0, price: 18.20, status: "AVAILABLE" },
  { id: "prd-12", projectId: "proj-2", code: "AQC-EP-08", block: "Ever Green", floor: 1, area: 110.0, price: 12.00, status: "AVAILABLE" },
  { id: "prd-13", projectId: "proj-2", code: "AQC-EP-19", block: "Ever Green", floor: 1, area: 140.0, price: 14.50, status: "LOCKED" },
  { id: "prd-14", projectId: "proj-2", code: "AQC-RV-05", block: "River Park", floor: 1, area: 200.0, price: 25.00, status: "AVAILABLE" },

  // Masteri Centre Point (proj-3)
  { id: "prd-15", projectId: "proj-3", code: "MCP-T1-05", block: "T1", floor: 5, area: 52.0, price: 3.50, status: "AVAILABLE" },
  { id: "prd-16", projectId: "proj-3", code: "MCP-T1-12", block: "T1", floor: 12, area: 74.0, price: 4.80, status: "AVAILABLE" },
  { id: "prd-17", projectId: "proj-3", code: "MCP-T2-18", block: "T2", floor: 18, area: 95.0, price: 6.20, status: "AVAILABLE" },
  { id: "prd-18", projectId: "proj-3", code: "MCP-T3-25", block: "T3", floor: 25, area: 105.0, price: 7.50, status: "AVAILABLE" },

  // The Global City (proj-4)
  { id: "prd-19", projectId: "proj-4", code: "TGC-SOHO-01", block: "SOHO", floor: 1, area: 95.0, price: 35.00, status: "AVAILABLE" },
  { id: "prd-20", projectId: "proj-4", code: "TGC-SOHO-10", block: "SOHO", floor: 1, area: 133.0, price: 42.00, status: "AVAILABLE" },
];

// Dữ liệu Nhân Sự Kinh Doanh (Đồng bộ với HR Module)
export const HR_SALES_STAFF = {
    id: "SGR-003",
    name: "Trần Minh Khôi",
    pos: "Chuyên viên Kinh Doanh"
};

// Khởi tạo các Transaction hiện có
export let MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", productId: "prd-1", productCode: "VHO-S1.01-05", salesStaffId: "SGR-004", salesStaffName: "Lê Thị Hồng Nhung", status: "PENDING_LOCK", priceAtLock: 3.25 },
  { id: "tx-2", productId: "prd-2", productCode: "VHO-S2.05-12A", salesStaffId: "SGR-003", salesStaffName: "Trần Minh Khôi", status: "PENDING_LOCK", priceAtLock: 4.10 },
  { id: "tx-3", productId: "prd-3", productCode: "VHO-S1.02-15", salesStaffId: "SGR-003", salesStaffName: "Trần Minh Khôi", status: "LOCKED", priceAtLock: 2.85 },
  { id: "tx-4", productId: "prd-4", productCode: "VHO-S3.01-20", salesStaffId: "SGR-004", salesStaffName: "Lê Thị Hồng Nhung", status: "LOCKED", priceAtLock: 5.50 },
  { id: "tx-5", productId: "prd-5", productCode: "VHO-S1.01-08", salesStaffId: "SGR-003", salesStaffName: "Trần Minh Khôi", status: "DEPOSIT", priceAtLock: 2.95 },
  { id: "tx-6", productId: "prd-6", productCode: "VHO-S1.05-22", salesStaffId: "SGR-003", salesStaffName: "Trần Minh Khôi", status: "SOLD", priceAtLock: 3.80 },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function requestLock(product: InventoryProduct) {
   await delay(500);
   const tx: Transaction = {
       id: `tx-${Date.now()}`,
       productId: product.id,
       productCode: product.code,
       salesStaffId: HR_SALES_STAFF.id,
       salesStaffName: HR_SALES_STAFF.name,
       status: "PENDING_LOCK",
       priceAtLock: product.price
   };
   
   // Thay đổi trạng thái product trên kho chung sang PENDING_LOCK (mô phỏng)
   const prodIndex = MOCK_PRODUCTS.findIndex(p => p.id === product.id);
   if (prodIndex > -1) {
       MOCK_PRODUCTS[prodIndex].status = "LOCKED"; 
   }

   MOCK_TRANSACTIONS.unshift(tx);
   return tx;
}

export async function updateTxStatus(id: string, status: TxStatus) {
   await delay(300);
   const idx = MOCK_TRANSACTIONS.findIndex(tx => tx.id === id);
   if (idx > -1) {
       MOCK_TRANSACTIONS[idx].status = status;
       
       // Sync back to products
       const prodIdx = MOCK_PRODUCTS.findIndex(p => p.id === MOCK_TRANSACTIONS[idx].productId);
       if (prodIdx > -1) {
          if (status === 'REJECTED' || status === 'CANCELLED') MOCK_PRODUCTS[prodIdx].status = 'AVAILABLE';
          else if (status === 'SOLD') MOCK_PRODUCTS[prodIdx].status = 'SOLD';
          else if (status === 'DEPOSIT') MOCK_PRODUCTS[prodIdx].status = 'DEPOSIT';
       }
   }
}
