---
title: "Remove All Cite Buttons and Citation Components"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintDetailView, StudentDashboardView, StudentVersionArchiveView"
---

# Remove All Cite Buttons & Citation Elements

## Problem Statement

The user requested: *"bỏ hết các nút cite đi"* (remove all cite buttons), with a screenshot of the **Preprint Detail Page** (`/student/my-preprints/[id]`).

Currently, citation actions exist in the following locations:
1. **Preprint Detail Hero Header** (`PreprintDetailView.tsx`):
   - Top action bar contains a secondary button `[Cite]` next to `[Download PDF]` and `[Versions]`.
2. **Preprint Detail Right Sidebar** (`PreprintDetailView.tsx`):
   - A dedicated card `<div className="student-meta-card">` titled **"Cite this Preprint"** with APA text preview and a full-width `[Copy APA Citation]` button.
3. **Student Dashboard Table** (`StudentDashboardView.tsx`):
   - A `[Cite]` button in the table actions column next to `Open →`.
4. **Version Archive Table** (`StudentVersionArchiveView.tsx`):
   - A `[Cite]` button in the version history table next to `Open →`.

## Proposed Solutions

### Option 1 (Recommended - Triệt để trên trang chi tiết):
1. **PreprintDetailView.tsx**:
   - Xóa nút `[Cite]` ở thanh action phía trên (chỉ giữ lại `Download PDF`, `Versions`, và nút trạng thái chỉnh sửa nếu có).
   - Xóa toàn bộ khối card **"Cite this Preprint"** (bao gồm text APA citation và nút `Copy APA Citation`) ở sidebar bên phải, giúp sidebar bên phải gọn gàng, chỉ tập trung vào **Publication Details**.
   - Dọn dẹp code thừa: `copiedCitation`, `handleCopyCitation`, `formattedCitationPreview`.
2. **Dashboard & Archive Tables**:
   - Loại bỏ luôn các nút `[Cite]` trong bảng tại `StudentDashboardView.tsx` và `StudentVersionArchiveView.tsx` để đồng bộ hoàn toàn trải nghiệm người dùng trên toàn bộ phân hệ sinh viên.

### Option 2 (Chỉ xóa riêng các nút bấm `Cite`, giữ lại text trích dẫn ở sidebar):
- Xóa nút `[Cite]` ở thanh hero action.
- Ở sidebar, giữ lại text định dạng APA nhưng xóa nút bấm `Copy APA Citation`.
- Nhược điểm: Khối trích dẫn không có nút copy sẽ giảm trải nghiệm người dùng so với việc lược bỏ hoàn toàn.

## Verification Plan

- Chạy `npm run build` để đảm bảo code TypeScript và Next.js biên dịch hoàn tất 100% không còn tham chiếu unused.
