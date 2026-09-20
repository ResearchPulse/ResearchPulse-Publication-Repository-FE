---
phase: "02"
title: "Backend Notification Service, SSE Stream & REST Endpoints"
status: pending
priority: P1
effort: "1h30m"
dependencies: ["01"]
---

# Phase 02: Backend Notification Service, SSE Stream & REST Endpoints

## Overview
Xây dựng module `notification` trong Backend bao gồm: service quản lý thông báo, SSE Connection Manager (heartbeat 25s, multiplexing theo userId/role), controller, schema và routes.

## Requirements
- Functional:
  - `GET /api/notifications`: Lấy danh sách thông báo phân trang của user hiện tại.
  - `GET /api/notifications/unread-count`: Đếm số lượng thông báo chưa đọc.
  - `PATCH /api/notifications/:id/read`: Đánh dấu 1 thông báo đã đọc.
  - `PATCH /api/notifications/read-all`: Đánh dấu tất cả thông báo của user đã đọc.
  - `GET /api/notifications/stream`: Endpoint SSE kết nối thời gian thực qua `text/event-stream`.
- Non-functional: Quản lý bộ nhớ tốt cho các kết nối SSE mở, dọn dẹp kết nối khi client đóng tab.

## Related Code Files
- Create: `ScienceJournalTrendingVN_Public_BE/src/modules/notification/notification.service.ts`
- Create: `ScienceJournalTrendingVN_Public_BE/src/modules/notification/sse-manager.ts`
- Create: `ScienceJournalTrendingVN_Public_BE/src/modules/notification/notification.controller.ts`
- Create: `ScienceJournalTrendingVN_Public_BE/src/modules/notification/notification.schema.ts`
- Create: `ScienceJournalTrendingVN_Public_BE/src/modules/notification/notification.route.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/app.ts` (đăng ký notification route)

## Implementation Steps
1. Tạo `sse-manager.ts`: Quản lý `Map<string, Set<FastifyReply>>`, phương thức `sendToUser(userId, payload)`, `broadcastToUsers(userIds, payload)`, heartbeat interval 25s (`: ping\n\n`), dọn dẹp khi request socket đóng.
2. Tạo `notification.service.ts`:
   - `createNotification(userId, data)`: Tạo DB record và đẩy vào SSE stream của `userId`.
   - `notifyAdmins(data)`: Lấy all admin active, `createMany`, đẩy SSE stream cho các admin online.
   - `listNotifications(userId, query)`
   - `getUnreadCount(userId)`
   - `markAsRead(userId, notificationId)`
   - `markAllAsRead(userId)`
3. Tạo `notification.controller.ts` và `notification.route.ts`: Bảo vệ bằng hook xác thực JWT cookie/bearer.
4. Đăng ký module trong `src/app.ts`.

## Success Criteria
- [ ] Endpoint `/api/notifications/stream` giữ kết nối mở và gửi heartbeat định kỳ.
- [ ] Các API danh sách, đếm chưa đọc, đánh dấu đã đọc hoạt động chuẩn xác qua Swagger hoặc Postman/curl.
