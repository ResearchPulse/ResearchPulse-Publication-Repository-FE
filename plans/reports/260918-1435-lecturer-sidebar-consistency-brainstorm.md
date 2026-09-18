---
title: "Brainstorm: Đồng Nhất Thiết Kế Sidebar Giảng Viên (Lecturer) với Sinh Viên (Student)"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: LecturerShell.tsx, lecturer-layout.css, StudentSidebar.tsx"
---

# Báo Cáo Brainstorming: Đồng Nhất Thiết Kế Sidebar Giảng Viên Chuẩn Student Design System

## 1. Khảo Sát Hiện Trạng Codebase & UI

Dựa trên ảnh chụp thực tế màn hình `/lecturer/reviews` và đối chiếu giữa hai tệp [`LecturerShell.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/components/LecturerShell.tsx) và [`StudentSidebar.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/components/StudentSidebar.tsx):

### Các điểm lệch pha thiết kế giữa Lecturer Sidebar và Student Sidebar:

1. **Logo & Brand Header**:
   - **Student**: Sử dụng Logo Lockup dạng ngang gồm biểu tượng SVG thương hiệu Hyperdata (32x32 rx=8 `#0071bc` với 3 vạch trắng) đi cùng tên `hyperlabdata` (17.5px font-weight 800) và phụ đề học thuật `Scholar Portal` (10px uppercase `#0071bc`). Ngăn cách bởi đường line mảnh `#f1f5f9`.
   - **Lecturer (hiện tại)**: Dùng `BrandMark` từ design system xếp dọc, bên dưới là dòng text `REVIEWER WORKSPACE` màu xanh rời rạc, không có đường kẻ ngăn cách tinh tế.

2. **Khoảng cách & Bố cục (Layout & Spacing)**:
   - **Student**: Chiều rộng chuẩn `260px`, `position: sticky`, `top: 0`, `height: 100vh`. Bố cục 3 phần rõ ràng: Brand Header -> Navigation cuộn tự do (`flex: 1; overflow-y: auto`) -> Footer cố định ở đáy.
   - **Lecturer (hiện tại)**: Chiều rộng `248px`, khoảng cách giữa các phần bị hardcode khoảng trống quá lớn (`gap: 42px`), các mục bị rời rạc, trơ trọi khi danh sách chỉ có 1 mục menu.

3. **Menu Items & Trạng Thái Kích Hoạt (Active & Hover States)**:
   - **Student**: Item bo góc mềm mại (`border-radius: 8px`), font chữ 13.5px (`font-weight: 600`), icon SVG 18x18 thanh thoát. Khi Active: nền xanh nhạt êm dịu (`background: #e0f2fe; color: #0071bc; font-weight: 700;`). Hỗ trợ hiển thị Badge số lượng (pill badge `#e2e8f0` hoặc alert badge cam).
   - **Lecturer (hiện tại)**: Item bo góc `6px`, font 14px, hiệu ứng active có animation trượt ngang `transform: translateX(2px)` gây cảm giác xộc xệch so với chuẩn thiết kế phẳng hiện đại. Chưa có badge hiển thị số lượng bài cần phản biện.

4. **Footer & Thẻ Người Dùng (User Profile Card)**:
   - **Student**: Đáy sidebar tích hợp sẵn **Profile Card**: Avatar tròn chữ cái viết tắt có chấm xanh Online (`#22c55e`), tên người dùng ("Dr. Alan Turing"), email/chức danh ("Faculty Reviewer"), nút Đăng xuất (`Sign Out`) trực tiếp với tooltip và hiệu ứng hover đỏ dịu.
   - **Lecturer (hiện tại)**: Đáy sidebar chỉ có một đoạn text tĩnh *"Faculty review: Your recommendation informs the administrator's final decision."* dính sát góc dưới. Thông tin người dùng lại đang nằm lơ lửng trên Topbar.

---

## 2. Đề Xuất Các Phương Án Nâng Cấp

### 🌟 Phương Án 1 (Khuyến nghị cao nhất - Đồng Bộ Hoàn Hảo & Trải Nghiệm Học Thuật Đẳng Cấp):
* **Kiến trúc & Brand Lockup**:
  - Chuẩn hóa chiều rộng `260px` sticky `100vh`, nền trắng `#ffffff`, viền phải `#e2e8f0`.
  - Brand Header: Logo Lockup ngang chuẩn Hyperdata + `hyperlabdata` (17.5px font-800) + Phụ đề định danh `Reviewer Portal` (hoặc `Faculty Workspace` 10px uppercase `#0071bc`). Đường kẻ đáy `#f1f5f9`.
* **Cấu trúc Nhóm Điều Hướng (Navigation Group)**:
  - Tiêu đề nhóm `WORKSPACE` (10px, font-800, `#94a3b8`, letter-spacing 0.08em).
  - Link `Review queue` với icon tài liệu/kính lúp chuẩn học thuật, bo góc `8px`, padding `9px 12px`.
  - Active state: Nền `#e0f2fe`, chữ & icon xanh `#0071bc`, font 700, bỏ hiệu ứng translateX.
  - **Bổ sung Badge đếm bài**: Hiển thị số lượng bản thảo đang chờ phản biện (ví dụ badge số `1` hoặc số bài `Awaiting Review` thực tế) giúp giảng viên nắm bắt ngay công việc.
* **Footer Đáy Sidebar - Profile Card & Advisory Badge**:
  - Tích hợp **User Profile Card** chuẩn mực ở chân sidebar: Avatar tròn nền `#0071bc` với ký tự đầu ("AT"), chấm xanh Online (`#22c55e`), tên ("Dr. Alan Turing"), chức danh ("Faculty Reviewer"), nút Đăng xuất nhanh.
  - Bổ sung một mini-callout trang nhã phía trên profile card: *"Faculty Peer Review — Independent Advisory"*, vừa giữ thông điệp hướng dẫn nhưng cực kỳ gọn gàng, không bị chiếm diện tích.
* **Ưu điểm**:
  - Giao diện đạt độ nhất quán 100% giữa vai trò Sinh viên và Giảng viên về mặt thị giác (Typography, Color Palette, Spacing).
  - Cực kỳ chuyên nghiệp, tạo cảm giác một nền tảng tạp chí khoa học hoàn chỉnh.

---

### Phương Án 2 (Đồng Bộ Triệt Để 1:1 với Student - Tinh Giản Footer):
* Chuyển đổi cấu trúc Lecturer Sidebar giống hệt `StudentSidebar`.
* Bỏ hoàn toàn đoạn chữ tĩnh *"Faculty review: Your recommendation informs..."* ở footer sidebar (vì thông điệp này vốn dĩ đã có banner màu xanh thông báo ngay đầu bảng Review Queue: *"Advisory Peer Review: Your evaluation and recommendations..."*).
* Đáy sidebar chỉ giữ lại User Profile Card (Avatar + Tên + Chức danh + Đăng xuất).
* **Ưu điểm**: Siêu tối giản, thanh thoát, giảm tối đa các thành phần chữ thừa.
* **Nhược điểm**: Bỏ bớt dòng nhắc nhở vai trò cố vấn (dù đã có trên trang).

---

### Phương Án 3 (Chỉ Tinh Chỉnh CSS - Giữ Nguyên Cấu Trúc Hiện Tại):
* Giữ nguyên các thẻ JSX hiện tại trong `LecturerShell.tsx`.
* Chỉ chỉnh sửa mã CSS trong `lecturer-layout.css`:
  - Đổi màu active sang `#e0f2fe` và `#0071bc`.
  - Đổi bo góc từ `6px` thành `8px`.
  - Đổi font-size, font-weight và bỏ hiệu ứng `translateX(2px)`.
  - Giảm khoảng cách `gap: 42px` xuống khoảng cách hợp lý.
* **Ưu điểm**: Tác động ít file nhất, làm nhanh nhất.
* **Nhược điểm**: Sidebar vẫn bị trống trải, thiếu Profile Card chân trang, logo vẫn xếp dọc không đồng bộ phong cách với Student.

---

## 3. Bảng So Sánh Chi Tiết Các Phương Án

| Tiêu Chí | Phương Án 1 (Khuyến Nghị) | Phương Án 2 (Tinh Giản 1:1) | Phương Án 3 (Chỉ Đổi CSS) |
| :--- | :--- | :--- | :--- |
| **Độ đồng bộ với Student** | ⭐⭐⭐⭐⭐ Hoàn hảo | ⭐⭐⭐⭐⭐ Hoàn hảo | ⭐⭐⭐ Trung bình |
| **Brand Lockup** | Ngang chuẩn Hyperdata | Ngang chuẩn Hyperdata | Dọc (cũ) |
| **Active Style** | Nền `#e0f2fe`, chữ `#0071bc` | Nền `#e0f2fe`, chữ `#0071bc` | Nền `#e0f2fe`, chữ `#0071bc` |
| **Badge số lượng** | Có (Đếm số bài chờ duyệt) | Có (Đếm số bài chờ duyệt) | Không |
| **User Profile Footer** | Có (Kèm mini role badge) | Có (Chuẩn Student) | Không (Nằm trên topbar) |
| **Độ thẩm mỹ & Hiện đại** | Cao cấp, chuẩn hệ thống | Gọn gàng, tối giản | Bình thường |
