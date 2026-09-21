# Tài Liệu Quản Lý Bộ Nhớ Đệm Trình Duyệt (Browser Cache Specification)

Tài liệu này quy định chi tiết các cơ chế lưu trữ bộ nhớ đệm (Cache) trên trình duyệt người dùng trong ứng dụng Frontend **Hyperdata Lab / ResearchPulse** (`ResearchPulse-Publication-Repository-FE`), bao gồm mục đích, dữ liệu được lưu, cơ chế hết hạn (TTL - Time-To-Live) và cách thức dọn dẹp bộ nhớ đệm.

---

## 1. Bảng Tổng Hợp Các Lớp Cache Trên Trình Duyệt

| Lớp Lưu Trữ | Khóa / Query Key | Dữ Liệu Được Lưu | Cơ Chế Hết Hạn / TTL | Cơ Chế Hủy / Invalidation |
|---|---|---|---|---|
| **TanStack Query** *(RAM)* | `['preprints', 'mine']` | Danh sách bản thảo / bài báo của người dùng hiện tại | **`staleTime`: 3 phút**<br>**`gcTime`: 10 phút** | Tự động làm mới sau 3 phút hoặc khi người dùng nộp/sửa bài báo |
| **TanStack Query** *(RAM)* | `['lecturer', 'reviews']` | Danh sách hàng đợi duyệt bài của giảng viên | **`staleTime`: 3 phút**<br>**`gcTime`: 5 phút** | Tự động làm mới khi gửi đánh giá hoặc duyệt bài |
| **TanStack Query** *(RAM)* | Các Query mặc định khác | Dữ liệu API phản hồi từ máy chủ | **`staleTime`: 5 phút**<br>**`gcTime`: 5 phút** | Theo vòng đời component hoặc gọi `invalidateQueries()` |
| **LocalStorage** | `hyperdata_preprint_draft_v1` | Bản nháp bài báo đang soạn thảo *(tiêu đề, tóm tắt, ngành, đồng tác giả...)* | **Vĩnh viễn (Persistent)**<br>*(Không tự hết hạn)* | Tự động xóa khi **Nộp bài thành công** hoặc bấm nút **"Xóa bản nháp"** |
| **HTTP-Only Cookies** | `app_session` | Token xác thực JWT phiên làm việc | **7 ngày**<br>*(hoặc theo `expiresAt` từ BE)* | Xóa ngay lập tức khi người dùng bấm **Đăng xuất (Logout)** |
| **HTTP-Only Cookies** | `oidc_state`, `oidc_verifier` | State xác thực luồng đăng nhập SSO / OIDC | **Tạm thời**<br>*(Trong phiên handshake)* | Tự động xóa sau khi hoàn tất callback đăng nhập |
| **HTTP Asset Cache** | PDF Worker & Static Chunks | `pdf.worker.min.mjs`, Web Fonts, Next.js JS/CSS chunks | **1 năm (`immutable`)** | Tự động cập nhật qua hash định danh mỗi lần build ứng dụng |

---

## 2. Chi Tiết Từng Lớp Lưu Trữ

### 2.1. TanStack Query Cache (Bộ Nhớ RAM Trình Duyệt)

Dữ liệu phản hồi từ Backend được cache trực tiếp trên bộ nhớ RAM của trình duyệt thông qua thư viện `@tanstack/react-query`:

* **Cấu hình toàn cục (`src/app/providers/QueryProvider.tsx`)**:
  ```typescript
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,   // 5 phút: Dữ liệu được xem là "Fresh"
            gcTime: 5 * 60 * 1000,      // 5 phút: Giữ trong RAM sau khi component unmount
            refetchOnWindowFocus: false, // Tránh gọi lại API liên tục khi đổi tab
            retry: 1,                   // Thử lại 1 lần nếu gặp sự cố mạng tạm thời
          },
        },
      })
  );
  ```

* **Ý nghĩa hai thông số then chốt**:
  1. **`staleTime` (3 đến 5 phút)**: Trong khoảng thời gian này, khi người dùng điều hướng qua lại giữa các trang/tab, hệ thống **sử dụng ngay dữ liệu trong cache** mà không gửi thêm HTTP request lên máy chủ, loại bỏ hiện tượng nhấp nháy màn hình và tăng tốc độ phản hồi lên tức thì.
  2. **`gcTime` (Garbage Collection Time - 5 đến 10 phút)**: Thời gian dữ liệu không còn được sử dụng (inactive) được giữ lại trong RAM phòng trường hợp người dùng quay lại trước khi bị trình duyệt dọn dẹp để tiết kiệm bộ nhớ.

* **Các Query cụ thể đã tối ưu**:
  - `['preprints', 'mine']` (`src/features/preprint/hooks/usePreprintList.ts`): Cache danh sách bài báo của sinh viên và giảng viên (`staleTime: 3 phút`, `gcTime: 10 phút`).
  - `['lecturer', 'reviews']` (`src/features/lecturer/views/LecturerReviewsView.tsx`): Cache danh sách duyệt bài của giảng viên (`staleTime: 3 phút`).

---

### 2.2. LocalStorage Draft Cache (Bảo Vệ Bản Nháp Dài Hạn)

Được áp dụng tại trang soạn thảo và chỉnh sửa bản thảo bài báo (`src/features/preprint/views/PreprintEditorView.tsx`) thông qua hook `usePreprintDraft` (`src/lib/hooks/use-preprint-draft.ts`):

* **Tên khóa**: `hyperdata_preprint_draft_v1`
* **Thời gian sống (TTL)**: **Persistent (Không hết hạn theo thời gian)**.
* **Cơ chế hoạt động**:
  - **Tự động lưu (Debounced Auto-save)**: Dữ liệu tự động được ghi vào LocalStorage sau **600ms** kể từ lần thao tác phím cuối cùng của người dùng.
  - **Dữ liệu được bảo toàn**: Tiêu đề (`title`), Chuyên ngành (`discipline`), Tóm tắt (`abstractText`), Từ khóa (`keywordsInput`), Chế độ riêng tư (`isPrivate`), Danh sách tác giả & người hướng dẫn (`authors`).
  - **Khôi phục**: Khi người dùng vào lại trang tạo bài mới, ứng dụng tự động nạp lại thông tin và hiển thị thanh thông báo màu xanh nhắc nhở.
  - **Xóa cache**: Khi bản thảo được **Nộp thành công (Submit)**, hàm `clearDraft()` được gọi tự động để làm sạch bộ nhớ. Người dùng cũng có thể bấm nút **"Xóa bản nháp"** để làm mới form.

---

### 2.3. Browser Session Cookies (Phiên Làm Việc & Bảo Mật)

* **Cookie `app_session`**:
  - **Vị trí**: Quản lý tại `src/app/api/auth/login/route.ts` và `src/app/auth/callback/route.ts`.
  - **TTL (`maxAge`)**: Mặc định **7 ngày** (`604,800 giây`) hoặc căn chỉnh theo thời hạn `expiresAt` nhận được từ JWT Backend.
  - **Cơ chế bảo mật**: Đặt cờ `HttpOnly: true` (ngăn JavaScript độc hại đọc trộm token), `SameSite: 'lax'`, `Path: '/'`.
  - **Hủy phiên**: Bị xóa sạch khi người dùng nhấn Đăng xuất qua endpoint `/api/auth/logout`.

---

### 2.4. Static Assets & PDF.js Worker Cache (HTTP Cache-Control)

* **Tài nguyên tĩnh Next.js (`/_next/static/*`)**:
  - Bundle JavaScript, CSS và Web Fonts được trình duyệt cache với header `Cache-Control: public, max-age=31536000, immutable` (TTL: **1 năm**). Các bản cập nhật mã nguồn mới sẽ có hash file mới, đảm bảo người dùng luôn nhận được phiên bản mới nhất mà không bị kẹt cache cũ.
* **PDF Rendering Worker (`pdf.worker.min.mjs`)**:
  - Worker render PDF trực tiếp trên trình duyệt được cache tại tầng HTTP Cache, giúp các lần mở đọc tài liệu PDF tiếp theo khởi động ngay lập tức mà không phải tải lại gói worker nặng ~3MB.

---

## 3. Hướng Dẫn Kiểm Tra & Gỡ Lỗi (Debugging)

### 3.1. Sử dụng TanStack Query Devtools (Chế độ Development)
1. Khởi chạy dự án ở môi trường phát triển: `npm run dev`.
2. Quan sát **biểu tượng bong bóng TanStack tròn (nổi ở góc dưới bên phải màn hình)**.
3. Bấm vào bong bóng để mở bảng điều khiển Devtools:
   - **Xanh lá (Fresh)**: Dữ liệu đang còn trong thời gian `staleTime`, không gửi request.
   - **Vàng (Stale)**: Dữ liệu đã quá hạn, sẽ được re-fetch ngầm khi có tương tác.
   - **Xám (Inactive)**: Component đã unmount, dữ liệu đang đếm ngược thời gian `gcTime` trước khi bị giải phóng.
   - Bấm vào từng query để xem cấu trúc JSON chi tiết hoặc kích hoạt **"Refetch"** / **"Invalidate"** để kiểm tra phản hồi.

### 3.2. Sử dụng DevTools của Trình Duyệt (Chrome / Edge / Firefox)
- Nhấn phím `F12` -> chọn tab **Application** (Ứng dụng).
- Kiểm tra mục **Storage**:
  - **Local Storage** -> `http://localhost:3003`: Xem khóa `hyperdata_preprint_draft_v1`.
  - **Cookies** -> `http://localhost:3003`: Xem cookie `app_session`.
