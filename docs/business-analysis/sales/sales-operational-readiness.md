# Sales Module — Báo Cáo Sẵn Sàng Vận Hành

> Rà soát toàn diện ngày 13/03/2026 — **TypeScript: 0 errors ✅**

---

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG (Cần sửa trước khi vận hành)

### 1. `apiClient` trả về AxiosResponse, không phải `.data`
**File:** [apiClient.ts](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/core/api/apiClient.ts#L34-L35)

```typescript
// Response interceptor hiện tại:
apiClient.interceptors.response.use(
  (response) => response,  // ⚠️ Trả response OBJECT, không phải response.data
```

**Hệ quả:** Tất cả hooks (useInventoryData, useBookings, useDeposits) `apiClient.get(...)` nhận về `{ data, status, headers }` thay vì mảng dữ liệu. `Array.isArray(rawProducts)` sẽ luôn = `false` → hiển thị empty list.

**Fix:**
```diff
- (response) => response,
+ (response) => response.data,
```

---

### 2. Backend endpoints Booking/Deposit có thể chưa tồn tại

**Files:** [useBookings.ts](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/features/sales/hooks/useBookings.ts), [useDeposits.ts](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/features/sales/hooks/useDeposits.ts)

API calls tới `/sales-ops/bookings` và `/sales-ops/deposits` — kiểm tra backend có controller cho 2 endpoint này chưa? Nếu chưa → 404 → data rỗng (có try-catch fallback, nhưng mutation sẽ thất bại silently).

> [!IMPORTANT]
> Kiểm tra backend `sales-ops.controller.ts` có routes: `GET/POST /bookings`, `PATCH/DELETE /bookings/:id`, `POST /bookings/:id/approve|reject`

---

### 3. `DepositManagement` gọi `addTransaction()` — deprecated stub

**File:** [DepositManagement.tsx](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/features/sales/screens/DepositManagement.tsx#L70)

`addTransaction` chỉ log `console.warn(...)` → tạo cọc mới **không lưu gì cả**. Hook `createDepositMut` đã import nhưng chưa được gọi trong `handleSubmit`.

---

## 🟡 VẤN ĐỀ TRUNG BÌNH

### 4. `SALES_DEAL_RECORDING` — route có nhưng sidebar không có

**Shell:** [SalesShell.tsx](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/features/sales/SalesShell.tsx) — `SALES_DEAL_RECORDING: DealRecording` ✅  
**Sidebar:** [SalesSidebar.tsx](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/features/sales/SalesSidebar.tsx) — ❌ Không có entry

→ User không thể navigate tới DealRecording.

---

### 5. `useBookingFilter` + `useDepositFilter` đọc từ Zustand store

**Files:** [useBookingFilter.ts](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/features/sales/hooks/useBookingFilter.ts#L7), useDepositFilter.ts

```typescript
const bookings = useSalesStore(s => s.bookings);  // Zustand chỉ lưu local
```

Dual-write ghi cả Zustand + API, nhưng **đọc chỉ từ Zustand** → data sẽ mất khi reload trang (Zustand không persist bookings array đúng cách nếu AsyncStorage không set up).

---

### 6. `availableProjects` hardcoded 6 dự án

**File:** [useSalesStore.ts](file:///d:/SGROUP%20ERP%20FULL/SGROUP-ERP-UNIVERSAL/src/features/sales/store/useSalesStore.ts#L138-L145)

```typescript
availableProjects: [
  { name: 'Vinhomes Ocean Park', status: 'OPEN' },
  { name: 'Vinhomes Smart City', status: 'OPEN' },
  ...
]
```

Booking/Deposit form chỉ cho chọn 6 project hardcoded này. Nên fetch từ `useGetProjects` API.

---

## 🟢 VẤN ĐỀ NHẸ (Chấp nhận được cho MVP)

### 7. Payroll tiền lương vẫn hardcoded
Lương cơ bản 12tr, hoa hồng 8.5tr... static. OK cho demo, nhưng cần HR Payroll API cho production.

### 8. Training courses hardcoded
Danh sách 6 khóa đào tạo tĩnh. Cần API khi có LMS.

### 9. ProjectDocs tài liệu mẫu tĩnh
OK cho demo. Production cần file storage backend.

---

## ✅ ĐÃ ỔN ĐỊNH

| Screen | Status |
|---|---|
| Dashboard, KPI | ✅ Real API |
| CustomerLeads | ✅ Real API |
| ActivityLog | ✅ Real API |
| Appointments | ✅ Real API |
| DealTracker | ✅ Real API |
| TeamManagement | ✅ Real API |
| StaffManagement | ✅ Real API |
| ProjectCatalog | ✅ Real API |
| PlanVsActual | ✅ Real API |
| CommissionCalc | ✅ Real API |
| EmployeeProfile | ✅ Real API |
| LoanCalculator | ✅ Client-side (đúng) |
| TargetAllocation | ✅ Real API (NEW) |
| TeamReport | ✅ Real API (NEW) |
| Timekeeping | ✅ User-aware |
| Payroll | ✅ User-aware |
| Training | ✅ User-aware |

---

## ĐỀ XUẤT SỬA THEO THỨ TỰ ƯU TIÊN

1. **Fix `apiClient` response interceptor** → trả `.data` thay vì raw response
2. **Kiểm tra backend bookings/deposits endpoints** → tạo nếu chưa có
3. **Wire `createDepositMut.mutate()` vào handleSubmit** trong DepositManagement
4. **Thêm `SALES_DEAL_RECORDING` vào SalesSidebar**
5. **Đổi `availableProjects` từ hardcode → `useGetProjects` API**
6. **Đổi `useBookingFilter` đọc từ API thay vì Zustand**
