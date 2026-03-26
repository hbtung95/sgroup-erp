# Kiến Trúc UI/UX và Bộ Quy Tắc (UI Architecture & Rules)

Tài liệu này định nghĩa kiến trúc UI tổng thể và bộ quy tắc lập trình giao diện cho toàn bộ dự án SGROUP ERP, tuân thủ theo **SGroup Design System (SGDS)**. Bộ quy tắc này áp dụng chung cho mọi phân hệ (module) để đảm bảo tính đồng nhất, trải nghiệm cao cấp (premium) và tốt nhất cho người dùng.

---

## 1. Triết Lý Thiết Kế (Design Philosophy)

Mọi dòng code giao diện đều phải phản ánh 6 nguyên tắc cốt lõi:

1. **Premium First (Cao Cấp Tuyệt Đối):** Giao diện phải mang lại cảm giác của một sản phẩm SaaS xa xỉ, cực kỳ sang trọng, hoàn toàn vượt xa khuôn khổ của một dashboard quản trị thông thường. Tuyệt đối không thỏa hiệp với các thiết kế bình dân.
2. **Dark-Native (Tối Chủ Đạo):** Dark theme là trải nghiệm gốc (native) và được ưu tiên nhất định. Light theme cũng phải được trau chuốt tương đương.
3. **Neo-Glassmorphism & Depth (Kính cường lực ảo & Chiều Sâu):** Áp dụng phong cách Neo-Glassmorphism cực kỳ sang trọng. Phối hợp nhịp nhàng giữa kính mờ (frosted glass), đường viền kính siêu mỏng có bắt sáng (ultra-thin glowing borders), và hiệu ứng ánh sáng bề mặt (diffused glows) để tạo ra không gian 3D giả lập chân thực.
4. **Alive & Responsive (Chuyển Động & Phản Hồi):** Sử dụng vi hiệu ứng (micro-animations), hiệu ứng lò xo (spring physics) và trạng thái hover/press để UI luôn phản hồi lại tương tác của người dùng một cách tự nhiên.
5. **Consistent Tokens (Đồng Nhất Tokens):** Toàn bộ màu sắc, khoảng cách (spacing), kích thước chữ (typography) và độ bo góc (radius) **bắt buộc** phải lấy từ file thống nhất `theme.ts`. **Tuyệt đối không hardcode**.
6. **Component-Driven (Ưu Tiên Component):** Ưu tiên tái sử dụng thư viện hệ thống (78+ component có sẵn với tiền tố `SG*`) thay vì tự code component thuần từ thẻ `View`, `Text` của thư viện lõi.

---

## 2. Kiến Trúc Cấu Trúc File & Theme Hệ Thống

### 2.1 Cấu trúc file Theme
Theme của toàn hệ thống thống nhất được quản lý tập trung và tiêm (inject) tại `src/shared/theme/`:
- `theme.ts`: Chứa toàn bộ cấu hình về palette màu sắc, dark/light tokens, typography, spacing, radius, animations định trước...
- `themeStore.ts`: Zustand store quản lý State (trạng thái) của giao diện toàn cầu (`isDark`, `toggleTheme`).
- `useAppTheme.ts`: Hook duy nhất dùng trong Component Controller/View để lấy Theme variables ra một cách Reactive (cập nhật động khi toggle theme).

### 2.2 Quy định sử dụng Hook
Mọi màn hình và component cấp dưới khi cần styling/màu sắc đều **song song phải** sử dụng hook `useAppTheme`:

```tsx
// ✅ Chuẩn: Lấy trực tiếp từ Hook chuyên dụng
import { useAppTheme } from '@/shared/theme/useAppTheme';
import { typography, spacing, radius, sgds } from '@/shared/theme/theme';

const MyComponent = () => {
  const { theme, colors } = useAppTheme();

  return (
    <View style={{ backgroundColor: colors.bg, padding: spacing.lg, borderRadius: radius.md }}>
      <Text style={[typography.h2, { color: colors.text }]}>Hello Architecture!</Text>
    </View>
  );
};

// ❌ SAI LẦM: Hardcode mã màu hoặc inject magic numbers (ví dụ: borderRadius: 12)
<View style={{ backgroundColor: '#080a0f', padding: 16 }}>
```

---

## 3. Hệ Thống Màu Sắc (Color System semantic)

Nguyên tắc thiết lập màu là không dùng tên màu cụ thể trần trụi (như red, blue) cho styling UI, thay vào đó cần gắn các **Semantic Tokens** từ object `colors` của hook `useAppTheme`.

* `colors.bg`: Background nền toàn trang lớp 0.
* `colors.bgSecondary`: Sử dụng cho hiệu ứng kính (Glass surface ở lớp 2).
* `colors.bgCard`: Màu nền của thành phần Card cơ bản (White/Black 0.04 alpha).
* `colors.bgElevated`: Màu cho các pop-up, modal, panel nằm nổi bật đè lên (Lớp 4).
* `colors.text`: Chữ chính sắc nét.
* `colors.textSecondary`: Chữ phụ (mô tả ngắn, nhãn).
* `colors.textTertiary`: Chữ mờ, text bị vô hiệu hóa hoặc placeholder sâu.
* `colors.brand`: Màu thương hiệu chủ chốt (Sky Blue `#0ea5e9` hoặc Cyan / Indigo).
* `colors.border`: Đường viền phân cách tinh tế (Subtle Border) thông thường là dạng lớp alpha `rgba(255, 255, 255, 0.08)`.

---

## 4. Hệ Thống Typography & Khoảng Cách Hierarchy

### 4.1 Typography Size
Tuyệt đối tránh sử dụng fontSize custom tùy ý ngẫu nhiên hoặc magic numbers phân tán (ví dụ: `fontSize: 16`). Mọi component Text phải được gắn preset lấy từ `typography`:

* `typography.hero` (42px): Tiêu đề cực lớn (Hero Banner, Page Highlight).
* `typography.h1` (26px) -> `typography.h4` (14px): Cấp độ hệ thống của Tiêu đề phân khu.
* `typography.body` (14px Regular): Văn bản nội dung cơ bản chuẩn xác định.
* `typography.small` (13px Regular): Ghi chú phụ.
* `typography.caption` (11px Medium): Caption hình ảnh, hint Input.
* `typography.mono`: Dùng cho khối Code, Ticket Number, hoặc Serial mã vạch.

### 4.2 Spacing & bo góc (Radius)
* Sử dụng bộ Unit Base 4px. Từ `spacing.xs` (4px) lên đến cao nhất `spacing.4xl` (80px). Khoảng đệm (padding) chuẩn thường là `spacing.base` (16px) hoặc `spacing.lg` (24px).
* Bo góc cho Nút bấm / Nhập liệu (Inputs): `radius.sm` (8px).
* Khối thông tin nhỏ, Cards: `radius.md` (12px) hoặc phổ biến hơn `radius.lg` (16px).
* Panels trượt/Bottom sheets (Mobie): `radius.xl` (24px).

---

## 5. Quy Tắc Áp Dụng Neo-Glassmorphism Cực Sang Trọng

Neo-Glassmorphism (Kính mờ siêu cấp) là "Át chủ bài" tạo nên vẻ đẹp xa xỉ cho SGDS. Nghiêm cấm sử dụng các khối màu nền đặc (solid color blocks) nặng nề đối với các Container chính. Thay vào đó, mọi bề mặt lớn đều phải áp dụng Neo-Glassmorphism bao gồm tối thiểu 3 yếu tố sau:
1. **Nền mờ khúc xạ (Backdrop blur) cao cấp:** Làm mờ khung cảnh phía sau một cách có chủ đích (ví dụ blur(20px)).
2. **Viền kính phát sáng nhẹ (Nano-borders):** Viền sáng 1px với alpha rất thấp (rgba 0.08 - 0.15) để phân tách bề mặt kính với background. Cơ chế bắt sáng ở góc cạnh.
3. **Độ sâu quang học (Optical Drop-shadows):** Đổ bóng mờ mịn màng tạo cảm giác thẻ (Card) hoặc phần thân nội dung đang "lơ lửng" trên hệ thống.

**Cách dùng theo chuẩn Pattern cho Container nội dung:**
```tsx
const sectionStyle = sgds.sectionBase(theme); // Auto map: backgroundColor mờ alpha, backdropFilter kính khúc xạ, borderWidth, borderColor.
```

**Custom Panels yêu cầu Glass trực tiếp (Manual):**
```tsx
const glassStyle = {
  backgroundColor: colors.glass,           // rgba(20, 24, 35, 0.6)
  borderWidth: 1,
  borderColor: colors.glassBorder,         // rgba(255, 255, 255, 0.08)
  borderRadius: radius.lg,                 
  ...sgds.glass,                           // System handler: auto-apply backdropFilter on Web / BlurView in native
};
```

---

## 6. Danh Mục Component Bắt Buộc Sử Dụng (SG* Prefixes)

Module nào phát triển UI cũng phải Scan trước các bộ Component có sẵn. KHÔNG DUPLICATE. Prefix là `SG*`:

* **Layout Structure:** `SGPageContainer`, `SGPageHeader`, `SGSection`, `SGAuroraBackground`...
* **Cards & Đo lường KPIs:** `SGCard`, `SGStatCard`, `SGGradientStatCard`, `SGKpiCard`, `SGScenarioBar`...
* **Form & Validation Controls:** `SGInput`, `SGSelect`, `SGCheckbox`, `SGSwitch`, `SGCurrencyInput`, `SGPlanningNumberField`.
* **Trực Quan Hóa (Data Visual):** `SGTable`, `SGBarChart`, `SGDonutChart`, `SGMiniChart`, `SGSparkline`.
* **Thông Báo & Overlay:** `SGModal`, `SGBottomSheet`, `SGToast`, `SGLoadingOverlay`, `SGEmptyState`.

---

## 7. Quy Tắc Tích Hợp Animation (Chuyển Động)
Sử dụng `react-native-reanimated` v4 làm Thư viện (Engine) DUY NHẤT để xử lý mượt mà.

* Khi phần tử List được mount Lên Màn: Dùng hook slide-up kết hợp delay chéo `withDelay(index * 50, withSpring(0, { damping: 20, stiffness: 90 }))` để Card xếp chéo mượt mà lên màn hình tạo wow.
* Tương tác nút (Tap / Pressable): Có độ nén (squish) và nẩy nhịp nhàng (`damping: 15`).
* Hover logic (nền Web): Dùng thuộc tính transition 150-300ms gọi từ bộ web `sgds.transition.fast`.
* Đếm số (Metric Counters): Mọi KPI Metric Card phải có hiệu ứng rolling number `withTiming` (~800ms) để nhảy số đẹp mắt trước mắt Client.

---

## 8. Xử Lý State Lỗi Vô Hình (Trạng Thái Chờ / Trống / Lỗi)

Kiến trúc UI coi 3 luồng state chờ (Pending/Empty/Error) quan trọng ngang hàng với Data có sẵn:
* **Skeleton (Chờ Rút API Lần Đầu):** Mọi API Call (React Query / Zustand Async) đang trạng thái Loading (Lần 1 chưa có Cache) **bắt buộc phải** bọc bằng Data layout `SGSkeleton` (Skeleton shimmers). Không bao giờ được dùng màn hình trống vắng đi kèm một cái ActivityIndicator (Spinner xoay xoay) đơn độc ở giữa màn hình.
* **Empty State (Biểu Diễn Nếu Mảng Null/[]):** Nếu Fetch về Array Data Empty. Cấm ném một mảng trắng bóc vô tri hoặc List rỗng. Bắt buộc hiển thị Component `SGEmptyState` với Icon kích suất 48px, Thông điệp diễn giải, và Nút Gọi Hành Động (Call-to-Action) như "Tạo Mới / Thêm mới Record đầu tiên".
* **Lỗi Destructive (Delete/Remove):** Mọi thao tác nguy hiểm thay đổi hoặc Delete Data trên DB phải gọi Modal cản chặn bảo vệ cuối là `SGConfirmDialog`.

---

## 9. Cấu Trúc Bố Cục Đa Nền Tảng (Responsive & Safe Area)

Hệ thống phải tự động rẽ nhánh giao diện (Responsive) mượt mà dựa trên không gian:
* **Mobile (<768px):** Ưu tiên tràn viền (100% width). Cuộn dọc. Thanh điều hướng dùng **Bottom Tab** hoặc **Drawer** ảo. Bắt buộc tính toán khoảng cách `SafeAreaView` để không bị lẹm (Notch, Dynamic Island) râu mép điện thoại.
* **Tablet (768px - 1024px):** Navigation chuyển sang Sidebar thu gọn (Collapsible). Bố cục lưới chia 2-3 cột.
* **Web Desktop (Re-use):** Sử dụng dạng Sidebar cố định luôn mở, Grid layout dàn ngang 4-6 cột.

---

## 10. Hệ Thống Biểu Tượng (Iconography Rules)

Nghiêm cấm trộn lẫn nhiều thư viện Icon (FontAwesome, Material, Ionicons...) gây phân mảnh. Dự án dùng định chuẩn duy nhất là **Lucide React Native**.
* **Độ dày (Stroke Width):** Cố định tuyệt đối `strokeWidth={1.5}` cho mọi hiển thị hệ thống để đảm bảo độ thanh mảnh, sang trọng. (Dày 2.0 chỉ dùng cho Icon nằm chung dòng văn bản nhỏ).
* **Kích thước chuẩn (Size):**
  - Text inline: `16px`.
  - Icon Button: `18-20px`.
  - Navigation / Card: `22-24px`.
  - Empty State / Hero: `40-48px`.

---

## 11. Xúc Giác & Vùng Chạm (Haptics & Touchability)

Trải nghiệm "Siêu Sang" không chỉ hiện ở mắt mà xuất phát ở điểm chạm màn hình:
* **Haptic Feedback:** Mọi nút bấm hoàn thành dữ liệu (Submit, Xóa thành công), gạt công tắc (Switch), hoặc thông báo Lỗi trên điện thoại đều **phải kèm độ rung phản hồi xúc giác** (Taptic/Haptics engine) để tạo gắn kết vật lý với ngón tay người dùng.
* **Bắt buộc Vùng chạm (Touch Target):** Mật độ UI có hẹp tới đâu, mọi phần tử tương tác (nhất là Icon mỏng) bắt buộc phải cấu hình `hitSlop` bù đắp để diện tích nhận chạm thực tế tối thiểu là **44x44px** (theo chuẩn Accessibility của hệ điều hành).

---

## 12. Trực Quan Hóa Dữ Liệu (Data Visualizations)

Báo cáo và Dashboard là bộ não của ERP. Biểu đồ phải cực kỳ tinh tế:
* **Tránh màu nguyên bản:** Không dùng Đỏ/Xanh Lá quá chóe hoặc tạt màu rực rỡ. Sử dụng các dải màu Gradient tiệp màu định sẵn trong thẻ `theme.ts` (ví dụ `colors.gradientBrand`). 
* **Mượt mà biên độ (Border curve):** Biểu đồ dòng (Line Chart/Sparkline) mặc định bật chế độ bo cong mượt (smooth curve line), không gãy góc nhọn hình chữ V.
* Đường gióng nền (Grid lines) của trục toạ độ phải đẩy mức alpha xuống rất nhạt (`colors.border`) để làm nền không tranh chấp với đường chạy số liệu chính.

---

## 13. Luật Tối Ưu Render (Performance UI Engineering)

Trải nghiệm "Premium" sẽ bị phá vỡ nếu Ứng dụng bị giật hình (drop frames) dưới 60FPS. Mọi View Component phải được bảo vệ bởi rào cản tối ưu:
* **Hạn chế Re-render:** Tách các khối UI phức tạp/data nặng thành Component con và đóng gói bằng `React.memo()`. Bao bọc các dữ liệu mảng cấu trúc sâu bằng `useMemo()`.
* **Danh sách dài (Lists):** Tuyệt đối không khai báo hàm xử lý (anonymous inline functions) trực tiếp bên trong `renderItem` của `FlatList` / `FlashList`. Component con (List item) phải được thiết kế dạng stateless, gọi hàm thông qua ref tham chiếu hoặc bao bọc `useCallback`.
* **Luồng Hoạt Hình Cứng (Worklets):** Các chuỗi chuyển động, kéo thả mượt mà lớn phải cấu hình chạy hoàn toàn dưới **UI Thread** bằng `react-native-reanimated` (`useAnimatedStyle`, `runOnJS` chỉ gọi khi thiết yếu).

---

## 14. Luật Khả Năng Truy Cập (Accessibility - A11y)

Một ứng dụng SaaS chuyên nghiệp phải tôn trọng sự dễ dàng sử dụng của mọi người, bao gồm người dùng yếu thế:
* **Chuẩn Nút bấm Lắng Nghe:** Mọi thẻ nhận chạm `Pressable`, `TouchableOpacity` hoặc Image nếu mang tính năng tương tác thì bắt buộc định nghĩa `accessibilityRole="button"` và `accessibilityLabel="[Tên tính năng]"`.
* **Motion Sensitivity (Cảm ứng chống say):** Tôn trọng cài đặt "Reduce Motion" trong thiết bị hệ điều hành. Phải có quy trình fallback/giảm thiểu Spring Animation búng lò xo mạnh thành Fade Transition cơ bản, nếu user thiết lập giới hạn do tiền đình.

---

## 15. Kiến Trúc Thư Mục Component (Colocation Pattern)

Kiến trúc quản lý mã nguồn file UI đặt tiêu chí dễ đọc, đóng gói độc lập và dễ tái sử dụng làm số một:
* **1 Component - 1 Thư mục:** Ví dụ khi tạo `SGCard`, thành phần này không được phép chỉ là 1 file `SGCard.tsx` lăn lóc bên ngoài cùng. Nó phải là cấu trúc Thư mục `SGCard/` bao bọc:
  - `index.ts`: Export Public API.
  - `SGCard.tsx`: Chứa cấu trúc thẻ JSX mô tả View.
  - `SGCard.styles.ts`: Định nghĩa file StyleSheet cách ly giao diện thuần.
  - `SGCard.types.ts`: Interface TypeScript quy chuẩn dữ liệu truyền vào Props.
* Mọi cấu hình logic thay đổi về một Component sẽ chỉ được phép khu trú trong 1 Folder duy nhất (nguyên lý đóng gói thành trì), không gây lây lan lỗi nát hệ thống ra ngoài.

---

## 16. Hệ Thống Phân Tầng Z-Index & Elevation

Tuyệt đối cấm sử dụng các con số Z-index ngẫu nhiên (magic numbers kiểu `zIndex: 9999`) để đè lớp hiển thị trong App/Web:
* Toàn hệ thống Z-index phải tuân thủ biến thứ bậc từ cấu hình tập trung.
* **Thứ bậc theo chiều Z (Back to Front):**
  - Lớp nền móng (Background / Aurora): `z: 0`
  - Thân nội dung, Thẻ tĩnh (Cards/Sections): `z: 10`
  - Sticky Headers / Top Navigation Bar: `z: 100`
  - Drawer / Sidebar menu trượt: `z: 200`
  - Modals / Bottom Sheets che phủ: `z: 1000`
  - Toast Notifications / Tooltips cao nhất: `z: 2000`

---

## 17. Ranh Giới Bắt Lỗi Hiển Thị (Error Boundaries)

Trong một hệ thống ERP khổng lồ, một component dính dữ liệu hỏng (VD: API Biểu đồ trả về null) không được phép làm sập (White-screen Crash) toàn bộ Màn hình của người dùng.
* **Bắt buộc:** Mọi Trang (Screen) và các Module Dashboard lớn phải được bọc bởi `<ErrorBoundary>`.
* **Tự động phục hồi (Fallback UI):** Nếu một Widget bị lỗi, thì chỉ vỏn vẹn khu vực Widget đó hiển thị `SGFallbackView` (Báo lỗi cục bộ kèm nút "Thử tải lại Widget này"), trong khi toàn bộ các khối chức năng khác bên cạnh vẫn sử dụng bình thường. Phải cô lập lỗi hiển thị.

---

## 18. Chiến Lược Phản Hồi UI Lạc Quan (Optimistic UI & Offline)

Một sản phẩm "Siêu VIP" không được phép bắt người dùng chạm tay vắt óc chờ Spinner xoay mù mịt ở mỗi thao tác nhỏ nhặt.
* **Optimistic Update (Cập nhật Lạc quan):** Các thao tác Micro-interactions như Gạt công tắc (Toggle Switch), Chạm Thích, Đánh dấu ✓ Xong... phải cập nhật UI **thành công ngay lập tức** ở frontend (Giấu độ trễ mạng). Nếu ngầm bên dưới Server trả về lỗi 500, App mới tự động giật (revert) ngược nút Switch trở lại kèm một Toast báo lỗi êm ái.
* **Xử lý Mất Mạng (Loss of Network):** Khi ngắt kết nối internet (Wifi down), UI cấm bị freeze (đóng băng). Màn hình phải slide ra một băng rôn nhỏ `SGBanner` "Dữ liệu đang hiển thị ngoại tuyến" và làm mờ bảo vệ (disable gạch chéo) đi các nút Gửi/Submit dữ liệu lớn để tránh user thao tác thừa.

---

## 19. Đa Ngôn Ngữ & Tiêu Chuẩn Văn Bản (i18n & Microcopy)

Chữ viết trên UI (Microcopy) đóng vai trò định hình giọng văn (Tone-of-voice) đẳng cấp của SGroup:
* **Cấm Hardcode Nguyên Văn:** Không gõ tiếng Việt thẳng vào JSX kiểu `<Text>Lưu thông tin</Text>`. Tất cả văn phong cố định bắt buộc phải trỏ bằng hàm dịch thuật `t('button.saveAccountInfo')` trong khối thư viện i18n để App sẵn sàng Globalize bất cứ lúc nào (trừ Data Fetch về thì đương nhiên render thẳng).
* **Định Dạng Sentence Case:** Tiêu đề / Nút bấm chỉ viết hoa chữ cái đầu tiên (Sentence case). Ví dụ: "Tạo dự án mới", **KHÔNG PHẢI** "Tạo Dự Án Mới" (Title Case lủng củng).
* **Action Verb:** Nút bấm phải là động từ chủ động, ngắn gọn. VD: [Lưu], [Xong], [Hủy], không viết lê thê [Nhấn vào để lưu dữ liệu lại thư mục].

---

## 20. Tách Bạch UI State & Business State

Nghiêm cấm nhồi nhét hổ lốn mọi loại Trạng thái vào một luồng dữ liệu:
* **UI State Cục Bộ (useState / useReducer):** State thuần hình thức như: Mở/Đóng 1 Modal nào đó, Đang focus input nào, String input search... Chỉ được phép lưu cục bộ trong memory của riêng Component đó.
* **Global Client State (Zustand):** Trạng thái toàn App mà nhiều Screen dùng chung (SideBar đang thu hay gập? Đang bật giao diện Dark mode? Thông tin Token User đăng nhập).
* **Server State (TanStack React Query):** Bất cứ lúc nào phải lấy Data từ Database/API đổ ra UI; quy trình Loading, Trượt Cache, Polling refetch tuyệt đối giao độc quyền cho React Query. Cấm kỹ sư tự dùng `fetch()` thuần rồi đẩy vô biến mảng `useState` gây mục ruỗng cấu trúc Code.

---

## 21. Các Bộ Quy Tắc "ĐÈN ĐỎ" Không Được Phép (Red Flags 🛑)

1. **🔴 KHÔNG** Hardcode mã màu `Hex/RGB` ở cục bộ file Stylesheet ở mọi cấp độ.
2. **🔴 KHÔNG** Dùng Default Fonts của OS (`Text` trần) - Phải gọi `typography.body` hoặc liên đới để có hệ chữ (Plus Jakarta Sans/Inter).
3. **🔴 KHÔNG** Đẩy Màn hình Trắng / Đứng hình khi Fetch API. Phải bắt qua Skeleton hoặc Loading Overlay.
4. **🔴 KHÔNG** Tạo Component UI cá nhân khi mà Thư viện SGDS đã hỗ trợ component tương tự.
5. **🔴 KHÔNG** Bỏ quên trạng thái Cấp phản hồi người dùng (`Toast` / `Haptics` / `Modal Error`) khi thao tác chọc API ghi dữ liệu.
6. **🔴 KHÔNG** Khai báo Anonymous function bọc thẳng vào thẻ `renderItem` trong List view gây Drop Frame.
7. **🔴 KHÔNG** Để một Component nhỏ bị banh dữ liệu kéo theo sập Crash cấm truy cập toàn màn hình (Thiếu `ErrorBoundary`).
8. **🔴 KHÔNG** Dùng Magic Number bừa bãi cho thuộc tính cấu trúc thượng tầng như `zIndex: 999`, không qua biến Theme quy chuẩn.

---

## 22. Tiếp cận chuyển giao & Kỷ luật (Discipline approach)
Luật Kiến trúc UI này sinh ra để "Trấn phái" toàn bộ các Developer, định chuẩn cho dự án tỷ đô `SGROUP ERP` hoạt động mượt mà dải tốc độ 60 FPS, không một gợn giật hay sai lệch pixel. Kỹ sư Frontend/Mobile phải học thuộc lòng tài liệu này như "Hiến pháp". Bất kể bạn là Thực tập sinh hay Senior thợ gõ nghìn đô, mọi Pull Request sửa Code Giao diện vi phạm 1 trong 8 "Điểm Đèn Đỏ" trên đây đều lập tức tự động bị nhận trát đánh rớt (Reject PR) bởi Auto Reviewer trước khi team QA kịp ngó tới.
