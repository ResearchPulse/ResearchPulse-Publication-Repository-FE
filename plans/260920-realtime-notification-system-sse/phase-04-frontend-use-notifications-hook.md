---
phase: "04"
title: "Frontend Hook useNotifications & API Client"
status: pending
priority: P1
effort: "1h"
dependencies: ["02"]
---

# Phase 04: Frontend Hook useNotifications & API Client

## Overview
Xây dựng API client và custom hook `useNotifications` trong Frontend (`ScienceJournalTrendingVN_Admin_FE`), quản lý state thông báo, số lượng chưa đọc, gọi API mark-as-read và kết nối SSE thời gian thực qua `EventSource`.

## Requirements
- Functional:
  - Lấy danh sách thông báo và số lượng unread ban đầu qua `@tanstack/react-query`.
  - Thiết lập kết nối `EventSource('/api/notifications/stream')` tự động khi người dùng đã đăng nhập.
  - Khi có thông báo mới qua SSE:
    - Cập nhật trực tiếp vào danh sách thông báo của React Query.
    - Tăng `unreadCount` lên 1.
    - Cung cấp cờ `hasNewArrival` để kích hoạt hiệu ứng rung chuông trên UI.
  - Cung cấp các hàm action: `markAsRead(id)`, `markAllAsRead()`, `refetch()`.
- Non-functional: Tự động dọn dẹp `eventSource.close()` khi component unmount hoặc logout, tự động tái kết nối khi rớt mạng.

## Related Code Files
- Create: `ScienceJournalTrendingVN_Admin_FE/src/shared/api/notificationApi.ts`
- Create: `ScienceJournalTrendingVN_Admin_FE/src/shared/hooks/useNotifications.ts`
- Create: `ScienceJournalTrendingVN_Admin_FE/src/shared/types/notification.ts`

## Implementation Steps
1. Định nghĩa TypeScript types cho `Notification`, `NotificationType`, `NotificationResponse`.
2. Tạo `notificationApi.ts`:
   - `fetchNotifications(params)`
   - `fetchUnreadCount()`
   - `markNotificationAsRead(id)`
   - `markAllNotificationsAsRead()`
3. Tạo hook `useNotifications()`:
   - Sử dụng `useQuery` cho `unreadCount` và `notifications`.
   - `useEffect` lắng nghe SSE stream từ Backend:
     ```ts
     const es = new EventSource(`${API_BASE}/api/notifications/stream`, { withCredentials: true });
     es.onmessage = (event) => {
       const newNotif = JSON.parse(event.data);
       // prepend new notification to query cache
       // increment unread count
     };
     ```
   - Xử lý `es.onerror` và retry.

## Success Criteria
- [ ] Hook nhận và parse thành công dữ liệu thông báo từ BE.
- [ ] Khi trigger event tại BE, FE hook nhận dữ liệu tức thì không cần refresh trang.
