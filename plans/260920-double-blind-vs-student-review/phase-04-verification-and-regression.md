---
phase: 4
title: "End-to-End Verification & Regression Suite"
status: completed
priority: P1
effort: "30m"
dependencies: ["03"]
---

# Phase 4: End-to-End Verification & Regression Suite

## Overview
Chạy toàn bộ các bài kiểm thử tự động, build production của FE và BE để đảm bảo không có bất kỳ regression nào.

## Implementation Steps
1. Chạy `npm test` trong `ScienceJournalTrendingVN_Public_BE`:
   - Xác nhận tất cả các test suites (70+ test cases) đều vượt qua.
2. Chạy `npm run typecheck` trong cả BE và FE.
3. Chạy `npm run build` trong `ScienceJournalTrendingVN_Admin_FE`:
   - Xác nhận toàn bộ 22 static / dynamic routes biên dịch thành công 100%.
4. Cập nhật tài liệu `walkthrough.md`.

## Success Criteria
- [ ] 100% test cases backend pass.
- [ ] Frontend build 22/22 routes thành công.
