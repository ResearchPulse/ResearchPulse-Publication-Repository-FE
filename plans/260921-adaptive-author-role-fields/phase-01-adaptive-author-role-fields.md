---
phase: 1
title: "Dynamic Adaptive Fields & URL Auto-detection & MSGV Label"
status: completed
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Dynamic Adaptive Fields in PreprintEditorView & LecturerProfileView

## Overview
Cập nhật tự động nhận diện vai trò Giảng viên (`LECTURER`) khi truy cập URL `/lecturer/*`, chuyển đổi nhãn, gợi ý placeholder và thông báo trợ giúp động giữa Sinh viên (`MSSV`) và Giảng viên (`MSGV`).

## Requirements
- Functional:
  - Khi ở URL `/lecturer/*`, tự động nhận diện Vai trò là Giảng viên cho tác giả chính và form thêm đồng tác giả.
  - Thay thế nhãn `Mã giảng viên / Cán bộ (Staff ID)` bằng `Mã Số Giảng Viên (MSGV)`.
  - Placeholder đổi thành `Ví dụ: MSGV0042`.
  - Hiển thị trên thẻ tác giả: `MSGV: ${studentId}`.
  - Hồ sơ Giảng viên (`LecturerProfileView.tsx`) hiển thị nhãn `Mã Số Giảng Viên (MSGV)`.
- Non-functional:
  - Giữ nguyên cấu trúc cơ sở dữ liệu `student_id`.
  - Typecheck sạch 0 lỗi.

## Related Code Files
- Modified: `src/features/preprint/views/PreprintEditorView.tsx`
- Modified: `src/features/lecturer/views/LecturerProfileView.tsx`
- Modified: `src/shared/types/index.ts`

## Success Criteria
- [x] Modal chỉnh sửa tác giả tự động nhận diện vai trò Giảng viên khi ở URL `/lecturer/*`.
- [x] Form thêm đồng tác giả mặc định vai trò Giảng viên và placeholder MSGV khi ở URL `/lecturer/*`.
- [x] Nhãn trường hiển thị chuẩn `Mã Số Giảng Viên (MSGV)`.
- [x] `LecturerProfileView.tsx` hiển thị `Mã Số Giảng Viên (MSGV)`.
- [x] `npx tsc --project tsconfig.json --noEmit` đạt 0 lỗi.
