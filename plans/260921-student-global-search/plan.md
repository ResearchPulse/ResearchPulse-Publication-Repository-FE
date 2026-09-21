---
title: "Student Global Search Activation & Realtime Bi-directional Sync"
status: completed
priority: P1
effort: "25m"
created: "2026-09-21"
---

# Plan: Student Global Search Activation & Realtime Bi-directional Sync

## Overview
1. Khắc phục lỗi đúp dấu `x` trên Topbar.
2. Tự động tìm kiếm realtime (không cần ấn Enter) khi ở trang danh sách bản thảo/kho bài báo.
3. Đồng bộ 2 chiều (Bi-directional Sync) tức thì giữa ô Topbar và ô Toolbar bảng.

## Phases
| Phase | Title | Status |
| :--- | :--- | :--- |
| 1 | Topbar Global Search & SearchParams Sync | completed |
| 2 | Realtime Instant Filter & Bi-directional Sync | completed |

## Related Code Files
- Modify: `src/features/preprint/components/StudentTopbar.tsx`
- Modify: `src/features/preprint/views/PreprintListView.tsx`
- Modify: `src/features/preprint/views/StudentPublishedView.tsx`
- Modify: `src/features/preprint/styles/paper-student.css`
