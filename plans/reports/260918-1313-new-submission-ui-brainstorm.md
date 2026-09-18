---
title: "Redesign New Preprint Submission UX/UI"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintEditorView.tsx, paper-student.css"
---

# Redesign New Preprint Submission UX/UI (`/student/my-preprints/new`)

## 1. Vấn đề hiện tại (Root UX/UI Deficiencies)

Dựa trên hình ảnh chụp trang `/student/my-preprints/new` ([PreprintEditorView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintEditorView.tsx)):

1. **Luồng thao tác bị ngược hoàn toàn (Inverted Flow)**:
   - Thẻ `01` ghi: *"GROBID extracts metadata from the PDF. Review or correct the manuscript title before submission."*
   - Thẻ `02` ghi: *"Authors will be extracted from the PDF. Author information will be extracted after upload."*
   - Nhưng **phần tải file PDF lại nằm ở thẻ `03` (tận đáy trang)**! Người dùng không thể hiểu tại sao hệ thống bảo trích xuất từ PDF trong khi chưa cho upload PDF.
2. **Thiếu trường chọn Chuyên ngành / Lĩnh vực (Discipline)**:
   - Các bài báo trong repo đều có trường `discipline` (ví dụ: *Computer Science, Information Technology, Engineering, General Research...*), nhưng form hiện tại hoàn toàn thiếu dropdown này.
3. **Thanh Breadcrumb bị lặp vô nghĩa**:
   - Dòng `Preprint Portal / My Manuscripts / New Preprint` hiển thị lặp lại ngay bên dưới thanh Topbar `Scholar Workspace / Start a New Preprint`.
4. **Giao diện đơn điệu, cuộn dọc quá dài (Monotonous 3-card stack)**:
   - 3 khối card màu trắng xếp chồng đơn điệu, form input chiếm chiều rộng quá lớn (1000px+) khiến mắt người dùng phải quét ngang dài, tạo cảm giác nặng nề.
5. **Khối Tác giả (Authorship) còn sơ sài**:
   - Thẻ tác giả chính chỉ là một khung giả định `Authors will be extracted from the PDF` dù người nộp chính là sinh viên đã đăng nhập (cần pre-fill tên, email từ tài khoản hiện tại).

---

## 2. Các phương án thiết kế đề xuất

### Phương án 1 (Khuyến nghị cao nhất - Studio nộp bài 2 cột chuẩn học thuật hiện đại):
* **Bố cục 2 cột (Two-Column Submission Studio)**:
  - **Cột trái (40% - Sticky Panel)**: 
    - **Bước 1: Tải lên bản thảo (PDF Dropzone)** đặt ngay trên cùng cột trái. Khi kéo thả PDF, hiển thị ngay Tên file, dung lượng, và mã SHA-256 Checksum Verified màu xanh lá.
    - **Khối Tiêu chuẩn nộp bài (Submission Checklist)**: Hướng dẫn định dạng PDF, dung lượng tối đa 50MB, chính sách bản quyền CC-BY 4.0, quy trình duyệt của giảng viên.
  - **Cột phải (60% - Main Form)**:
    - **Bước 2: Thông tin bài báo (Metadata)**:
      - Tiêu đề bản thảo (Manuscript Title *).
      - Lĩnh vực nghiên cứu (Discipline Dropdown *): *Computer Science, Artificial Intelligence, Software Engineering, Data Science, General Research...*
      - Từ khóa (Keywords).
      - Tóm tắt (Abstract) kèm bộ đếm ký tự.
    - **Bước 3: Quyền tác giả (Authorship)**:
      - Tác giả chính (Tự động điền theo tài khoản sinh viên đang đăng nhập).
      - Danh sách đồng tác giả (Co-authors) kèm nút thêm nhanh đồng tác giả.
* **Thanh tác vụ cố định (Sticky Action Bar)**: Cancel, Lưu nháp (Save as Draft), Nộp cho giảng viên duyệt (Submit for Faculty Review).
* **Ưu điểm**:
  - Không cần cuộn trang nhiều, PDF upload trực quan ngay bên trái hỗ trợ kiểm tra file trước khi nhập form.
  - Giao diện cực kỳ chuyên nghiệp như các tạp chí IEEE, Nature, ACM.

---

### Phương án 2 (Bố cục 1 cột tối ưu theo trình tự tự nhiên 1 ➔ 2 ➔ 3):
* **Đảo đúng thứ tự luồng**:
  - **Khối 01 trên cùng: Upload PDF Manuscript**. Có animation upload, tính SHA-256 hash và trạng thái sẵn sàng trích xuất.
  - **Khối 02: Metadata & Discipline** (bổ sung trường Discipline dropdown).
  - **Khối 03: Authorship** (pre-fill tác giả chính từ tài khoản hiện tại).
* **Bỏ breadcrumb lặp**: Bỏ `breadcrumbs` prop khỏi `StudentShell`.
* **Ưu điểm**:
  - Đơn giản, giữ nguyên cấu trúc cuộn 1 cột quen thuộc nhưng logic đúng và bổ sung đầy đủ trường.
