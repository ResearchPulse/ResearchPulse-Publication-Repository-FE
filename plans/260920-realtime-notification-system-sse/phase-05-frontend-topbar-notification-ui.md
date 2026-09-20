---
phase: "05"
title: "Frontend NotificationBell Component & Topbar Integration"
status: pending
priority: P1
effort: "1h30m"
dependencies: ["04"]
---

# Phase 05: Frontend NotificationBell Component & Topbar Integration

## Overview
Xây dựng component `NotificationBell` dùng chung với giao diện hiện đại (badge số lượng, popover dropdown danh sách, icon theo từng loại thông báo, thời gian tương đối, click điều hướng và mark read), tích hợp vào thanh Topbar của cả 3 role: Student, Lecturer và Admin.

## Requirements
- Functional:
  - Hiển thị biểu tượng chuông + badge số lượng chưa đọc (ẩn khi unread = 0).
  - Popover dropdown có thể click mở/đóng, bấm ra ngoài (click outside) hoặc bấm phím Escape tự đóng.
  - Nút "Đánh dấu tất cả đã đọc" ở header popover.
  - Mỗi item trong danh sách:
    - Icon đặc trưng theo loại (nộp bài, phân công, review hoàn thành, xuất bản,...).
    - Tiêu đề in đậm, mô tả chi tiết, thời gian tương đối (ví dụ: "vừa xong", "10 phút trước").
    - Dấu chấm xanh báo hiệu chưa đọc.
    - Click vào item: tự động gọi `markAsRead` và dùng `router.push(item.link)` chuyển hướng đến đúng trang.
  - State rỗng (Empty state) đẹp mắt khi không có thông báo nào.
- Non-functional: Đảm bảo accessibility, responsive trên thiết bị di động, mượt mà chuẩn design system.

## Related Code Files
- Create: `ScienceJournalTrendingVN_Admin_FE/src/shared/components/NotificationBell.tsx`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/preprint/components/StudentTopbar.tsx`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/components/LecturerShell.tsx`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/admin/components/AdminShell.tsx`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/preprint/styles/paper-student.css`

## Implementation Steps
1. Xây dựng component `NotificationBell.tsx` sử dụng hook `useNotifications()`.
2. Format thời gian tương đối bằng hàm tiện ích hoặc i18n đa ngôn ngữ (vi/en).
3. Tích hợp `NotificationBell` vào:
   - `StudentTopbar.tsx` thay thế mock dropdown hiện tại.
   - `LecturerShell.tsx` thay thế mock dropdown hiện tại.
   - `AdminShell.tsx` bổ sung vào khu vực `student-topbar__right` kèm thanh tìm kiếm chuẩn hóa.
4. Tinh chỉnh CSS để dropdown popover hiển thị đồng bộ, shadow nhẹ nhàng, không bị tràn màn hình mobile.

## Success Criteria
- [x] Giao diện chuông và popover hiển thị đồng nhất, chuẩn đẹp trên cả 3 role.
- [x] Click thông báo chuyển trang chính xác và biến mất chấm chưa đọc.
- [x] Nút "Đánh dấu tất cả đã đọc" hoạt động tức thì.
