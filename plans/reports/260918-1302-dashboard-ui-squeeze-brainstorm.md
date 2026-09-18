---
title: "Fix UI Squeezing on Student Dashboard"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: StudentDashboardView.tsx, paper-student.css"
---

# Fix UI Squeezing on Student Dashboard (`/student/dashboard`)

## 1. Vấn đề hiện tại (Root Causes of UI Squeezing)

Dựa trên hình ảnh thực tế bạn gửi tại `/student/dashboard`, giao diện đang bị ép (cramped/squeezed) do 4 nguyên nhân cốt lõi:

1. **Sidebar phụ bên phải chiếm quá nhiều diện tích (`380px`)**:
   - Lưới hiện tại: `.dashboard-grid { grid-template-columns: 1fr 380px; gap: 24px; }`.
   - Trên màn hình laptop phổ biến (1366px - 1440px), sidebar chính bên trái đã chiếm ~240px, phần nội dung còn ~1100px. Khi chia tiếp cho cột phụ 380px + gap 24px, cột chứa bảng chỉ còn khoảng **650px - 700px**!
2. **Bảng dữ liệu có tới 6 cột bị nhồi nhét trong ~680px**:
   - Bảng gồm: `MANUSCRIPT`, `DISCIPLINE`, `VERSION`, `STATUS`, `UPDATED`, `ACTIONS`.
   - Cột `ACTIONS` (`Open →`) chiếm thêm một khoảng cố định dù tiêu đề bản thảo đã là link trực tiếp.
3. **Tiêu đề bản thảo bị ép cụt và xuống 7 - 8 dòng**:
   - CSS `.dashboard-table__title-cell` bị gán cứng `max-width: 260px;`.
   - Tên bài báo học thuật thường rất dài (ví dụ: *"Provided proper attribution is provided, Google hereby grants permission to reproduce the tables and figures in this paper solely for use in journalistic or scholarly works. Attention Is All You Need"*), khiến mỗi dòng chỉ chứa được 3-4 từ, hàng bảng bị kéo dài thườn thượt theo chiều dọc.
4. **Hai khối bên phải (`Faculty Advisory Activity` & `Submission Guidance`) bị trống nhiều nhưng lại chiếm vị trí đắc địa**:
   - Phần lớn thời gian sinh viên chỉ có 1-2 nhận xét hoặc hướng dẫn tĩnh, nhưng lại chiếm hẳn 1 cột cao suốt chiều dọc màn hình.

---

## 2. Các phương án giải quyết

### Phương án 1 (Khuyến nghị cao nhất - Bố cục chuẩn Dashboard học thuật hiện đại):
* **Đưa bảng `Recent Manuscripts` ra Full Width (100%)**:
  - Đặt bảng ngay bên dưới 4 thẻ chỉ số thống kê (Metrics Cards) với chiều rộng đầy đủ 100%.
  - Bỏ cột `ACTIONS` (chuẩn hóa giống trang `My Manuscripts`), tiêu đề chiếm 48-50% không gian, có thể hiển thị thoải mái 1-2 dòng không bị gãy vụn.
* **Chuyển 2 khối phụ (`Faculty Advisory Activity` và `Submission Guidance`) xuống bên dưới bảng**:
  - Chia làm 2 cột cân đối ở phía dưới (`grid-template-columns: 1fr 1fr; gap: 20px;`), vừa tận dụng tốt không gian, vừa giữ nguyên đầy đủ tính năng.
* **Ưu điểm**:
  - Hết hoàn toàn tình trạng bị ép UI, bảng thoáng đãng, dễ đọc như các dashboard chuyên nghiệp (Nature, GitHub, Stripe).
  - Đồng bộ trải nghiệm hoàn hảo với trang danh sách `/student/my-preprints`.

### Phương án 2 (Giữ bố cục 2 cột nhưng tái cấu trúc tỉ lệ & giới hạn dòng):
* Giảm độ rộng sidebar phụ từ `380px` xuống `280px`.
* Xóa `max-width: 260px;` trên `.dashboard-table__title-cell` để tiêu đề co giãn linh hoạt.
* Xóa cột `ACTIONS` để bảng chỉ còn 5 cột.
* Áp dụng line-clamp 2 dòng cho tiêu đề (`-webkit-line-clamp: 2; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical;`) kèm tooltip khi hover.
* **Nhược điểm**: Trên màn hình laptop nhỏ (1280px-1366px), không gian bảng vẫn tương đối hẹp so với bản full-width.

---

## 3. Chi tiết các file thay đổi (Nếu chọn Phương án 1)

1. **[`StudentDashboardView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentDashboardView.tsx)**:
   - Tách khối `Recent Manuscripts` ra làm một thẻ độc lập full-width.
   - Bỏ cột `<th>Actions</th>` và `<td>...Open →</td>`.
   - Đặt 2 khối `Faculty Advisory Activity` và `Submission Guidance` vào một grid phụ 2 cột nằm ở dưới.
2. **[`paper-student.css`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/styles/paper-student.css)**:
   - Xóa `max-width: 260px` trên `.dashboard-table__title-cell`.
   - Cập nhật `.dashboard-widgets-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-top: 24px; }`.
   - Bổ sung responsive collapse cho khối phụ trên tablet/mobile.
