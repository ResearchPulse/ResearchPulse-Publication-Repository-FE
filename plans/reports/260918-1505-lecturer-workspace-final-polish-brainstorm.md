---
title: "Brainstorm: Đồng Bộ Topbar, Logo Landing Page & Tối Giản Bảng Phản Biện"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: LecturerShell.tsx, LecturerReviewsView.tsx, StudentSidebar.tsx"
---

# Báo Cáo Brainstorming: Tinh Chỉnh Topbar Breadcrumb, Logo Landing Page & Bảng Phản Biện

## 1. Khảo Sát Hiện Trạng & Yêu Cầu Chi Tiết

Dựa trên toàn bộ các ảnh chụp và yêu cầu bổ sung từ bạn:

1. **Logo Thương Hiệu (Brand Header)**:
   - *Hiện tại*: Đang dùng icon SVG 3 vạch và tên chữ thường `hyperlabdata` cùng dòng phụ đề `REVIEWER WORKSPACE` / `Scholar Portal`.
   - *Yêu cầu*:
     - Sử dụng hình ảnh logo thực tế như trang Landing Page (`/hyperdata-lab-logo.png`).
     - Tên thương hiệu viết hoa chuẩn: **Hyperdata Lab**.
     - Bỏ hoàn toàn dòng mô tả/phụ đề ở dưới.

2. **Topbar Header (Hình 1 & 2 mới)**:
   - *Hiện tại*: Topbar Lecturer đang xếp 2 tầng gồm kicker `HYPERLABDATA / LECTURER` phía trên và tiêu đề `Review queue` phía dưới.
   - *Yêu cầu*: Chuyển đổi sang phong cách Breadcrumb ngang tinh gọn giống bên Student: `Reviewer Workspace / Review queue`.

3. **Số đếm ở Sidebar (Hình 1 cũ)**:
   - Bỏ vòng tròn màu vàng bao quanh số `1` ở mục `Review queue`. Hiển thị số `1` trần (plain number), căn phải, in đậm nhẹ màu xanh `#0071bc`.

4. **Tag Academic Preprint (Hình 2 cũ)**:
   - Xóa bỏ hoàn toàn thẻ `ACADEMIC PREPRINT` màu xanh phía trên tên bài báo.

5. **Avatar & Email Tác Giả (Hình 3 cũ)**:
   - Xóa bỏ vòng tròn avatar màu xanh và dòng chữ `Author email hidden`. Chỉ hiển thị tên tác giả: **Ashish Vaswani**.

6. **Box Phiên Bản (Hình 4 cũ)**:
   - Xóa bỏ khung viền bo góc (box) của phiên bản, chỉ hiển thị văn bản trần: **v1.0**.

---

## 2. Kế Hoạch Triển Khai

* **`LecturerShell.tsx`**:
  - Nhúng logo landing page (`/hyperdata-lab-logo.png`) kích thước 28x28 bo góc nhẹ.
  - Tên hiển thị: `<span className="student-sidebar__brand-name">Hyperdata Lab</span>` (bỏ thẻ subtitle phụ đề).
  - Mục `Review queue`: Số `pendingCount` hiển thị dạng text `<span>` trần màu xanh `#0071bc`, font 12.5px đậm nhẹ, không vòng tròn bao quanh.
  - Topbar Header: Dùng component `.student-topbar` với cấu trúc breadcrumb ngang:
    `<span className="student-topbar__crumb-root">Reviewer Workspace</span> <span className="student-topbar__crumb-sep">/</span> <span className="student-topbar__crumb-current">{title}</span>`.
* **`StudentSidebar.tsx`** (đồng bộ thương hiệu):
  - Cập nhật logo landing page và tên **Hyperdata Lab** (bỏ dòng mô tả dưới) để cả 2 phân hệ đạt tính nhất quán 100%.
* **`LecturerReviewsView.tsx`**:
  - Xóa nhãn `ACADEMIC PREPRINT`.
  - Cột Student Author: Chỉ hiển thị tên tác giả dạng text.
  - Cột Version: Hiển thị text trần `v1.0` (màu `#475569`, font 13px đậm 600).
