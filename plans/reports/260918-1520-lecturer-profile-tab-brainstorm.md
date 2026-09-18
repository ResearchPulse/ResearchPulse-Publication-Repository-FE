---
title: "Brainstorm: Thêm Tab / Mục Profile Cho Giảng Viên (Lecturer Academic Profile)"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: LecturerShell.tsx, routePaths.ts, LecturerProfileView.tsx"
---

# Báo Cáo Brainstorming: Thêm Tab / Trang Profile Cho Giảng Viên (Lecturer Profile)

## 1. Khảo Sát Hiện Trạng Codebase

1. **Routing hiện tại (`routePaths.ts`)**:
   - `ROUTES.LECTURER` hiện chỉ có `ROOT: '/lecturer'`, `REVIEWS: '/lecturer/reviews'`, và `REVIEW_DETAIL`.
   - Chưa có route cho `PROFILE: '/lecturer/profile'`.
2. **Sidebar hiện tại (`LecturerShell.tsx`)**:
   - Nhóm `WORKSPACE` chỉ có duy nhất 1 mục: `Review queue`.
   - Profile Card ở chân sidebar hiện chỉ hiển thị avatar + tên + email + nút logout, chưa thể bấm vào để xem hoặc chỉnh sửa hồ sơ.
3. **Dữ liệu tài khoản (`useAuth`)**:
   - Cung cấp: `user.name`, `user.email`, `user.role`, `user.id`.

---

## 2. Các Phương Án Đề Xuất

### 🌟 Phương Án 1 (Khuyến nghị cao nhất — Mục Menu Sidebar + Trang Hồ Sơ Học Thuật Chuẩn Mực):
* **Vị trí trên Sidebar (`LecturerShell.tsx`)**:
  - Thêm mục **Profile** ngay trong Sidebar Navigation:
    ```
    WORKSPACE
    ├── 📋 Review queue     (1)
    └── 👤 Academic Profile
    ```
  - Đồng thời biến khối **Profile Card** ở chân sidebar thành dạng clickable để bấm trực tiếp vào `/lecturer/profile`.
* **Giao Diện Trang `/lecturer/profile` (`LecturerProfileView.tsx`)**:
  - Sử dụng layout `LecturerShell active="profile" title="Academic Profile"`.
  - **Khối 1: Thông tin học thuật (Academic Identity Card)**:
    - Avatar chữ cái lớn, Họ và tên (Dr. Alan Turing), Học hàm/Học vị (Associate Professor / PhD in Computer Science).
    - Email liên hệ, Đơn vị công tác (Department of Computer Science / Hyperdata Lab).
    - Huy hiệu xác thực chuyên gia (`Verified Faculty Reviewer`).
  - **Khối 2: Lĩnh vực chuyên môn & Từ khóa phản biện (Expertise & Disciplines)**:
    - Các lĩnh vực phụ trách nhận phản biện: `Artificial Intelligence`, `Natural Language Processing`, `Distributed Systems`.
    - Trạng thái nhận phản biện: Badge bật/tắt `Accepting Review Requests: Active`.
  - **Khối 3: Thống kê hoạt động phản biện (Peer Review Track Record)**:
    - 3 thẻ thống kê: Tổng số bài đã phản biện (`Completed Reviews: 12`), Bản thảo đang chờ phản biện (`In Review: 1`), Thời gian phản hồi trung bình (`Avg Turnaround: 36h`).
* **Ưu điểm**:
  - Tự nhiên, chuẩn cấu trúc của tất cả các hệ thống học thuật / SaaS hiện đại.
  - Tận dụng tối đa không gian sidebar hiện đang hơi trống vì chỉ có 1 link.

---

### Phương Án 2 (Tab Nằm Cùng Cấp Với Review Queue Trong Content Header):
* Thay vì tạo trang riêng ở sidebar, đặt Tab Switcher ngay trên đầu nội dung trang `/lecturer`:
  - Tab 1: `Review Queue (1)`
  - Tab 2: `Faculty Profile`
* Khi bấm Tab Profile, nội dung bên dưới chuyển sang hiển thị thẻ hồ sơ của giảng viên.
* **Ưu điểm**: Không cần đổi route URL.
* **Nhược điểm**: Làm phức tạp trang quản lý hàng đợi phản biện, không đúng chuẩn phân tách module.

---

### Phương Án 3 (Modal Popup Profile Khi Bấm Vào Profile Card):
* Giữ nguyên sidebar chỉ có `Review queue`.
* Khi click vào Profile Card ở chân sidebar, mở một Dialog/Modal pop-up hiển thị thông tin hồ sơ giảng viên.
* **Ưu điểm**: Giữ sidebar tối giản.
* **Nhược điểm**: Không gian modal bị giới hạn, không có URL trực tiếp (`/lecturer/profile`), khó mở rộng các tính năng cập nhật hồ sơ sau này.
