# Brainstorm Report: Gộp tab Dashboard và Submissions thành 1 danh mục thống nhất trong Admin

- **Ngày**: 19/09/2026 15:20
- **Trạng thái**: Đề xuất giải pháp kiến trúc (Chờ User duyệt)
- **Phạm vi**: `ScienceJournalTrendingVN_Admin_FE` (Sidebar, Routing, Admin Dashboard & Submissions Views)

---

## 1. Vấn Đề Hiện Tại (Problem Statement)
- Menu Sidebar phân hệ Admin hiện có đồng thời cả 2 mục: **Dashboard** (`/admin/dashboard`) và **Submissions** (`/admin/submissions`).
- Cả 2 trang này phục vụ chung một mục đích:
  - `Dashboard`: Hiển thị 4 thẻ thống kê số liệu + bảng danh sách bản thảo (lấy từ `overview.priorityQueue`).
  - `Submissions`: Hiển thị thanh lọc trạng thái + bảng danh sách bản thảo có phân trang server-side (`listSubmissions`).
- **Hệ quả**:
  - Gây dư thừa nhận thức (cognitive load): Admin phân vân không biết nên xem bản thảo ở Dashboard hay ở Submissions.
  - Phân mảnh trải nghiệm: Người dùng muốn vừa xem các chỉ số tổng quan vừa lọc/tìm kiếm danh sách bản thảo đầy đủ thì phải chuyển qua lại giữa 2 trang.
  - Tương tự bài toán trước đây bên phân hệ Student (`/student/dashboard` vs `/student/my-preprints`), việc hợp nhất thành 1 tab trung tâm là giải pháp tối ưu theo chuẩn UX hệ thống xuất bản học thuật (Editorial Management Systems).

---

## 2. Đánh Giá Các Phương Án (Trade-off Analysis)

| Phương án | Chi tiết thiết kế | Ưu điểm | Nhược điểm | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **Phương án 1 (Khuyên dùng)**: Giữ tên **Submissions**, URL `/admin/submissions`, redirect `/admin/dashboard` | - Đưa 4 thẻ số liệu Metrics lên đầu trang Submissions.<br>- Phía dưới là thanh công cụ lọc (Tab pills) + Search + Sort + Bảng bản thảo có phân trang.<br>- Sidebar hiển thị **Submissions** kèm badge số bài chờ duyệt.<br>- `/admin` và `/admin/dashboard` redirect sang `/admin/submissions`. | - Đồng bộ 100% với kiến trúc Student (chuyển Dashboard vào My Manuscripts).<br>- Tên `Submissions` phản ánh chính xác nghiệp vụ quản lý bản thảo.<br>- Không làm hỏng các liên kết chia sẻ cũ (nhờ redirect 301). | Không có | **KHUYÊN DÙNG (Recommended)** |
| **Phương án 2**: Giữ tên **Dashboard**, URL `/admin/dashboard`, redirect `/admin/submissions` | - Nâng cấp Dashboard chứa toàn bộ tính năng phân trang, tìm kiếm của Submissions.<br>- Sidebar chỉ giữ mục **Dashboard**.<br>- `/admin/submissions` redirect về `/admin/dashboard`. | Giữ lại tên Dashboard quen thuộc cho quản trị viên. | Trong hệ thống xuất bản (như OJS, Elsevier, ScholarOne), menu nghiệp vụ thường ưu tiên gọi là "Submissions" thay vì Dashboard chung chung. | Khả thi nhưng kém trực diện hơn PA1 |
| **Phương án 3**: Giữ cả 2 tab nhưng Dashboard chỉ vẽ biểu đồ phân tích (Analytics Charts) | Tách biệt hẳn Dashboard thành màn hình vẽ biểu đồ doanh số/thời gian duyệt, Submissions chỉ chứa bảng. | Phân tách màn hình chuyên biệt. | Hệ thống hiện tại chưa có module BI/Charts phức tạp; over-engineering không cần thiết (vi phạm YAGNI). | Loại bỏ |

---

## 3. Thiết Kế Giải Pháp Chi Tiết (Phương Án 1 Được Khuyên Dùng)

### 3.1. Giao diện trang Submissions sau khi hợp nhất:
1. **Header**:
   - Eyebrow: `Editorial Workspace`
   - Title: `Submissions Management`
   - Description: `Track incoming manuscripts, review recommendations, and oversee publication workflows.`
2. **Hàng 4 Thẻ Số Liệu (Metrics Grid)**:
   - Thẻ 1: **Total Manuscripts** (Tổng bản thảo)
   - Thẻ 2: **In Peer Review** (Đang phản biện)
   - Thẻ 3: **Needs Revision** (Cần sinh viên sửa)
   - Thẻ 4: **Published** (Đã xuất bản)
   *(Lấy số liệu real-time từ API `adminApi.overview()` hoặc tổng hợp từ list)*
3. **Thanh công cụ lọc (Filter Toolbar)**:
   - Các Tab Pills: `All`, `In Review`, `Needs Revision`, `Published`, `Rejected` (kèm số đếm bài).
   - Ô tìm kiếm tiêu đề/tác giả + Bộ chọn sắp xếp (Recently Updated, Title, Status).
4. **Bảng Danh Sách Bản Thảo Học Thuật (`dashboard-table--repository`)**:
   - Bảng đầy đủ các cột: Manuscript, Student Author, Version, Last Updated, Status.
   - Click trực tiếp tiêu đề bài báo để vào trang chi tiết bản thảo (`/admin/submissions/:id`).
   - Phân trang server-side (`Pagination`).

### 3.2. Cập nhật Sidebar Admin (`AdminShell.tsx`):
- Nhóm `WORKSPACE`:
  - **`Submissions`** (kèm icon bản thảo + badge đếm số bài chờ duyệt `pendingCount`).
  - **`Reviews`** (kèm icon đánh giá phản biện).
- Nhóm `SYSTEM`:
  - `User accounts`
  - `Profile`

### 3.3. Điều Hướng & Routing:
- `/admin` ➔ `redirect('/admin/submissions')`
- `/admin/dashboard` ➔ `redirect('/admin/submissions')`
- Cập nhật `ROUTES.ADMIN.DASHBOARD` thành `/admin/submissions` để mọi link nội bộ tự động trỏ về trang hợp nhất.

---

## 4. Kế Hoạch Xác Minh (Verification Plan)
- Đăng nhập quyền Admin:
  - Sidebar hiển thị gọn gàng 2 mục trong Workspace: **Submissions** và **Reviews**.
  - Nhấp vào **Submissions**: Trang hiển thị trọn vẹn 4 thẻ chỉ số thống kê trên cùng, thanh lọc trạng thái và bảng danh sách bản thảo có phân trang.
  - Truy cập URL `/admin/dashboard` hoặc `/admin`: Tự động chuyển hướng mượt mà về `/admin/submissions`.
  - Kiểm tra giao diện trên Desktop, iPad (1024px) và Mobile (768px): Responsive mượt mà, không bị vỡ bố cục.
  - Kiểm tra TypeScript (`npx tsc --noEmit`) thoát mã `0`.
