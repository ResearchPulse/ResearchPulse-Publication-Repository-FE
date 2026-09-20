# Brainstorm: Hệ thống Thông báo Thời gian thực (In-app Notification System với Fastify SSE)

**Ngày tạo**: 2026-09-20  
**Chủ đề**: Thiết kế và triển khai trung tâm thông báo thời gian thực (In-app Notification Center) phục vụ 3 nhóm đối tượng: Sinh viên (Student), Giảng viên (Lecturer) và Ban Quản trị (Admin) sử dụng Server-Sent Events (SSE).

---

## 1. Bối cảnh & Yêu cầu nghiệp vụ

Hệ thống quản lý xuất bản bài báo khoa học Hyperdata Lab bao gồm các chu trình tương tác nhiều bước giữa 3 nhóm người dùng:
1. **Sinh viên**: Nộp bài, nhận phản hồi, chỉnh sửa phiên bản và theo dõi trạng thái xuất bản.
2. **Ban Quản trị (Admin)**: Duyệt tài khoản mới, kiểm duyệt sơ bộ bài báo, phân công phản biện, ra quyết định xuất bản/từ chối.
3. **Giảng viên (Lecturer)**: Nhận bài được phân công phản biện, chấm điểm/góp ý, và nhận lại bản chỉnh sửa từ sinh viên ở các vòng tiếp theo.

**Hiện trạng:**
- Chưa có bảng lưu trữ thông báo trong cơ sở dữ liệu (`schema.prisma`).
- Chưa có luồng thông báo real-time; người dùng phải tự tải lại trang hoặc kiểm tra thủ công.
- Thanh Topbar của Sinh viên và Giảng viên chỉ có mockup tĩnh; thanh Topbar của Admin chưa có khu vực chuông thông báo.

---

## 2. Ma trận 6 Luồng Kích hoạt Thông báo (Trigger Matrix)

| # | Luồng sự kiện (Trigger) | Người kích hoạt | Đối tượng nhận | Tiêu đề & Nội dung | Hành động khi click (Link) |
|---|---|---|---|---|---|
| **1** | **SV nộp bài mới** | Student | **Tất cả Admin** | *Bản thảo mới*: "Sinh viên [Tên] vừa nộp bài báo: [Tiêu đề]" | `/admin/submissions/[id]` |
| **2** | **Admin phân công phản biện** | Admin | **Giảng viên được phân** | *Phân công phản biện*: "Thầy/Cô được phân công phản biện bài báo: [Tiêu đề] (Vòng [R])" | `/lecturer/reviews/[id]` |
| **3** | **Giảng viên hoàn thành phản biện** | Lecturer | **Admin & Tác giả SV** | *Nhận xét phản biện mới*: "Giảng viên đã gửi đánh giá cho bài báo: [Tiêu đề]" | SV: `/student/mentor-feedback`<br>Admin: `/admin/submissions/[id]` |
| **4** | **SV nộp lại bài chỉnh sửa (v2, v3)** | Student | **Giảng viên phụ trách & Admin** | *Bản chỉnh sửa mới*: "Sinh viên đã nộp bản thảo sửa đổi cho bài báo: [Tiêu đề]. Mời Thầy/Cô tiếp tục đánh giá vòng [R]" | Lecturer: `/lecturer/reviews/[id]`<br>Admin: `/admin/submissions/[id]` |
| **5** | **Admin duyệt xuất bản / Từ chối / Yêu cầu sửa** | Admin | **Tác giả SV** | *Kết quả kiểm duyệt*: "Bài báo [Tiêu đề] đã được [Xuất bản / Yêu cầu sửa / Từ chối]" | `/student/my-preprints/[id]` |
| **6** | **Tài khoản mới đăng ký** | Guest | **Tất cả Admin** | *Tài khoản mới*: "Người dùng [Email] vừa đăng ký tài khoản, đang chờ phê duyệt" | `/admin/users` |

---

## 3. Kiến trúc Kỹ thuật (Phương án A: In-Memory SSE Dispatcher + Prisma Notification)

### 3.1. Thiết kế Cơ sở dữ liệu (Database Schema)

Bổ sung model `Notification` vào file `prisma/schema.prisma`:

```prisma
model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  title     String
  content   String
  type      NotificationType
  link      String?
  isRead    Boolean          @default(false) @map("is_read")
  metadata  Json?
  createdAt DateTime         @default(now()) @map("created_at")

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}

enum NotificationType {
  SUBMISSION_CREATED
  SUBMISSION_REVISED
  REVIEW_ASSIGNED
  REVIEW_COMPLETED
  PUBLICATION_APPROVED
  PUBLICATION_REJECTED
  REVISION_REQUESTED
  USER_REGISTERED
  SYSTEM
}
```

### 3.2. Thiết kế Backend (Fastify Service & SSE Stream)

1. **`NotificationService`**:
   - `createNotification(userId, data)`: Lưu vào Postgres và gửi qua SSE stream nếu client của `userId` đang online.
   - `notifyAdmins(data)`: Lấy danh sách admin đang active, tạo notification hàng loạt (`createMany`), và broadcast tới tất cả admin đang kết nối.
   - `listUserNotifications(userId, query)`: Lấy danh sách có phân trang và filter `isRead`.
   - `getUnreadCount(userId)`: Đếm nhanh số thông báo chưa đọc.
   - `markAsRead(userId, id)` và `markAllAsRead(userId)`: Cập nhật trạng thái đã đọc.

2. **`SseConnectionManager`**:
   - Quản lý tập hợp kết nối `Map<string, Set<FastifyReply>>` theo `userId`.
   - Thiết lập header chuẩn SSE:
     - `Content-Type: text/event-stream`
     - `Cache-Control: no-cache`
     - `Connection: keep-alive`
   - Heartbeat định kỳ: Gửi `: ping\n\n` mỗi 25 giây để duy trì kết nối qua reverse proxy (Nginx/Caddy/Cloudflare) không bị ngắt quãng.
   - Xử lý dọn dẹp kết nối tự động khi `req.raw.on('close')`.

3. **Tích hợp Trigger vào các Service hiện có**:
   - `publication.service.ts`:
     - Bắn thông báo khi SV nộp bài lần đầu (`SUBMISSION_CREATED`).
     - Bắn thông báo khi SV nộp bản sửa đổi (`SUBMISSION_REVISED` tới GV phụ trách & Admin).
     - Bắn thông báo khi Admin đổi trạng thái sang `PUBLISHED`, `REJECTED`, `DRAFTING`.
   - `review.service.ts`:
     - Bắn thông báo khi Admin phân công reviewer (`REVIEW_ASSIGNED`).
     - Bắn thông báo khi Lecturer nộp đánh giá (`REVIEW_COMPLETED`).
   - `auth.service.ts`:
     - Bắn thông báo khi người dùng mới đăng ký (`USER_REGISTERED` tới Admin).

### 3.3. Thiết kế Frontend (Next.js & React Query)

1. **Custom Hook `useNotifications()`**:
   - Sử dụng React Query (`useQuery`) lấy danh sách thông báo và số lượng chưa đọc ban đầu (`GET /api/notifications`).
   - Mở `EventSource('/api/notifications/stream')` để lắng nghe sự kiện real-time.
   - Khi có notification mới:
     - Cập nhật trực tiếp cache của React Query (`queryClient.setQueryData`).
     - Tăng counter số lượng chưa đọc ngay lập tức mà không cần gọi lại API.
     - Phát âm thanh nhẹ (tùy chọn) hoặc hiệu ứng nhấp nháy chuông.
   - Tự động kết nối lại khi mạng phục hồi hoặc khi chuyển đổi tab (visibility change).

2. **UI Component Đồng bộ**:
   - Chuông thông báo (`NotificationBell`):
     - Hiển thị badge số lượng đỏ/xanh (tối đa `99+`).
     - Popover dropdown mượt mà với hiệu ứng hover bóng nhẹ chuẩn thiết kế.
     - Nút "Đánh dấu tất cả đã đọc" (`CheckCheck` icon).
     - Nút "Xem chi tiết" điều hướng trực tiếp đến đúng URL nghiệp vụ.
     - State trống (Empty State): Minh họa nhẹ nhàng khi không có thông báo mới.
   - Tích hợp chuẩn xác vào cả 3 shell:
     - `StudentTopbar.tsx`
     - `LecturerShell.tsx`
     - `AdminShell.tsx` (bổ sung thanh tìm kiếm + chuông thông báo)

---

## 4. Đánh giá Ưu - Nhược điểm & Rủi ro Kỹ thuật

### Ưu điểm
- **Độ trễ thấp (Real-time)**: Nhận thông báo trong chưa đầy 100ms kể từ khi hành động diễn ra.
- **Tiết kiệm tài nguyên**: SSE sử dụng kết nối HTTP một chiều nhẹ hơn nhiều so với WebSocket full-duplex hoặc polling liên tục.
- **Độc lập và an toàn**: Mỗi người dùng có bản ghi thông báo riêng, hỗ trợ xóa/đánh dấu đã đọc độc lập.
- **Tương thích cao**: Native 100% với Fastify và trình duyệt hiện đại (hỗ trợ `EventSource` từ lâu).

### Rủi ro & Giải pháp phòng ngừa
- **Rớt kết nối mạng**: Hook FE tự động kết nối lại (reconnect backoff), đồng thời khi tab focus lại (`window.onfocus`) React Query tự động re-validate unread count.
- **Treo kết nối HTTP**: Fastify SSE gửi định kỳ ping comment `: ping\n\n` mỗi 25s đảm bảo không bị gateway timeout.

---

## 5. Kế hoạch Kiểm thử & Xác thực

1. **Kiểm thử Backend (Integration Test)**:
   - Test luồng `NotificationService` tạo notification cho 1 user và cho all admin.
   - Test mark read và mark all read.
   - Test kết nối SSE stream nhận đúng payload event khi có thông báo mới.
2. **Kiểm thử End-to-End thực tế (Browser QA)**:
   - Mở 2 tab trình duyệt: Tab 1 đăng nhập Student, Tab 2 đăng nhập Admin.
   - Student nộp bài mới -> Chuông của Admin trên Tab 2 lập tức hiển thị badge `1` và hiện thông báo kèm link đến `/admin/submissions/:id`.
   - Admin phân review cho Lecturer -> Chuông của Lecturer lập tức hiện thông báo phân công.
   - Lecturer hoàn thành review -> Cả Admin và Student cùng nhận được thông báo.
   - Student nộp lại bản sửa đổi -> Cả Lecturer phụ trách và Admin nhận thông báo.
