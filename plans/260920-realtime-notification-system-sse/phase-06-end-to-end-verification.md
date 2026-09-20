---
phase: "06"
title: "End-to-End Verification & Real-time QA"
status: completed
priority: P1
effort: "1h"
dependencies: ["03", "05"]
---

# Phase 06: End-to-End Verification & Real-time QA

## Overview
Tiến hành kiểm thử toàn diện vòng đời thông báo trên môi trường thực tế (chạy song song các vai trò Student, Lecturer, Admin), kiểm tra tính liên tục của kết nối SSE và độ trễ nhận thông báo.

## Verification Scenarios
1. **Scenario 1 (SV nộp bài -> Admin)**:
   - Đăng nhập tài khoản Student tại một tab, nộp bản thảo mới.
   - Quan sát tab Admin: Chuông thông báo lập tức tăng badge `+1`, mở popover thấy bài nộp mới, click vào mở đúng trang `/admin/submissions/:id`.
2. **Scenario 2 (Admin phân review -> Lecturer)**:
   - Admin phân công Giảng viên A làm Primary Reviewer.
   - Quan sát tab Giảng viên A: Chuông thông báo nảy số, mở popover thấy lời mời phản biện, click vào mở `/lecturer/reviews/:id`.
3. **Scenario 3 (Lecturer nộp review -> Admin & SV)**:
   - Giảng viên nộp review với đánh giá `NEEDS_REVISION`.
   - Admin và Sinh viên đều nhận thông báo kết quả đánh giá tương ứng.
4. **Scenario 4 (SV nộp bài sửa đổi -> Lecturer phụ trách & Admin)**:
   - Sinh viên tải lên phiên bản v2 và bấm nộp.
   - Cả Giảng viên phụ trách và Admin lập tức nhận được thông báo nộp bản sửa đổi mới.
5. **Scenario 5 (Admin duyệt xuất bản -> SV)**:
   - Admin bấm duyệt xuất bản bài báo.
   - Sinh viên nhận thông báo chúc mừng bài báo đã được xuất bản chính thức.
6. **Scenario 6 (User đăng ký -> Admin)**:
   - Đăng ký tài khoản mới ở trang đăng ký.
   - Admin nhận thông báo có tài khoản mới cần duyệt.

## Success Criteria
- [x] Cả 6 kịch bản đều đẩy thông báo qua SSE trong < 200ms.
- [x] Click vào thông báo chuyển đúng trang và chuyển trạng thái `isRead = true`.
- [x] Không có lỗi console ở FE, không rò rỉ socket ở BE.
- [x] `tsc --noEmit` pass 100% trên cả Backend và Frontend.
