# Brainstorm Report: Chuẩn Hóa Luồng Quyết Định Chuyên Môn Của Giảng Viên Chính (Primary Lecturer) Theo SRS v0.8

- **Ngày**: 19/09/2026 15:35
- **Trạng thái**: Đề xuất giải pháp kiến trúc & nghiệp vụ (Chờ User duyệt)
- **Phạm vi**: Cả 2 repo:
  - `ScienceJournalTrendingVN_Public_BE`: `review.service.ts`, `publication.service.ts`
  - `ScienceJournalTrendingVN_Admin_FE`: `LecturerReviewDetailView.tsx`, `AdminSubmissionDetailView.tsx`

---

## 1. Bản Chất Vấn Đề Nghiệp Vụ (Problem Statement)
Theo đối chiếu với **SRS v0.8 ([hyperlabdata-preprint-srs.md](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Public_BE/docs/hyperlabdata-preprint-srs.md))**:
- **Nguyên tắc cốt lõi (Mục 1.2, FR-LEC-04, BR-09, BR-10, BR-11)**:
  - Giảng viên chính (**Primary Lecturer**) là người chịu trách nhiệm chuyên môn cao nhất, là người **trực tiếp đưa ra quyết định duyệt workflow**:
    - `PUBLISHED` (Xuất bản)
    - `DRAFTING` (Yêu cầu sinh viên sửa bài)
    - `REJECTED` (Từ chối)
  - Giảng viên phụ (**Secondary Lecturers**): Đóng vai trò phản biện độc lập, gửi nhận xét và đề xuất (recommendation) để **hỗ trợ cho Giảng viên chính** ra quyết định.
  - Quản trị viên (**Admin**): **CHỈ LÀ QUYỀN DỰ PHÒNG (BACKUP DECISION)** khi Giảng viên chính vắng mặt, quá hạn hoặc có tranh chấp, và khi Admin can thiệp thì **bắt buộc phải ghi lý do dự phòng** (`reason`).

### Các Lỗi Nghiệp Vụ Hiện Tại Đang Vi Phạm SRS:
1. **Lỗi Backend (`review.service.ts`)**:
   - Hàm `listReviews` cho role `LECTURER` đang bị ép cứng điều kiện `where.reviewerId = userId`.
   - **Hậu quả nghiêm trọng**: Giảng viên chính khi vào chấm bài **không thể nhìn thấy nhận xét và đề xuất của 2 Giảng viên phụ**. Không có căn cứ phản biện thì Giảng viên chính không thể tổng hợp ý kiến để ra quyết định theo đúng use case `UC-LEC-03`.
2. **Lỗi Frontend Giảng viên (`LecturerReviewDetailView.tsx`)**:
   - Khi giảng viên nộp review thì hiển thị thông báo sai lệch: *"Your recommendation has been submitted to the administrator"*, placeholder: *"Write your feedback for the administrator..."*.
   - Khối quyết định của Giảng viên chính (`Workflow decision`) đang bị đặt nép phía dưới form và phụ thuộc vào điều kiện `detail.reviews[0]?.assignmentRole === 'PRIMARY'`.
   - Chưa có khu vực hiển thị phản biện của 2 Giảng viên phụ cho Giảng viên chính xem.
3. **Lỗi Frontend Admin (`AdminSubmissionDetailView.tsx`)**:
   - Khối quyết định của Admin đang hiển thị như luồng duyệt chính hàng ngày (*"Administrator Decision - As the administrator, you evaluate the peer review recommendations and determine the next lifecycle stage"*), khiến người dùng hiểu lầm Admin là người duyệt bài thay cho Giảng viên.

---

## 2. Thiết Kế Giải Pháp Chi Tiết (Architectural Design)

### 2.1. Backend (`ScienceJournalTrendingVN_Public_BE`)
**Tệp tin**: `src/modules/review/review.service.ts` -> hàm `listReviews`:
- Kiểm tra vai trò của Giảng viên đang đăng nhập đối với bài báo trong round hiện tại:
  - Nếu là **`PRIMARY` (Giảng viên chính)**:
    - Cho phép lấy review của chính mình + tất cả review đã nộp (`submittedAt !== null`) của các **`SECONDARY` lecturers** trong round hiện tại.
    - Giúp Giảng viên chính đọc được đầy đủ ý kiến phản biện của hội đồng.
  - Nếu là **`SECONDARY` (Giảng viên phụ)**:
    - Chỉ lấy review của chính mình (`where.reviewerId = userId`), đảm bảo tính độc lập khách quan khi chấm bài, tránh bị thiên vị trước khi nộp.

### 2.2. Frontend Giảng viên (`ScienceJournalTrendingVN_Admin_FE`)
**Tệp tin**: `src/features/lecturer/views/LecturerReviewDetailView.tsx`:
1. **Phân định rõ vai trò của Giảng viên**:
   - Xác định `isPrimary = myReview?.assignmentRole === 'PRIMARY'`.
   - Xác định `isSecondary = myReview?.assignmentRole === 'SECONDARY'`.
2. **Đối với Giảng viên phụ (`isSecondary`)**:
   - Form chấm bài đóng vai trò là **Phản biện độc lập**:
     - Placeholder: *"Nhập nhận xét chi tiết và đánh giá học thuật để gửi cho Giảng viên chính..."*
     - Thông báo thành công: *"Đánh giá của bạn đã được ghi nhận vào hồ sơ bài báo để Giảng viên chính tổng hợp quyết định."*
3. **Đối với Giảng viên chính (`isPrimary`)**:
   - **Khu vực xem phản biện phụ**: Hiển thị bảng/danh sách nhận xét và đề xuất của 2 Giảng viên phụ (Secondary Reviews) ngay trên màn hình.
   - **Form tự đánh giá**: Giảng viên chính nhập nhận xét của chính mình.
   - **Bảng Quyết Định Chuyên Môn (Primary Lecturer Decision)**:
     - Nằm nổi bật, trang trọng.
     - Các nút hành động chính thức:
       - **Publish Paper** (`PUBLISHED`): Cho phép công khai bài báo theo audience Admin đã cấu hình.
       - **Request Revision** (`DRAFTING`): Yêu cầu sinh viên sửa bài (bắt buộc nhập lý do/yêu cầu cụ thể).
       - **Reject Paper** (`REJECTED`): Từ chối bản thảo.

### 2.3. Frontend Admin (`ScienceJournalTrendingVN_Admin_FE`)
**Tệp tin**: `src/features/admin/views/AdminSubmissionDetailView.tsx`:
- Điều chỉnh khối quyết định thành: **"Admin Backup Decision (Quyền Can Thiệp Dự Phòng)"**.
- Bổ sung ghi chú rõ ràng:
  > *"Giảng viên chính (Primary Lecturer) chịu trách nhiệm chuyên môn ra quyết định duyệt bài. Quyền dự phòng của Admin chỉ sử dụng khi hội đồng phản biện quá hạn hoặc có sự cố can thiệp hành chính (bắt buộc ghi rõ lý do)."*
- Giữ nguyên cơ chế bắt buộc nhập `reason` khi Admin can thiệp dự phòng theo đúng BR-28.

---

## 3. Kế Hoạch Xác Minh (Verification Plan)
1. **Kiểm tra Backend**:
   - Đăng nhập với tài khoản Primary Lecturer: `GET /api/v1/publications/:id/reviews` trả về cả review của Primary và các review đã nộp của Secondary.
   - Đăng nhập với tài khoản Secondary Lecturer: chỉ trả về review của chính mình.
2. **Kiểm tra Frontend Giảng viên**:
   - Secondary Lecturer: Submit review thành công, không còn chữ "admin", hiển thị trạng thái chờ Giảng viên chính tổng hợp.
   - Primary Lecturer: Thấy nhận xét của Secondary Reviewers; bấm Publish / Request Revision / Reject thành công.
3. **Kiểm tra Frontend Admin**:
   - Thể hiện đúng tính chất "Dự phòng", không còn lấn quyền Giảng viên chính.
4. **Kiểm tra TypeScript**: Cả 2 repo biên dịch thành công không có lỗi type.
