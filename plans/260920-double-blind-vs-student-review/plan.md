---
title: "Quy trình Review Phân định Sinh viên / Giảng viên & Double-Blind Review Chuẩn"
date: "2026-09-20"
status: "completed"
mode: "tdd"
brainstorm: "docs/brainstorm/2026-09-20-double-blind-vs-student-review.md"
phases:
  - id: "01"
    name: "Backend TDD Test Suite (Masking vs Non-Masking)"
    status: "completed"
    file: "phase-01-backend-tdd-tests.md"
  - id: "02"
    name: "Backend Masking & Reviewer Identity Implementation"
    status: "completed"
    file: "phase-02-backend-masking-logic.md"
  - id: "03"
    name: "Frontend Lecturer Review Views & Author Identity"
    status: "completed"
    file: "phase-03-frontend-lecturer-views.md"
  - id: "04"
    name: "End-to-End Verification & Regression Suite"
    status: "completed"
    file: "phase-04-verification-and-regression.md"
---

# Plan: Quy trình Review Phân định Sinh viên / Giảng viên & Double-Blind Review Chuẩn

## 1. Overview
Triển khai phân định chính xác giữa **Bài viết của Sinh viên (`STUDENT`)** và **Bài viết của Giảng viên (`LECTURER`)** trong quy trình phản biện bởi 3 Giảng viên:
1. **Bài của Sinh viên (`uploader.role === 'STUDENT'`)**:
   - Giảng viên chấm nhìn thấy đầy đủ thông tin Tác giả sinh viên (Họ tên, MSSV, Email, Khoa/Ngành). Không bị ẩn danh.
   - Khi có kết quả (Needs Revision / Published / Rejected), Sinh viên nhìn thấy đầy đủ tên 3 Giảng viên đã chấm bài mình (Open Review).
2. **Bài của Giảng viên (`uploader.role === 'LECTURER'`)**:
   - Áp dụng Double-Blind Review tuyệt đối: Giảng viên chấm chỉ thấy `Anonymous Author`, ẩn email, MSSV và affiliation.
   - Tác giả giảng viên chỉ thấy `Lead Reviewer`, `Peer Reviewer 1`, `Peer Reviewer 2`.

## 2. Roadmap

| Phase | Description | Status |
|---|---|---|
| **Phase 01** | Viết bộ kiểm thử TDD cho các trường hợp ẩn danh và hiển thị danh tính (Student vs Lecturer) | Pending |
| **Phase 02** | Cập nhật logic masking tại Backend (`publication.service.ts` và `review.service.ts`) | Pending |
| **Phase 03** | Cập nhật giao diện Giảng viên và Tác giả trên Frontend (`LecturerReviewsView`, `LecturerReviewDetailView`) | Pending |
| **Phase 04** | Chạy toàn bộ 67+ test suite backend và build frontend 22 routes | Pending |
