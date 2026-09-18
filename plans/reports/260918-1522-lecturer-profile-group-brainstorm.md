---
title: "Brainstorm: Nhóm Điều Hướng PROFILE Trên Sidebar Giảng Viên"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: LecturerShell.tsx, routePaths.ts, LecturerProfileView.tsx"
---

# Báo Cáo Brainstorming: Tích Hợp Nhóm Menu PROFILE & Trang Hồ Sơ Giảng Viên

## 1. Cấu Trúc Yêu Cầu Từ Người Dùng

Dựa trên yêu cầu điều chỉnh chính xác của bạn:

1. **Cấu trúc Sidebar Navigation**:
   Phân tách thành 2 nhóm rõ ràng với tiêu đề nhóm in hoa chuẩn mực:
   ```text
   WORKSPACE
   └── 📋 Review queue     1

   PROFILE
   └── 👤 Profile
   ```
2. **Profile Card ở Chân Sidebar**:
   - **Giữ nguyên dạng hiển thị thông tin tĩnh**: Không làm thành link click chuyển trang, chỉ giữ vai trò hiển thị avatar + tên + email và nút Đăng xuất nhanh (`Sign Out`).
3. **Mục Profile trên Sidebar**:
   - Nhấp vào mục `Profile` sẽ điều hướng đến `/lecturer/profile`.
   - Trạng thái active sẽ sáng xanh `#e0f2fe` và `#0071bc` như các mục khác.

---

## 2. Kế Hoạch Thiết Kế Trang `/lecturer/profile`

Trang Hồ Sơ Học Thuật Giảng Viên ([`LecturerProfileView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/views/LecturerProfileView.tsx)):
* **Header**: Sử dụng layout `LecturerShell active="profile" title="Profile"` với breadcrumb `Reviewer Workspace / Profile`.
* **Profile Hero Card (Thẻ danh tính học giả)**:
  - Avatar tròn lớn `AT` (Dr. Alan Turing), Huy hiệu bảo chứng `Verified Faculty Reviewer`.
  - Học hàm/Học vị: Phó giáo sư, Tiến sĩ (Associate Professor, Ph.D.).
  - Đơn vị công tác: Khoa Công nghệ Thông tin, Hyperdata Lab.
  - Email: `user?.email || 'alan.turing@hyperdata.org'`.
* **Thông Tin Học Thuật & Chuyên Môn Phản Biện**:
  - Mã định danh học thuật: ORCID `0000-0002-1825-0097`, Reviewer ID `REV-2026-0842`.
  - Các chuyên ngành phụ trách phản biện: `Artificial Intelligence`, `Machine Learning`, `Natural Language Processing`, `Distributed Computing`.
  - Trạng thái nhận bản thảo: Huy hiệu `Active (Accepting Review Assignments)`.
  - Thời gian phản hồi cam kết (SLA): `48–72 Giờ`.
* **Thống Kê Hoạt Động Phản Biện (Peer Review Metrics)**:
  - Bản thảo đã phản biện: `12`
  - Bản thảo đang đánh giá: `1`
  - Tỷ lệ hoàn thành đúng hạn: `98% On-Time SLA`

---

## 3. Các Tệp Sẽ Triển Khai

1. [`src/app/router/routePaths.ts`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/router/routePaths.ts): Thêm `PROFILE: '/lecturer/profile'`.
2. [`src/features/lecturer/components/LecturerShell.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/components/LecturerShell.tsx):
   - Mở rộng `LecturerNavKey = 'reviews' | 'profile'`.
   - Thêm nhóm `PROFILE` với mục menu `Profile`.
   - Giữ Profile Card chân trang là thông tin tĩnh.
3. [`src/features/lecturer/views/LecturerProfileView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/views/LecturerProfileView.tsx): Xây dựng giao diện hồ sơ giảng viên học thuật cao cấp.
4. [`src/features/lecturer/views/index.ts`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/views/index.ts): Export `LecturerProfileView`.
5. [`src/app/lecturer/profile/page.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/lecturer/profile/page.tsx): Route trang Next.js App Router cho `/lecturer/profile`.
