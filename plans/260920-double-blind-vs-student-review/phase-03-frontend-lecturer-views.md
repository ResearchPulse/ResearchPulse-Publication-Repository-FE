---
phase: 3
title: "Frontend Lecturer Review Views & Author Identity"
status: completed
priority: P2
effort: "40m"
dependencies: ["02"]
---

# Phase 3: Frontend Lecturer Review Views & Author Identity

## Overview
Cập nhật giao diện của Giảng viên và Tác giả trên Frontend để hiển thị danh tính tương ứng theo loại bài viết:
- Review Queue (`/lecturer/reviews`):
  - Bài của Sinh viên: Hiển thị Tên sinh viên, MSSV (nếu có), Badge `Student`.
  - Bài của Giảng viên: Hiển thị `Anonymous Author`, Badge `Double-Blind`.
- Review Detail (`/lecturer/reviews/:id`):
  - Bài của Sinh viên: Hiển thị Tên sinh viên, MSSV trong thông tin tác giả, không có tag `(Double-Blind)`.
  - Bài của Giảng viên: Hiển thị `Anonymous Author (Double-Blind)`.
- Author View / Feedback:
  - Sinh viên xem bài: Hiển thị họ tên của 3 Giảng viên chấm kèm vai trò Trưởng ban / Thành viên.

## Related Code Files
- Modify: `e:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\features\lecturer\views\LecturerReviewsView.tsx`
- Modify: `e:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\features\lecturer\views\LecturerReviewDetailView.tsx`
- Modify: `e:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\features\preprint\views\PreprintDetailView.tsx`

## Implementation Steps
1. Cập nhật `LecturerReviewsView.tsx`:
   - Xác định `const isFaculty = item.uploader?.role === 'LECTURER';`
   - Nếu `isFaculty`: render `Anonymous Author` và badge `Double-Blind`.
   - Nếu không phải (`isFaculty === false`): render `item.uploader?.name || 'Student Author'` và badge `Student` kèm MSSV nếu có.
2. Cập nhật `LecturerReviewDetailView.tsx`:
   - Phân biệt hiển thị tác giả và danh sách tác giả dựa trên `detail.publication.uploader?.role`.
3. Kiểm tra hiển thị review trong `PreprintDetailView.tsx` đảm bảo hiển thị đúng tên reviewer khi là sinh viên.

## Success Criteria
- [ ] Giao diện `/lecturer/reviews` hiển thị rõ bài sinh viên có tên sinh viên, không bị badge `Double-Blind`.
- [ ] Giao diện bài giảng viên vẫn giữ đúng `Double-Blind`.
- [ ] Typecheck frontend `tsc --noEmit` đạt 0 lỗi.
