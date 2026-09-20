---
phase: "03"
title: "Backend Event Triggers Integration (6 Workflows)"
status: pending
priority: P1
effort: "1h30m"
dependencies: ["02"]
---

# Phase 03: Backend Event Triggers Integration (6 Workflows)

## Overview
Gắn các điểm kích hoạt (Trigger Hooks) thông báo tự động vào các service nghiệp vụ hiện có (`publication.service.ts`, `review.service.ts`, `auth.service.ts`), đảm bảo không can thiệp làm gián đoạn transaction chính.

## Requirements
- Functional:
  - **Trigger 1**: SV nộp bài mới -> Bắn thông báo `SUBMISSION_CREATED` cho toàn bộ Admin.
  - **Trigger 2**: Admin phân công reviewer -> Bắn thông báo `REVIEW_ASSIGNED` cho các Lecturer được phân công.
  - **Trigger 3**: Lecturer nộp đánh giá -> Bắn thông báo `REVIEW_COMPLETED` cho Admin và tác giả SV (khi vòng review kết thúc).
  - **Trigger 4**: SV nộp lại bản chỉnh sửa (v2, v3) -> Bắn thông báo `SUBMISSION_REVISED` cho Giảng viên phụ trách (Primary/Secondary) và Admin.
  - **Trigger 5**: Admin duyệt xuất bản / từ chối / yêu cầu sửa -> Bắn thông báo `PUBLICATION_APPROVED` / `PUBLICATION_REJECTED` / `REVISION_REQUESTED` cho tác giả SV.
  - **Trigger 6**: Đăng ký tài khoản mới -> Bắn thông báo `USER_REGISTERED` cho toàn bộ Admin.
- Non-functional: Xử lý lỗi gửi thông báo bất đồng bộ bằng `catch` để không làm rollback giao dịch lưu dữ liệu bài báo.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.service.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/review/review.service.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/auth/auth.service.ts`

## Implementation Steps
1. Trong `publication.service.ts`:
   - Gắn `NotificationService.notifyAdmins` khi bài báo mới được nộp lần đầu (`SUBMISSION_CREATED`).
   - Gắn gửi thông báo cho Giảng viên phụ trách khi `startsNewReviewRound` kích hoạt (`SUBMISSION_REVISED`).
   - Gắn gửi thông báo cho Tác giả khi Admin chuyển trạng thái sang `PUBLISHED`, `REJECTED`, `DRAFTING`.
2. Trong `review.service.ts`:
   - Gắn `NotificationService.createNotification` cho từng reviewer khi `assignReviewers` thành công.
   - Gắn gửi thông báo cho Admin & SV khi review được nộp.
3. Trong `auth.service.ts`:
   - Gắn `NotificationService.notifyAdmins` khi người dùng đăng ký tài khoản thành công chờ duyệt.

## Success Criteria
- [ ] Khi thực hiện các hành động trên, bản ghi thông báo tương ứng được tạo lập chính xác trong bảng `notifications`.
- [ ] Payload thông báo có đầy đủ tiêu đề, nội dung, đường dẫn link chuyển hướng.
