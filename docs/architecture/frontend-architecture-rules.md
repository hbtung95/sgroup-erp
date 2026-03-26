# Kiến Trúc Frontend và Bộ Quy Tắc (Frontend Architecture & Rules)

Tài liệu này định nghĩa kiến trúc lõi và các quy tắc lập trình bắt buộc cho toàn bộ dự án Frontend SGROUP ERP (React Native / Expo Universal). Mục tiêu của bộ quy tắc này là duy trì một Codebase sạch (Clean Code), dễ bảo trì, dễ mở rộng và triệt tiêu các lỗi crash ngầm (silent crashes).

---

## 1. Công Nghệ Lõi (Tech Stack)

Frontend SGROUP ERP được vận hành trên hệ sinh thái hiện đại:
- **Core Unit:** React Native 0.83 + Expo SDK 55 (Universal: iOS/Android/Web).
- **Navigation:** React Navigation v7 (Native-stack + Bottom-tabs).
- **State Management:** Zustand v5 (Global state) & TanStack React Query v5 (Server state).
- **Network:** Axios.
- **Styling & UI:** React Native StyleSheet thuần + Bộ SGDS (Xem `ui-architecture-rules.md`).
- **Performance:** React Native Reanimated v4.

---

## 2. Kiến Trúc Tổng Thể: Feature-Sliced Design (FSD)

Dự án không tổ chức code theo kiểu phân chia UI, logic, helpers rải rác. Chúng ta sử dụng **Feature-Sliced Design kết hợp Clean Architecture** để chia để trị:

```
src/
├── core/           # Cấu hình App-level (Providers, Root Navigation, Env)
├── shared/         # Các thành phần tái sử dụng toàn cục (SGComponents, Utils chung)
├── system/         # Cấu hình hệ thống sâu (Themes, Locale, Crash Analytics)
└── features/       # Phân hệ chức năng chính (Module nghiệp vụ)
    ├── auth/
    ├── sales/
    └── project/    # Mỗi Feature là một pháo đài độc lập (Tách biệt Clean Architecture)
```

---

## 3. Clean Architecture Bám Rễ Trong Từng Feature

Mọi `feature` lớn (như `sales`, `project`) đều bắt buộc tổ chức nội tại theo 4 Lớp (Layers) của Clean Architecture:

1. **`domain/` (Cốt Lõi Nghiệp Vụ):** 
   - Chứa các Models, Entities, Types và Pure Logic. Không dính dáng đến React hay API.
2. **`application/` (Điều Phối):** 
   - Chứa Hooks (`useCase`), Zustand Stores, React Query Hooks. Quản lý trạng thái và ra lệnh cho lớp Infrastructure lấy dữ liệu.
3. **`infrastructure/` (Hạ Tầng):** 
   - Nơi duy nhất được gọi Axios (API calls). 
   - **Tối quan trọng:** Phải chứa các hàm Mapping/DTO để chuyển đổi format (Rác) từ Backend sang chuẩn Domain Model sạch sẽ cho Frontend.
4. **`presentation/` (Giao Diện):** 
   - Chứa các Smart/Dumb UI Components và Screens (Màn hình). 
   - UI **TUYỆT ĐỐI KHÔNG** chứa logic nghiệp vụ thuần hay cấu hình gọi API.

---

## 4. Quản Lý Trạng Thái (State Management Policy)

Ranh giới quản lý State (Trạng thái) phải rõ ràng:
* **Server State (TanStack React Query v5):** BẮT BUỘC dùng để gọi mọi API GET/POST. Cung cấp mặc định Caching, Polling, Auto-retry và loading/error states. Cấm dùng `fetch` hay `axios` thả rông ném vào `useEffect`.
* **Global Client State (Zustand v5):** Dùng để lưu trữ trạng thái người dùng (Session, Role), cài đặt giao diện (Theme Dark/Light), hoặc các luồng tương tác đa màn hình. Cấm ném Data API vào Zustand trừ khi cần Offline Queue.
* **Component Local State (`useState`):** Chỉ lưu trạng thái giao diện nội bộ (Đang gõ gì vào Input, Mở/Đóng Dropdown).

---

## 5. Phòng Vệ Dữ Liệu (Defensive Data Handling)

Hơn 80% lỗi Crash màn hình trắng của Frontend xuất phát từ việc tin tưởng tuyệt đối vào Format dữ liệu API. **Quy tắc phòng vệ là BẮT BUỘC:**

### 5.1. Ép Kiểu & Bình Thường Hóa Dữ Liệu mảng
API đôi lúc trả về `data: [...]`, lúc thì `{ data: [...] }`. Không được `.map()` mù quáng.
```tsx
// ✅ ĐÚNG: Bình thường hóa an toàn
const rawData = response.data;
const safeItems = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

// ❌ SAI: Crash "items.map is not a function" nếu API đổi cấu trúc
const items = response.data;
items.map(item => <View />);
```

### 5.2. Chặn Lỗi Rỗng Bằng Optional Chaining & Nullish Coalescing
```tsx
// ✅ ĐÚNG: Cung cấp Fallback ngay lập tức
const teamName = staff?.team?.name ?? 'Chưa rước đội';
const amount = deal?.amount?.toLocaleString() ?? '0';

// ❌ SAI: "Cannot read property 'name' of undefined"
const teamName = staff.team.name;
```

---

## 6. Định Danh Quy Chuẩn (Naming Conventions)

* **Components & Screens:** `PascalCase.tsx` (`ProjectDashboard.tsx`).
* **Hooks & UseCases:** `useCamelCase.ts` (`useSalesFunnel.ts`).
* **Global Stores (Zustand):** Tiền tố `use` + Hậu tố `Store.ts` (`useAuthStore.ts`).
* **Types / Utils:** `camelCase.ts` (`projectTypes.ts`, `formatDate.ts`).
* **UUID generation:** Bắt buộc sử dụng thuật toán **UUID v7** (có tính sequential thời gian, tối ưu cho Database) thay vì v4.

---

## 7. Xử Lý Ranh Giới Lỗi (Error Boundary Pattern)

Để ngăn chặn 1 Widget lỗi đánh sập toàn bộ Ứng Dụng, mỗi Module Feature bắt buộc phải được bọc bởi class `ErrorBoundary`:

```tsx
// Cấu trúc bắt buộc tại Navigation hoặc Root của Module
<ModuleErrorBoundary>
  <SalesDashboardScreen />
</ModuleErrorBoundary>
```
Nếu module `Sales` sập, nó chỉ hiện Màn hình ErrorFallback tại ngách `Sales`, các ngách khác như `Project`, `Admin` vẫn hoạt động độc lập bình thường.

---

## 8. Chiến Lược Network & Bảo Mật (Network & Token Security)

Hệ thống Network (Axios) là cửa ngõ gọi Data, cần được bảo vệ nghiêm ngặt nhất:
* **Lưu Trữ Token Chống Độc Xâm Nhập (Storage Rule):** Token đăng nhập (JWT/Access Token, Refresh Token) **Bắt Buộc** phải lưu trong khoang chứa mã hóa phần cứng của thiết bị (dùng `expo-secure-store`). Tuyệt đối cấm lưu Token ở bộ nhớ dạng clear-text (chữ nổi dễ đọc) như `AsyncStorage` để đề phòng tin tặc XSS/đánh cắp phiên máy.
* **Auto-refresh Token (Sống Sót Cục Bộ):** Lớp Axios phải có interceptor tóm gọn mã lỗi 401. Nếu access token chết hạn, Frontend ngầm tự động (silent refresh) gọi lên Backend xin token mới, và tự xông xáo chạy tiếp các API đang chờ kẹt lại. Chỉ được văng user ra Màn Login nếu cả Refresh Token cũng "chết".
* **Bọc Rác Kỹ Thuật:** API đôi khi sập trả về cấu trúc HTML/JSON rác ghi dòng kỹ thuật (`500 Internal Error Java/Node`). Frontend CẤM ĐƯỢC IN nguyên dòng mã code báo lỗi sượng trân đó lên Toast. Phải Mapping bắt nó sang câu thân thiện: "Hệ thống đang bận, vui lòng chờ xử lý".

---

## 9. Chiến Lược Lưu Trữ Định Tuyến (Caching & Offline-First)

Tối đa hóa tốc độ trải nghiệm ứng dụng bằng cách mượn sức mạnh bộ nhớ cục bộ (Memories Cache):
* **React Query DB Local Persist:** Bắt buộc đồng bộ Cache của React Query xuống bộ nhớ siêu tốc cài cắm tại máy (Sử dụng thư viện C++ `react-native-mmkv` để đọc/ghi tốc ký trong thao tác millisecond thay vì AsyncStorage chậm chạp nghẽn cổ chai). 
* Nhờ vậy, Giám đốc mở App lên là **THẤY DATA CŨ NGAY XUẤT HIỆN TỨC THÌ** (Zero-second load), trong lúc App nhẹ nhàng tự động ngầm kéo Data mới nhất ở rặng API Background đẩy vào sau. Dẹp bỏ hoàn toàn thời gian chết mở App chờ quay Spinning.
* **Dọn Rác Nhớ Cục Bộ (Garbage Collection):** Cấm nhồi nhét file/cấu trúc khổng lồ ngẫu nhiên tống vào LocalStorage. Phải có chiến lược TTL (Time-To-Live hạn sử dụng) ở bộ Cache React Query để nó tự dọn thân dọn rác theo tuần/tháng (chống làm đầy máy điện thoại nhân sự).

---

## 10. Kiến Trúc Điều Hướng (Navigation & Routing Hierarchy)

Hệ thống React Navigation (dạng Stack/Tab xếp lớp) phải phân định rõ thế giới để điện thoại không bị tràn Ram (Bơm đầy Stack rác).
* **Kênh Cách Ly (Flow Separation):** Phân chia sắc lẹm 2 trục hệ đào lộn hột: Hệ `AuthStack` (Chuyên Login, Quên pass) và `AppStack`(Dashboard, Tính năng xài). Khi User bấm Đăng xuất, Frontend phải đập sập hoàn toàn `AppStack` để giải phóng rác RAM về không. (Tuyệt đối Cấm dùng cơ chế Push để đè màn hình Login nổi bóp nghẹt lên trên màn hình Dashboard hiện tại).
* **Kết Nối Sâu (Deep Linking & Push Nav):** Navigation Core Architect phải cấu hình sẵn lộ trình Định Tuyến URL (`path mapping`). Ràng buộc tương lai khi User nhận Thông báo Đẩy (Push Notification: VD "Sếp vừa phân công Dự án ABC"), User gõ nhẹ vào thông báo thì App tự động tháo chạy mở bóc vỏ đi thẳng vào màn hình Chi tiết Dự án thay vì ném user ngập ngừng ở trang Home gốc tốn công tự tìm.

---

## 11. Chiến Lược Kiểm Thử Mã Nguồn (Testing Strategy)

Chúng ta không đốt ngân sách (Overhead) để theo đòn Test 100% dòng lệnh hiển thị Frontend màu khối UI (thể loại hay thay đổi sập sình), mà chơi Test bảo vệ "Trái Tim App":
* **Unit Test Hệ Lõi `domain/` (Cực Kỳ Quan Trọng):** Mọi hàm tính toán tiền vốn sinh sinh, phép tính KPI, chia hoa hồng, tính chiết khấu lãi suất, hàm xác thực format Email/SĐT... rải mầm ở nhánh `domain/` và `utils/` thì **bắt buộc phải có Unit Test (Jest)** dập vào. Vì đó là pure-function, chạy Test mất chỉ vài giây và chống sập vĩnh viễn mọi lỗi Sai Toán Học tai hại nhất App ERP.
* **UI Screen Bỏ Qua (Tin Tưởng Team Nhân Sự QA):** Cho phép bỏ qua công đoạn viết code Test kiểm định rườm rà (như Enzyme/React Testing Lib) để ngó bắt khối Box Giao diện màu đậm màu lợt. Tin tưởng giao thao tác End-to-End này cho bộ phận Tester User Con Người dùng mắt và máy vuốt màn hình.

---

## 12. 7 Quy Tắc "ĐÈN ĐỎ" Frontend Kỷ Luật Máu (Red Flags 🛑)

Bất kỳ Kỹ sư Frontend nào vi phạm móc nối 1 trong 7 tử huyệt sau sẽ lập tức bị Reject Pull Request:

1. **🔴 KHÔNG** bỏ bộ chặn `Array.isArray()` trước khi gọi `.map()`, `.filter()` từ vỏ Data chuỗi API thô trả về.
2. **🔴 KHÔNG** gõ lệnh gọi API mạng (`axios.get`) trần trụi vào thẳng lồng ngực Component Giao diện (Mọi API phải cấu hình gọi gián tiếp qua đường xích tải React Query nằm ở lớp Thư mục Application).
3. **🔴 KHÔNG** gọi lệnh Import trực tiếp từ `node_modules` bên trong màn hình Component View nếu đã có lớp `shared/` Wrapping cấu hình (Ví dụ kho Icon là một ví dụ điển hình phải dùng chung).
4. **🔴 KHÔNG** sử dụng kiểu ngông cuồng type `any` cho các luồng hở dữ liệu Domain chảy nứt trong App. Tất cả Entity phải có Model TypeScript rào chắn rõ ràng.
5. **🔴 KHÔNG** lơ là làm mù handle mã lỗi nhạy cảm 401/403. Mặc định Axios Interceptors bắt buộc đón lõng 401 để tự động xin Token hoặc đẩy lọt Màn Đăng Nhập. Bể hệ thống thả trôi User bấu víu lỗi đứng hình là Vi phạm hạng Nhất.
6. **🔴 KHÔNG** để lại dấu vết hàm rác `console.log()` trên ngách mã Code gõ cho Production.
7. **🔴 KHÔNG** rải bừa Logic Nghiệp vụ hóc búa (Ví dụ cộng trừ thế xuất, tính logic bóc quyền hạng VIP Admin) trộn bùn với Code CSS Giao Diện Component. Nhổ rễ toàn bộ đẩy nó về các function độc lập, Pure-function nằm gọn ghẽ rọ rành ở thư mục `domain/`.

---

## 13. Triết Lý Vận Hành Vô Cấp
Lập trình viên SGROUP ERP không chỉ gắn sức làm cho một Cụm Giao diện cho Đẹp Màu Mắt (UI). Nghề của chúng ta nằm ở việc dựng lên **Cốt cách Nền Tảng Code Base Đóng Băng** (Mã Nguồn Cứng Cựa). 
Một Kỹ Sư tinh nhuệ sẽ Code như thể ngày mai Backend cố tình nhả dữ liệu Null / Undefined lỗi về phá sập Ứng dụng. **Bọc Lõi Sống Còn - Triệt Tiêu White Screen - Gìn Giữ Khung Hình.**
