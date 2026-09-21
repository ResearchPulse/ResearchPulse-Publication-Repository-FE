---
title: "Dynamic Adaptive Author Fields for Lecturer and Student (URL auto-detect & MSGV label)"
status: completed
priority: P1
effort: "30m"
created: "2026-09-21"
---

# Plan: Dynamic Adaptive Author Fields for Lecturer and Student

## Overview
1. Khi ở URL `/lecturer/*`, tự động nhận diện vai trò tác giả là Giảng viên (`LECTURER`).
2. Thay thế nhãn `Mã giảng viên / Cán bộ (Staff ID)` bằng `Mã Số Giảng Viên (MSGV)`.

## Phases
| Phase | Title | Status |
| :--- | :--- | :--- |
| 1 | Dynamic Adaptive Fields & URL Auto-detection & MSGV Label | completed |

## Related Code Files
- Modify: `src/features/preprint/views/PreprintEditorView.tsx`
- Modify: `src/features/lecturer/views/LecturerProfileView.tsx`
- Modify: `src/shared/types/index.ts`
