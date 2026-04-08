# Kế Hoạch Tái Sử Dụng Giao Diện Cũ (Legacy UI Reuse)

Để "tận dụng lại toàn bộ" hơn 70+ components đã được bạn đầu tư xây dựng công phu từ dự án React Native cũ (`SGButton`, `SGCard`, `SGDataGrid`, `SGSidebar`, v.v.) vào kiến trúc Super-App web dùng Vite mới này, giải pháp tốt nhất là **không đập đi viết lại từ đầu bằng HTML/Tailwind**, mà tận dụng sức mạnh của `react-native-web` kết hợp với `NativeWind` ngay trong package lõi `@sgroup/ui`.

## Phương Pháp Tiếp Cận

Thay vì mất thời gian convert từng file `SGX.tsx` sang Tailwind Web (tốn thời gian và dễ gây lỗi UI cũ), chúng ta sẽ mang nguyên bộ lõi React Native cũ (vốn dùng `StyleSheet`) vào thư viện `@sgroup/ui`. 
Các phân hệ Web (Vite) sẽ được cấu hình Alias để khi gọi import từ `react-native`, quá trình build sẽ trỏ thẳng sang `react-native-web`.

> [!TIP]
> **Đây là mô hình rất hiện đại (React Native Web + Vite).** Bạn vừa dùng được lại 100% UI cũ mà vẫn theo đúng thiết kế Monorepo, có thể chạy trên trình duyệt mượt mà.

## Các Thay Đổi Đề Xuất

### 1. Di chuyển mã nguồn vào thư viện chung (`@sgroup/ui`)

Chúng ta sẽ sao chép toàn bộ lõi UI cũ vào thư mục chứa package UI dùng chung:
- [NEW] Thư mục `packages/ui/src/theme`: Chứa `theme.ts`, `themeStore.ts` (Neo-Corporate System).
- [NEW] Thư mục `packages/ui/src/components`: Chứa hơn 70 files `SG*.tsx` (SGButton, SGInput...).
- [NEW] Thư mục `packages/ui/src/utils` và `packages/ui/src/assets` (chứa các helper định dạng formatters và icons).
- [MODIFY] `packages/ui/src/index.ts`: Sẽ `export * from './components'` để các web ứng dụng bên ngoài lấy dễ dàng thông qua `@sgroup/ui`.

### 2. Cài đặt các gói thụ thuộc (Dependencies) cho `packages/ui`

Hệ thống cũ xài rất nhiều plugin của Expo và RN. Đưa lên dùng độc lập cần thiết lập môi trường:
- Cài đặt thêm các gói vào `packages/ui/package.json`: `react-native-web`, `lucide-react-native`, `expo-linear-gradient`, `react-native-svg` và `react-native-reanimated`.
- Điều này đảm bảo Components được dựng lên không báo lỗi Unresolved Dependency.

### 3. Cấu hình Vite (`core/web-host`) để tương thích React Native Web

Vite/Rollup mặc định chỉ hiểu HTML/React DOM, để nó hiển thị UI của React Native, mở rộng khả năng render:
- [MODIFY] `core/web-host/vite.config.ts`:
  - Thêm config cho phép Babel xử lý `react-native-reanimated`.
  - Cấu hình alias đồ thị (chuyển hướng resolver `react-native` -> `react-native-web`).
  - Hỗ trợ biên dịch mở rộng file có đuôi `.web.js` hoặc `.native.js`.

> [!WARNING]
> Mặc dù `react-native-web` hỗ trợ ~90% tính năng của RN, nhưng có thể một vài thư viện ngách như `expo-linear-gradient` cần xử lý cấu hình plugin trong Vite kỹ lưỡng. Tôi sẽ tự viết một alias nhỏ nếu cần để giả lập nó nếu như nó không export sẵn module cho web.

## Câu hỏi Mở

1. Bạn có đồng ý với hướng "Tận dụng qua cầu nối `react-native-web`" này không? Hay bạn thực sự muốn yêu cầu tôi "Covert/đập đi xây lại 70 components đó thuần 100% bằng HTML tags (div, span) + Tailwind v4 CSS"? *(Lời khuyên: Cách qua cầu nối RN Web giúp tiết kiệm hàng trăm giờ làm việc ngay lập tức, và tương thích nếu sau này bạn build app mobile)*.
2. Có một vài tính năng trong `SGAPIClient` gắn chặt với old backend, tôi có nên tạm vô hiệu hóa nó và chỉ mang các file UI thuần túy thôi không?

---
*Vui lòng phản hồi ý kiến hoặc sửa trực tiếp vào file này.* Mọi thứ đã sẵn sàng để tôi khởi chạy lệnh tự động copy mã nguồn và update config.
