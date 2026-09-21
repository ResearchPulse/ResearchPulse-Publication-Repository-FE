---
phase: 2
title: "Realtime Instant Filter & Bi-directional Sync"
status: completed
priority: P1
effort: "25m"
dependencies: ["1"]
---

# Phase 2: Realtime Instant Filter & Bi-directional Sync

## Overview
Đã loại bỏ hoàn toàn nút `x` bị đúp, triển khai live filter realtime khi gõ (không cần ấn Enter) và đồng bộ 2 chiều tức thì giữa Topbar và Table.

## Requirements
- Functional:
  - [x] Ô tìm kiếm Topbar chỉ có 1 nút `×` duy nhất, không có đúp `x x`.
  - [x] Khi gõ ở Topbar, bảng tự động lọc realtime ngay lập tức (không cần nhấn Enter).
  - [x] Đồng bộ 2 chiều: gõ/xóa ở Topbar -> Table cập nhật; gõ/xóa ở Table -> Topbar cập nhật.
- Non-functional:
  - [x] `npx tsc --project tsconfig.json --noEmit` đạt 0 lỗi.

## Related Code Files
- Modified: `src/features/preprint/components/StudentTopbar.tsx`
- Modified: `src/features/preprint/views/PreprintListView.tsx`
- Modified: `src/features/preprint/views/StudentPublishedView.tsx`
- Modified: `src/features/preprint/styles/paper-student.css`

## Success Criteria
- [x] Không còn dấu `x` bị đúp trên Topbar.
- [x] Danh sách lọc ngay khi gõ vào Topbar (instant filter).
- [x] 2 ô tìm kiếm luôn khớp giá trị của nhau.
