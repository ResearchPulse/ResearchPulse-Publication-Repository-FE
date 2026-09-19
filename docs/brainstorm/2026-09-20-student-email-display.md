# Brainstorm: Thay thế nhãn "Student" bằng Email sinh viên trong giao diện Giảng viên

**Ngày tạo**: 2026-09-20  
**Chủ đề**: Tinh chỉnh hiển thị cột Author trong giao diện phản biện của Giảng viên (`/lecturer/reviews` và `/lecturer/reviews/:id`) — bỏ nhãn badge `[Student]`, thay bằng email sinh viên dưới dạng subtext thanh lịch.

---

## 1. Vấn đề & Yêu cầu của người dùng

- **Hiện tại**: Cột `Author` trong Review Queue của Giảng viên đang hiển thị tên sinh viên kèm nhãn badge xanh `[Student]`.
- **Yêu cầu**: Không cần hiển thị nhãn `[Student]`. Thay vào đó, hiển thị trực tiếp địa chỉ email của sinh viên dưới tên để giảng viên dễ dàng nắm bắt thông tin liên hệ và nhận diện sinh viên.
- **Phạm vi đồng bộ**:
  1. Bảng hàng đợi phản biện (`/lecturer/reviews` - `LecturerReviewsView.tsx`).
  2. Trang chi tiết bản thảo phản biện (`/lecturer/reviews/:id` - `LecturerReviewDetailView.tsx`).

---

## 2. Giải pháp Thiết kế Thống nhất

### A. Review Queue Table (`/lecturer/reviews`)
- **Tác giả là Sinh viên**:
  - Dòng 1: Tên tác giả sinh viên (`font-size: 13.5px`, `font-weight: 600`, màu `#334155`).
  - Dòng 2 (Subtext): Email của sinh viên (`font-size: 12px`, `color: #64748b`, không dùng khung viền badge). Nếu không có email thì fallback hiển thị MSSV hoặc ẩn subtext.
- **Tác giả là Giảng viên (Double-Blind)**:
  - Dòng 1: `Anonymous Author`.
  - Dòng 2: Badge `Double-Blind` (`font-size: 11px`, màu xám `#64748b`, nền `#f1f5f9`).

### B. Manuscript Information Panel (`/lecturer/reviews/:id`)
- **Tác giả là Sinh viên**:
  - Trường Author hiển thị: `Tên sinh viên` kèm email `(student@email.com)` màu `#64748b`.
  - Trường Authors hiển thị: Danh sách họ tên các tác giả sinh viên.
- **Tác giả là Giảng viên**:
  - Giữ nguyên `Anonymous Author (Double-Blind)`.

---

## 3. Kế hoạch Xác thực
1. **Kiểm tra biên dịch & Typecheck**:
   - `npx tsc -p tsconfig.json --noEmit`: 0 lỗi.
2. **Kiểm tra Next.js Production Build**:
   - `npm run build`: 22/22 routes biên dịch thành công.
3. **Kiểm tra trực quan**:
   - Truy cập `/lecturer/reviews`: Hàng bài của Sinh viên hiển thị tên và email xám nhạt bên dưới, không còn badge `Student`.
   - Bài của Giảng viên vẫn giữ nguyên `Anonymous Author` và badge `Double-Blind`.
