---
phase: 2
title: "Backend Masking & Reviewer Identity Implementation"
status: completed
priority: P1
effort: "45m"
dependencies: ["01"]
---

# Phase 2: Backend Masking & Reviewer Identity Implementation

## Overview
Cập nhật logic tại Backend để vượt qua (Green) các bài test TDD đã viết ở Phase 1.

## Related Code Files
- Modify: `e:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Public_BE\src\modules\publication\publication.service.ts`
- Modify: `e:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Public_BE\src\modules\review\review.service.ts`

## Implementation Steps
1. Trong `publication.service.ts`:
   - Tại `getPublicationById`:
     - Kiểm tra `isFacultyPaper = publication.uploader.role === UserRole.LECTURER`.
     - Chỉ áp dụng Double-Blind masking cho `uploader` và `authors` nếu `isFacultyPaper === true`.
     - Nếu là bài Sinh viên (`isFacultyPaper === false`), giữ nguyên danh sách tác giả sinh viên và uploader sinh viên.
   - Tại `listPublications`:
     - Phân nhánh `isFacultyPaper = (pub.uploader as any).role === UserRole.LECTURER`.
     - Chỉ gán `uploader: { name: 'Anonymous Author', ... }` khi `isPeerReviewTask && isFacultyPaper`.
2. Trong `review.service.ts`:
   - Tại `getReviewsForManuscript`:
     - Khi tác giả xem review:
       - Nếu `publication.uploader.role === UserRole.STUDENT`: Giữ nguyên thông tin thật của reviewer (`name`, `email`) cho sinh viên thấy (Open Review).
       - Nếu `publication.uploader.role === UserRole.LECTURER`: Tiếp tục mask thành `Lead Reviewer` / `Peer Reviewer N`.
3. Chạy test suite để chuyển sang Green.

## Success Criteria
- [ ] Tất cả các test TDD ở Phase 1 đều pass (Green phase).
- [ ] Toàn bộ test suite cũ không bị regression.
