---
title: "Brainstorm: Tối Giản Bảng Phản Biện & Sidebar (Minimalist Table & Clean Sidebar)"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: LecturerShell.tsx, LecturerReviewsView.tsx"
---

# Báo Cáo Brainstorming: Tinh Chỉnh 4 Chi Tiết Theo Hình Ảnh Thực Tế

## 1. Khảo Sát Hiện Trạng & 4 Yêu Cầu Cụ Thể

Dựa trên 4 ảnh chụp chi tiết từ bạn:

1. **Hình 1 (Số đếm ở Sidebar)**:
   - *Hiện tại*: Số `1` đang nằm trong một vòng tròn màu vàng (`student-sidebar__badge--alert`).
   - *Yêu cầu*: Bỏ vòng tròn bao quanh, chỉ hiển thị số `1` trần thanh lịch (căn phải, in đậm nhẹ, màu xanh thương hiệu `#0071bc` hoặc xám đậm `#475569`).

2. **Hình 2 (Tag Academic Preprint)**:
   - *Hiện tại*: Bên trên tên bài báo có khối pill màu xanh nhạt `ACADEMIC PREPRINT`.
   - *Yêu cầu*: Xóa bỏ hoàn toàn nhãn `Academic Preprint`. Cột Manuscript chỉ hiển thị duy nhất tên bài báo dạng liên kết nổi bật.

3. **Hình 3 (Avatar tác giả & Email)**:
   - *Hiện tại*: Cột Student Author có avatar tròn chữ cái `A`, tên tác giả `Ashish Vaswani` và dòng phụ đề `Author email hidden`.
   - *Yêu cầu*: Bỏ vòng tròn avatar và bỏ dòng hiển thị email. Chỉ giữ lại tên tác giả dạng văn bản đơn giản, tinh tế.

4. **Hình 4 (Box Version)**:
   - *Hiện tại*: Phiên bản `v1.0` được đóng khung trong một hộp bo góc xám nhạt (`mentor-version-tag`).
   - *Yêu cầu*: Bỏ box bao quanh, chỉ hiển thị số phiên bản `v1.0` trần như văn bản học thuật thông thường.

---

## 2. Phương Án Triển Khai Đề Xuất

### 🌟 Phương Án 1 (Khuyến nghị cao nhất — Clean Flat Typography):
- **Sidebar Badge**: Bỏ class `.student-sidebar__badge`, thay bằng thẻ `<span>` không viền, không nền với font chữ 12px đậm gọn gàng `#0071bc`.
- **Cột Manuscript**: Bỏ thẻ chứa `mentor-manuscript-tag`. Tiêu đề bản thảo hiển thị trực tiếp và rõ ràng.
- **Cột Student Author**: Bỏ avatar `<div>` và email `<small>`, chỉ render `<span style={{ fontWeight: 600 }}>{authorName}</span>`.
- **Cột Version**: Bỏ class `mentor-version-tag`, render `<span style={{ color: '#475569', fontWeight: 600 }}>v{...}.0</span>`.

### Ưu Điểm:
- Đạt phong cách **Minimalist Data Table** (tối giản dữ liệu) chuẩn các tạp chí khoa học hàng đầu như arXiv, Nature, ACM: không lạm dụng box/badge màu mè, tập trung tối đa vào thông tin văn bản.
- Giao diện cực kỳ thoáng, sạch và nhất quán.
