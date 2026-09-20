# Brainstorm Report: Khắc Phục Lỗi Hiển Thị Lặp Reviewer Tại Admin Submission Detail

- **Ngày**: 19/09/2026 15:06
- **Trạng thái**: Thống nhất phương án 2 (Xử lý toàn diện cả Backend API & Frontend UI)

---

## 1. Vấn Đề (Problem Statement)
- Tại trang chi tiết bản thảo dành cho Admin ([AdminSubmissionDetailView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminSubmissionDetailView.tsx)), panel **Peer Review Progress** đang hiển thị lặp lại các reviewer (ví dụ ở bản thảo v4 có 4 round thì mỗi giảng viên xuất hiện lặp 4 lần, tổng cộng 12 card).
- Nguyên nhân:
  1. Backend `GET /api/v1/publications/:id/reviews` trả về tất cả review của mọi round khi người gọi là `ADMIN`.
  2. Frontend không lọc theo `reviewRound` hiện tại mà render toàn bộ.
  3. Lỗi phụ (Side-effect): Mảng `secondaryReviewerIds` bị gộp tất cả các round dẫn đến độ dài 6-8 ID thay vì 2 ID, làm điều kiện `secondaryReviewerIds.length !== 2` khóa cứng nút "Save review team".

---

## 2. Các Phương Án Đã Đánh Giá

| Phương án | Ưu điểm | Nhược điểm | Kết quả |
| :--- | :--- | :--- | :--- |
| **Phương án 1: Chỉ sửa FE** | Không đụng vào BE | Backend vẫn over-fetch toàn bộ history cho mọi lần load trang | Không chọn |
| **Phương án 2: Sửa đồng bộ cả BE API và FE (Được chọn)** | RESTful chuẩn, API có query param `?round=current` / `?round=all`, mặc định trả về round hiện tại, FE hiển thị đúng và có phần mở rộng xem lịch sử | Cần cập nhật cả 2 repo | **ĐÃ CHỌN** |
| **Phương án 3: Dropdown chọn Round trên FE** | Trực quan | Tốn diện tích và logic phức tạp hơn cần thiết | Không chọn |

---

## 3. Thiết Kế Giải Pháp Chi Tiết

### Backend (`ScienceJournalTrendingVN_Public_BE`):
1. **[review.schema.ts](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Public_BE/src/modules/review/review.schema.ts)**:
   - Thêm `querystring: { type: 'object', properties: { round: { type: 'string' } } }` vào `listReviewsSchema`.
2. **[review.controller.ts](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Public_BE/src/modules/review/review.controller.ts)**:
   - Truyền `request.query.round` vào `ReviewService.listReviews`.
3. **[review.service.ts](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Public_BE/src/modules/review/review.service.ts)**:
   - Xử lý filter cho `ADMIN`:
     - Nếu `round === 'all'`: Không filter (lấy tất cả).
     - Nếu `round` là số nguyên: Lọc theo số round đó.
     - Mặc định (hoặc `round === 'current'`): Lọc `where.round = Math.max(1, publication.reviewRound)`.

### Frontend (`ScienceJournalTrendingVN_Admin_FE`):
1. **[preprintApi.ts](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/admin/api/preprintApi.ts)**:
   - Cập nhật `getReviews(id, round = 'current')`.
2. **[AdminSubmissionDetailView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminSubmissionDetailView.tsx)**:
   - Gọi `adminApi.getReviews(id, 'current')`.
   - Hiển thị badge round hiện tại trên panel Peer Review Progress: `Round {round} · Version {versionLabel} (Current)`.
   - Khắc phục lỗi gán reviewer (`secondaryReviewerIds` chỉ lấy từ current round reviews).
   - Nếu bài viết có nhiều hơn 1 round (`publication.reviewRound > 1`), bổ sung một collapsible toggle: **"View Past Review Rounds (v1–v3)"** cho phép Admin tra cứu lại toàn bộ nhận xét của các vòng cũ mà không làm rối màn hình.

---

## 4. Kế Hoạch Xác Minh (Verification)
- Kiểm tra bài v4 hiện tại (`56267b78-377b-4a3a-8be2-14fd8fb38dc3`):
  - Trước sửa: 12 card lặp.
  - Sau sửa: Chỉ 3 card reviewer của Round 4.
  - Kiểm tra nút "Save review team" không bị disable.
  - Kiểm tra phần xem lịch sử các round cũ hiển thị đầy đủ nhận xét của rounds 1, 2, 3.
