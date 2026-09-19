---
phase: 1
title: "Backend TDD Test Suite (Masking vs Non-Masking)"
status: completed
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Backend TDD Test Suite (Masking vs Non-Masking)

## Overview
Viết các unit & integration test trước khi sửa đổi code (TDD approach):
- Khẳng định Giảng viên chấm bài của Sinh viên sẽ nhận được thông tin Tác giả thực (`name`, `studentId`, `email`, `role: STUDENT`).
- Khẳng định Giảng viên chấm bài của Giảng viên khác sẽ nhận được `Anonymous Author` và `Double-Blind Peer Review`.
- Khẳng định Sinh viên xem review hoàn tất sẽ thấy danh tính Giảng viên chấm (`Open Review`).
- Khẳng định Giảng viên xem review bài của mình sẽ thấy danh tính bị mask (`Lead Reviewer`, `Peer Reviewer N`).

## Related Code Files
- Modify: `e:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Public_BE\tests\publication.test.ts`

## Implementation Steps
1. Thêm test case vào `tests/publication.test.ts`:
   - `GET /api/v1/publications/:id` & `GET /api/v1/publications`: Test Lecturer viewing assigned Student paper -> checks `uploader.name !== 'Anonymous Author'` and `uploader.studentId` is present.
   - Test Lecturer viewing assigned Faculty paper -> checks `uploader.name === 'Anonymous Author'`.
   - Test Student viewing completed reviews -> checks `reviewer.name` contains actual lecturer name.
   - Test Lecturer viewing completed reviews on their own paper -> checks `reviewer.name === 'Lead Reviewer'` or `'Peer Reviewer 1'`.
2. Chạy test và xác nhận các test mới fail đúng như kỳ vọng (Red phase).

## Success Criteria
- [ ] Các bài test mới được viết đầy đủ và fail do code hiện tại vẫn mask bài sinh viên.
