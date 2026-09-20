---
phase: "01"
title: "Database Schema & Prisma Migration"
status: pending
priority: P1
effort: "30m"
dependencies: []
---

# Phase 01: Database Schema & Prisma Migration

## Overview
Định nghĩa bảng lưu trữ `Notification` và enum `NotificationType` trong Prisma schema của Backend, chạy migration PostgreSQL và generate Prisma client.

## Requirements
- Functional: Lưu trữ thông báo theo từng người dùng (`userId`), trạng thái đọc (`isRead`), đường dẫn điều hướng (`link`), metadata chi tiết (JSON).
- Non-functional: Tối ưu index trên `(userId, isRead)` và `(userId, createdAt)` để truy vấn nhanh số lượng chưa đọc và phân trang.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Public_BE/prisma/schema.prisma`

## Implementation Steps
1. Mở `ScienceJournalTrendingVN_Public_BE/prisma/schema.prisma`.
2. Khai báo enum `NotificationType`:
   - `SUBMISSION_CREATED`
   - `SUBMISSION_REVISED`
   - `REVIEW_ASSIGNED`
   - `REVIEW_COMPLETED`
   - `PUBLICATION_APPROVED`
   - `PUBLICATION_REJECTED`
   - `REVISION_REQUESTED`
   - `USER_REGISTERED`
   - `SYSTEM`
3. Thêm model `Notification` có quan hệ với `User` (onDelete: Cascade).
4. Thêm quan hệ `notifications Notification[]` vào model `User`.
5. Chạy `npx prisma migrate dev --name add_notification_model` (hoặc `npx prisma db push` + `npx prisma generate`).

## Success Criteria
- [ ] Prisma client sinh thành công types cho `Notification` và `NotificationType`.
- [ ] Bảng `notifications` tồn tại trong cơ sở dữ liệu PostgreSQL.
