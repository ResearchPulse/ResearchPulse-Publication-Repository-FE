# Báo cáo Brainstorm: Chuẩn hóa Hàng đợi Đánh giá (Review Queue), Cơ chế Ẩn danh 2 chiều (Double-Blind) & Phân định Vai trò Tác giả (Faculty / Student)

**Ngày cập nhật**: 2026-09-20  
**Trạng thái**: Đã thống nhất toàn diện các phương án (Approved by User)  
**Phạm vi**: `ScienceJournalTrendingVN_Public_BE` & `ScienceJournalTrendingVN_Admin_FE`

---

## 1. Bản chất vấn đề & Giải thích nguyên nhân

### Q1: Vì sao bài của Giảng viên (Dr. Alan Turing) tự xuất hiện trong Review Queue của chính mình dù chưa phân công?
1. **Lỗi logic Backend (`publication.service.ts` dòng 2085–2095)**:
   Khi người dùng có vai trò `LECTURER` tải danh sách bài viết (`status=REVIEWING`), điều kiện lọc của Prisma gom cả `{ uploaderId: userId }` và `{ id: { in: assignedIds } }`. Do đó, tất cả bài do chính giảng viên tự nộp cũng bị trả về trong danh sách này.
2. **Lỗi map trạng thái Frontend (`lecturerReviewApi.ts`)**:
   FE gọi `GET /api/preprints/?status=REVIEWING` và tự động gán nhãn `AWAITING_REVIEW` cho bất kỳ bài nào chưa có bản đánh giá nộp lên. Kết quả là bài của chính giảng viên hiện ngay vào hàng đợi review với trạng thái "Chờ đánh giá"!
3. **Quy chuẩn Conflict of Interest (COI)**:
   Tác giả tuyệt đối **không** được tham gia hội đồng chấm bài của chính mình.

### Q2: Vì sao bảng hiển thị cột "STUDENT AUTHOR"?
- **Nguyên nhân**: Ở phiên bản đầu tiên, hệ thống mặc định quy trình 1 chiều: "Sinh viên nộp bài $\rightarrow$ Giảng viên vào chấm". Do đó, lập trình viên đã hardcode tiêu đề bảng thành `<th>Student Author</th>` và nhãn hiển thị là `Student Researcher` / `Student author` trên nhiều trang (`LecturerReviewsView`, `AdminSubmissionsView`, `AdminDashboardView`).
- Khi tính năng Giảng viên tự nộp bài nghiên cứu được bổ sung, các nhãn giao diện này chưa được nâng cấp tương ứng.

---

## 2. Các quyết định kiến trúc đã thống nhất

### Điểm 1: Phân công Reviewer & Chặn Tác giả tự chấm (COI)
- **Quy tắc số lượng**: Bắt buộc đúng **3 Giảng viên khác** chấm (1 Primary Lecturer quyết định luồng + 2 Secondary Lecturers cung cấp nhận xét độc lập).
- **Loại trừ COI**: Loại trừ tuyệt đối tác giả bài viết (`uploaderId`) và các đồng tác giả (`coauthors`) ra khỏi danh sách phân công. Admin không thể chọn tác giả làm reviewer, và BE sẽ chặn cứng (`400 Bad Request`) nếu có vi phạm.
- **Review Queue sạch**: Lecturer Review Queue (`/lecturer/reviews`) chỉ hiển thị các bài được Admin phân công (`assignedToMe=true` và `uploaderId !== userId`).

### Điểm 2: Tiêu chí phân định vai trò tác giả (Cách A - Theo Uploader)
- Căn cứ theo tài khoản trực tiếp nộp bài:
  - Nếu `uploader.role === 'LECTURER'`: Gán nhãn/badge **`Faculty`** (Màu Indigo/Purple).
  - Nếu `uploader.role === 'STUDENT'`: Gán nhãn/badge **`Student`** (Màu Sky/Blue).
- Backend bổ sung `role` vào đối tượng `uploader: { id, email, name, role, studentId }` trong toàn bộ API trả về.

### Điểm 3: Cơ chế Đánh giá Ẩn danh 2 chiều (Double-Blind Review)
- **Reviewer chấm bài**:
  - Tên và thông tin định danh của tác giả được ẩn danh (hiển thị là `Anonymous Author` hoặc ẩn thông tin nhạy cảm) để Reviewer chấm bài hoàn toàn công tâm, khách quan.
- **Tác giả đọc nhận xét**:
  - Tác giả chỉ đọc nội dung đánh giá (`comment`), khuyến nghị (`recommendation`) và quyết định của vòng chấm; danh tính của các Reviewer được ẩn danh (hiển thị `Lead Reviewer`, `Peer Reviewer 1`, `Peer Reviewer 2`).
- **Admin**:
  - Nhìn thấy đầy đủ danh tính của cả 2 phía để phục vụ giám sát, điều phối và phân công học thuật.

### Điểm 4: Thời điểm công bố nhận xét cho Tác giả
- Trong suốt quá trình bài đang ở trạng thái `REVIEWING`: Tác giả chỉ nhìn thấy trạng thái tổng thể là **`Under Review`** (Đang thẩm định).
- Tác giả **không** xem các nhận xét tạm thời hoặc kết quả dang dở của từng reviewer lẻ tẻ.
- Chỉ khi vòng review kết thúc (Primary Lecturer / Admin đưa ra quyết định cuối: `Needs Revision` / `Published` / `Rejected`), tác giả mới được mở xem tổng hợp nhận xét phản biện để chỉnh sửa hoặc nắm kết quả.

### Điểm 5: Tab riêng dành cho bài của Giảng viên trong Admin (Phương án A)
- Trong trang **`AdminSubmissionsView.tsx`**, bố trí thanh Tab phân loại tác giả (Segmented Control / Tabs):
  - **`All Submissions`**: Tất cả bài nộp.
  - **`Faculty Papers`**: Dành riêng cho các bài do Giảng viên nộp (kèm số đếm).
  - **`Student Papers`**: Dành riêng cho các bài do Sinh viên nộp (kèm số đếm).
- Phối hợp mượt mà với các status tabs (`All`, `In Review`, `Needs Revision`, `Published`, `Rejected`).
- Phía Backend: Bổ sung bộ lọc `uploaderRole=STUDENT|LECTURER` và cập nhật metrics đếm số lượng theo vai trò.

### Điểm 6: Đồng bộ hóa Giao diện trên tất cả các trang
- **Đổi tiêu đề cột**: Thay thế toàn bộ `STUDENT AUTHOR` thành **`AUTHOR`** (hoặc `SUBMITTER / AUTHOR`).
- **Phạm vi cập nhật các trang**:
  1. `LecturerReviewsView.tsx`: Review queue của giảng viên (chỉ hiện bài được assign, ẩn danh tác giả theo chuẩn Double-blind).
  2. `LecturerReviewDetailView.tsx`: Trang chấm bài chi tiết của giảng viên.
  3. `AdminSubmissionsView.tsx`: Trang quản lý bài nộp của Admin (thanh tab `All` / `Faculty Papers` / `Student Papers`, cột `AUTHOR`, hiển thị badge `Faculty` / `Student`).
  4. `AdminDashboardView.tsx`: Bảng tổng quan Dashboard của Admin (cột `AUTHOR`, badge `Faculty` / `Student`).
  5. `AdminSubmissionDetailView.tsx`: Chi tiết bài nộp phía Admin (hiển thị badge tác giả, lọc bỏ tác giả khỏi danh sách chọn Reviewer).
  6. `LecturerSubmissionsView.tsx` & `PreprintDetailView.tsx`: Đảm bảo hiển thị nhất quán.

---

## 3. Kế hoạch xác thực (Verification Plan)

1. **Kiểm tra Backend**:
   - Đăng nhập Dr. Alan Turing gọi `GET /api/v1/publications?status=REVIEWING&assignedToMe=true`: Xác nhận chỉ trả về 1 bài của Alice Student, 3 bài của chính Turing không xuất hiện.
   - Thử phân công Admin chọn chính Dr. Alan Turing cho bài của Turing: Xác nhận BE trả về lỗi COI `400 Bad Request`.
   - Kiểm tra `uploader.role` trả về đầy đủ trên các endpoint.
   - Thử gọi `GET /api/v1/publications?uploaderRole=LECTURER`: Chỉ trả về bài của giảng viên.
2. **Kiểm tra Frontend**:
   - Truy cập `http://localhost:3003/lecturer/reviews`: Hàng đợi giảm từ 4 bài xuống đúng 1 bài.
   - Truy cập `http://localhost:3003/admin/submissions`: Thử nghiệm tab `Faculty Papers` và `Student Papers`.
   - Kiểm tra giao diện các bảng Admin Dashboard, Admin Submissions, Lecturer Reviews: Không còn chữ "STUDENT AUTHOR", hiển thị badge `Faculty` / `Student` chuẩn mực.
   - Thử nghiệm chức năng phân công Reviewer: Không thể chọn tác giả.
