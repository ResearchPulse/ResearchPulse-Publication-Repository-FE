# Brainstorm: Tối ưu Realtime Search & Đồng bộ 2 chiều cho Tìm kiếm Student

**Ngày tạo**: 2026-09-21  
**Chủ đề**: Khắc phục lỗi đúp dấu 'x', kích hoạt tìm kiếm tự động realtime (không cần nhấn Enter) trên Topbar và đồng bộ 2 chiều hoàn hảo với thanh tìm kiếm ở bảng danh sách.

---

## 1. Vấn đề Người dùng Phản hồi

1. **Lỗi đúp 2 dấu 'x' trên ô tìm kiếm Topbar**:
   - Thẻ `<input type="search">` của trình duyệt Chrome/Edge tự động sinh ra một nút xóa mặc định (`::-webkit-search-cancel-button`), kết hợp với nút `×` tùy chỉnh tạo thành 2 dấu `x x` nằm sát nhau.
2. **Topbar chưa tự động tìm kiếm (chưa realtime)**:
   - Ô ở dưới bảng chỉ cần gõ vài ký tự là danh sách tự động lọc ngay lập tức (instant live filter).
   - Trong khi ô ở Topbar trước đây bắt buộc phải nhấn phím `Enter` mới submit.
3. **Mất đồng bộ 2 chiều**:
   - Khi xóa từ khóa ở Topbar thì ô ở bảng không tự động xóa theo (như thấy ở hình 2, Topbar về rỗng nhưng bảng vẫn còn từ khóa `deep`).
   - Gõ ở bảng danh sách thì ô Topbar chưa tự cập nhật theo.

---

## 2. Giải pháp Thiết kế Chi tiết (Đã thống nhất)

### A. Khắc phục lỗi đúp dấu 'x'
- Đổi kiểu input từ `type="search"` sang `type="text"` (hoặc áp dụng CSS ẩn triệt để `::-webkit-search-cancel-button` và `::-webkit-search-decoration`).
- Chỉ duy trì 1 nút xóa `×` tùy chỉnh duy nhất, giao diện đẹp, đồng nhất trên mọi trình duyệt.

### B. Tìm kiếm tự động Realtime (Gõ là lọc ngay)
- **Khi đang ở trang danh sách bản thảo (`/student/my-preprints`) hoặc kho bài báo (`/student/published`)**:
  - Gõ vào ô tìm kiếm ở Topbar: Tự động cập nhật bộ lọc và đồng bộ trạng thái ngay lập tức (instant realtime), người dùng **không cần phải nhấn Enter**.
  - Tự động cập nhật URL bằng `window.history.replaceState` (hoặc debounced router.replace) để không tạo rác lịch sử trình duyệt (browser history).
- **Khi đang ở các trang khác (`/student/dashboard`, `/student/account`...)**:
  - Khi gõ từ khóa và nhấn `Enter` (hoặc submit): Tự động điều hướng sang `/student/my-preprints?search=...` để xem kết quả.

### C. Đồng bộ 2 chiều hoàn hảo (Bi-directional Sync)
- **Topbar -> Table**: Khi người dùng gõ hoặc bấm nút `×` ở Topbar, ô ở bảng tự động cập nhật và bảng lọc/reset dữ liệu ngay lập tức.
- **Table -> Topbar**: Khi người dùng gõ hoặc bấm nút `×` ở bảng danh sách, ô ở Topbar cũng tự động hiển thị từ khóa tương ứng.

---

## 3. Kế hoạch Triển khai & Xác thực

1. **Typecheck**: `npx tsc --project tsconfig.json --noEmit` đạt 0 lỗi.
2. **Kiểm tra trực quan**:
   - Mở `/student/my-preprints`:
     - Nhập chữ `deep` vào ô Topbar -> Không còn 2 dấu `x`, chỉ có 1 dấu `×`.
     - Danh sách ở dưới tự động lọc ngay mà không cần nhấn Enter.
     - Ô search ở bảng tự động hiển thị chữ `deep`.
     - Bấm dấu `×` ở Topbar -> Cả 2 ô đều xóa sạch và bảng hiển thị lại toàn bộ bản thảo.
     - Bấm dấu `×` ở bảng -> Cả 2 ô đều xóa sạch.
