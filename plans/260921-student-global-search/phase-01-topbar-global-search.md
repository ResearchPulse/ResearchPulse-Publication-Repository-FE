---
phase: 1
title: "Topbar Global Search & SearchParams Sync"
status: completed
priority: P1
effort: "20m"
dependencies: []
---

# Phase 1: Topbar Global Search & SearchParams Sync

## Overview
Đã kích hoạt form tìm kiếm trong `StudentTopbar.tsx` và đồng bộ query param `?search=...` cho `PreprintListView.tsx` và `StudentPublishedView.tsx`.

## Requirements
- Functional:
  - [x] Ô tìm kiếm trên Topbar nhập được từ khóa và nhấn Enter để điều hướng kèm query param `?search=...`.
  - [x] Danh sách bài báo (`PreprintListView`, `StudentPublishedView`) tự động nhận `searchParams` và lọc tức thì.
  - [x] Hỗ trợ nút xóa nhanh `×` trên Topbar và trên Toolbar bảng danh sách.
- Non-functional:
  - [x] `npx tsc --project tsconfig.json --noEmit` đạt 0 lỗi.
  - [x] `npm run build` đạt 26/26 routes thành công.

## Related Code Files
- Modified: `src/features/preprint/components/StudentTopbar.tsx`
- Modified: `src/features/preprint/views/PreprintListView.tsx`
- Modified: `src/features/preprint/views/StudentPublishedView.tsx`

## Success Criteria
- [x] Topbar search input gửi được từ khóa qua query string `?search=...`.
- [x] `PreprintListView` và `StudentPublishedView` tự động lọc theo query param từ URL.
- [x] `npm run build` thành công 100%.
