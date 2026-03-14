# Hướng dẫn clasp pull dự án Google Apps Script

Tài liệu này hướng dẫn bạn cách sử dụng công cụ `clasp` (Command Line Apps Script Projects) để tải (pull) mã nguồn từ Google Apps Script về máy tính cục bộ.

## 1. Kiểm tra môi trường

Hiện tại, máy của bạn đã cài đặt `clasp` phiên bản `3.2.0`. Bạn có thể bắt đầu ngay.

## 2. Các bước thực hiện

### Bước 1: Đăng nhập vào Google

Nếu bạn chưa đăng nhập, hãy chạy lệnh sau:

```powershell
clasp login
```

Trình duyệt sẽ mở ra, hãy chọn tài khoản Google chứa dự án Apps Script của bạn và cấp quyền.

### Bước 2: Bật Apps Script API

Bạn cần bật Apps Script API trong phần cài đặt tài khoản Google của mình (chỉ cần làm một lần duy nhất):

1. Truy cập: [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings)
2. Chuyển trạng thái **Google Apps Script API** sang **Configured** (hoặc **On**).

### Bước 3: Tải dự án về máy (Clone)

Nếu bạn chưa có thư mục dự án trên máy, hãy sử dụng lệnh `clone` với **Script ID** của dự án.

1. Lấy **Script ID**: Trong giao diện web Apps Script, chọn **Project Settings** (biểu tượng bánh răng) > Copy **Script ID**.
2. Chạy lệnh:

```powershell
clasp clone "YOUR_SCRIPT_ID"
```

_Lệnh này sẽ tạo một file `.clasp.json` và tải toàn bộ code về thư mục hiện tại._

### Bước 4: Cập nhật code mới nhất (Pull)

Nếu bạn đã có thư mục dự án (đã có file `.clasp.json`), mỗi khi muốn lấy code mới nhất từ server về máy, hãy chạy:

```powershell
clasp pull
```

## 3. Một số lưu ý quan trọng

- **File `.clasp.json`**: Đây là file quan trọng nhất để `clasp` biết nó đang kết nối với dự án nào. Đừng xóa nó.
- **File `appsscript.json`**: Đây là file cấu hình dự án (manifest). Khi `pull` về, hãy chắc chắn không làm mất file này.
- **Đẩy code lên (Push)**: Sau khi sửa code ở máy, bạn dùng `clasp push` để đưa code lên lại Google Apps Script.

---

> [!TIP]
> Nếu bạn muốn tổ chức mã nguồn tốt hơn, hãy cân nhắc sử dụng cấu trúc thư mục `src/` và cấu hình trong `.clasp.json`.
