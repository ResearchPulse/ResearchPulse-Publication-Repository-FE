---
title: "Hệ thống Thông báo Thời gian thực (Real-time Notification System với Fastify SSE)"
date: "2026-09-20"
status: "completed"
mode: "default"
brainstorm: "docs/brainstorm/2026-09-20-notification-system-sse.md"
phases:
  - id: "01"
    name: "Database Schema & Prisma Migration"
    status: "completed"
    file: "phase-01-database-schema-and-migration.md"
  - id: "02"
    name: "Backend Notification Service, SSE Stream & REST Endpoints"
    status: "completed"
    file: "phase-02-backend-notification-service-and-sse.md"
  - id: "03"
    name: "Backend Event Triggers Integration (6 Workflows)"
    status: "completed"
    file: "phase-03-backend-event-triggers-integration.md"
  - id: "04"
    name: "Frontend Hook useNotifications & API Client"
    status: "completed"
    file: "phase-04-frontend-use-notifications-hook.md"
  - id: "05"
    name: "Frontend NotificationBell Component & Topbar Integration"
    status: "completed"
    file: "phase-05-frontend-topbar-notification-ui.md"
  - id: "06"
    name: "End-to-End Verification & Real-time QA"
    status: "completed"
    file: "phase-06-end-to-end-verification.md"
---

# Plan: Hệ thống Thông báo Thời gian thực (In-app Notification System với Fastify SSE)

## 1. Tổng quan (Overview)
Triển khai trung tâm thông báo thời gian thực đa vai trò (Student, Lecturer, Admin) phục vụ toàn bộ chu trình nộp bài, phân công phản biện, chấm bài, phản hồi và duyệt xuất bản.
- **Backend**: Fastify Server-Sent Events (SSE) stream + Prisma `Notification` model + PostgreSQL.
- **Frontend**: Custom hook `useNotifications()` tích hợp React Query + `EventSource`, component `NotificationBell` đồng bộ trên `StudentTopbar`, `LecturerShell` và `AdminShell`.

## 2. Kế hoạch triển khai (Roadmap)

| Phase | Mô tả chi tiết | Trạng thái |
|---|---|---|
| **Phase 01** | Bổ sung model `Notification` và enum `NotificationType` vào Prisma, chạy migration | Pending |
| **Phase 02** | Xây dựng `NotificationService`, SSE Connection Manager và các route REST API | Pending |
| **Phase 03** | Tích hợp 6 triggers tự động kích hoạt thông báo vào các module nghiệp vụ BE | Pending |
| **Phase 04** | Xây dựng custom hook `useNotifications` quản lý kết nối `EventSource` và cache React Query | Pending |
| **Phase 05** | Hoàn thiện UI `NotificationBell` và gắn vào Topbar của Student, Lecturer, Admin | Pending |
| **Phase 06** | Kiểm thử End-to-End đa vai trò thời gian thực và xác thực kết nối | Pending |
