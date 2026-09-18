---
title: "Brainstorm: Tối Giản & Dọn Dẹp Giao Diện Phản Biện Giảng Viên (Lecturer Workspace Clean-up)"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: LecturerShell.tsx, LecturerReviewsView.tsx"
---

# Báo Cáo Brainstorming: Tối Giản Hóa & Loại Bỏ Các Phần Thừa Trên Giao Diện Giảng Viên

## 1. Khảo Sát Hiện Trạng & Yêu Cầu Cốt Lõi

Dựa trên ảnh chụp thực tế màn hình `/lecturer/reviews` sau khi cập nhật sidebar và phản hồi trực quan từ bạn, giao diện đang tồn tại các yếu tố dư thừa, lặp lại thông tin:

1. **Tài khoản bị hiển thị 2 lần**:
   - Vừa có ở Profile Card góc dưới chân Sidebar (`Dr. Alan Turing`), vừa xuất hiện ở góc trên bên phải Topbar Header (`DT Dr. Alan Turing`).
2. **Thẻ cố vấn gây rối mắt ở chân sidebar**:
   - Khối `FACULTY ADVISORY` chiếm diện tích ở footer sidebar, làm phần thông tin profile người dùng bị ép xuống dưới.
3. **Chức danh chưa hiển thị đúng email tài khoản**:
   - Dòng phụ đề dưới tên giảng viên đang bị fix cứng là `Faculty Reviewer`, cần hiển thị đúng email đăng nhập của tài khoản (`user?.email`).
4. **Banner thông báo xanh lặp lại ở đầu trang**:
   - Dòng *"Advisory Peer Review: Your evaluation and recommendations inform..."* chiếm diện tích phía trên bảng, đẩy thanh filter toolbar và bảng bài báo xuống thấp.
5. **Cột ACTION trong bảng bị thừa**:
   - Nút `Start Review →` / `View Evaluation` lặp lại hành động điều hướng vì tiêu đề bài báo đã là link trực tiếp dẫn vào trang chi tiết phản biện. Loại bỏ cột này sẽ giúp bảng thoáng đãng, các cột bài báo, tác giả, SLA hiển thị rộng rãi và chuyên nghiệp hơn.
6. **Dòng chữ DOI Pending không cần thiết**:
   - Dòng `DOI: DOI Pending` dưới tên bài báo gây rối mắt với các bài đang trong giai đoạn preprint phản biện kín.

---

## 2. Các Phương Án Đề Xuất Triển Khai

### 🌟 Phương Án 1 (Khuyến nghị cao nhất — Tinh Giản Toàn Diện Chuẩn Học Thuật):
* **`LecturerShell.tsx`**:
  - **Bỏ user account trên header**: Xóa khối `<div className="lecturer-user">` ở Topbar. Header trên cùng chỉ còn lại breadcrumb `Hyperlabdata / Lecturer` và tiêu đề `Review queue` cực kỳ thoáng đãng, tập trung.
  - **Bỏ card Faculty Advisory**: Xóa thẻ `lecturer-sidebar-advisory-card` ở chân sidebar.
  - **Hiển thị email tài khoản**: Cập nhật subtitle trong Profile Card thành email thực tế của tài khoản: `{user?.email || 'reviewer@hyperdata.org'}`.
* **`LecturerReviewsView.tsx`**:
  - **Bỏ banner Advisory Peer Review**: Xóa bỏ toàn bộ khối banner `user-notice`. Thanh filter toolbar (`All`, `Awaiting Review`, `Completed` + Search + Sort) sẽ được đưa lên ngay đầu nội dung trang.
  - **Bỏ cột Action**:
    - Xóa thẻ `<th>Action</th>` trong `<thead>`.
    - Xóa thẻ `<td>` chứa nút `Start Review →` trong `<tbody>`.
    - Tăng độ rộng cột Manuscript lên `48%` giúp tên bài báo hiển thị trọn vẹn, không bị xuống dòng cụt ngủn.
  - **Bỏ dòng DOI: DOI Pending**: Xóa bỏ thẻ `<span>DOI: ...</span>` dưới tiêu đề bài viết.
* **Ưu điểm**:
  - Giao diện sạch tinh tế, thông tin cô đọng, loại bỏ 100% các thành phần lặp thừa.
  - Bảng review manuscripts rộng rãi, dễ đọc và tập trung vào nội dung học thuật cốt lõi.

---

### Phương Án 2 (Tối Giản Từng Phần — Giữ Lại Nút Action Dạng Icon Nhỏ):
* Thực hiện tất cả các mục trên nhưng thay vì bỏ hẳn cột Action, thu gọn nút `Start Review →` thành một icon mũi tên `→` nhỏ gọn ở mép phải.
* **Ưu điểm**: Vẫn có nút bấm ở mép phải cho người thích bấm nút thay vì bấm vào tên bài.
* **Nhược điểm**: Vẫn tốn 1 cột trong bảng, không đạt được độ tinh gọn tối đa như bạn mong muốn.
