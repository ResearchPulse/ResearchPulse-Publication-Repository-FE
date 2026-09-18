---
title: "Eliminate Redundant Dashboard & Unify into My Manuscripts"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: Student Navigation, Routing, and Workspace UX"
---

# Eliminate Redundant Dashboard & Unify into My Manuscripts

## 1. Executive Summary & Brutal Honesty

Ý định **bỏ luôn trang Dashboard** của bạn là **hoàn toàn chính xác và rất chuẩn mực về UX phần mềm học thuật (Scholarly Repository UX)**!

### Tại sao nên bỏ Dashboard?
1. **Vi phạm nguyên tắc DRY & Gây dư thừa 90% tính năng**:
   - `/student/dashboard` hiện chỉ hiển thị lại danh sách bài báo (`Recent Manuscripts`) - thực chất chính là bảng của `/student/my-preprints`.
   - Người dùng khi vào phân hệ sinh viên mục đích duy nhất là: xem các bản thảo của mình, tình trạng duyệt thế nào, có cần chỉnh sửa không, và nộp bản mới.
2. **Chuẩn hóa theo các hệ thống học thuật quốc tế (arXiv, BioRxiv, Nature Editorial Manager)**:
   - Các cổng dành cho tác giả/nghiên cứu sinh (Author Workspace) không bao giờ tách riêng "Dashboard" và "My Manuscripts". Trang danh sách bản thảo (Submissions / Manuscripts) **chính là Dashboard trung tâm**.
3. **Giảm gánh nặng nhận thức (Cognitive Load)**:
   - Sinh viên không phải phân vân "vào Dashboard hay vào My Manuscripts?".
   - Menu Sidebar gọn gàng, trực diện.

---

## 2. So sánh và Phương án tích hợp giá trị của Dashboard

Để khi bỏ Dashboard, hệ thống **không bị mất đi bất kỳ tính năng hữu ích nào**:

| Thành phần trên Dashboard cũ | Xử lý khi bỏ Dashboard |
|-----------------------------|------------------------|
| **Bảng Recent Manuscripts** | Đã có sẵn và hoàn thiện hơn rất nhiều ở `/student/my-preprints` (có tìm kiếm, sort, lọc theo tab status). |
| **Banner cảnh báo "Cần sửa bản thảo" (Revision Alert)** | Tích hợp thẳng lên đầu trang `/student/my-preprints` khi sinh viên có bài báo bị giảng viên yêu cầu sửa (`needsRevision > 0`). Đặt ở đây còn đập vào mắt sinh viên nhanh và hiệu quả hơn! |
| **4 Thẻ số liệu (Metrics Cards)** | Tích hợp hàng 4 thẻ thống kê trực quan lên đầu trang `/student/my-preprints` (phía trên bảng). |
| **Faculty Advisory Activity** | Sinh viên xem trực tiếp ở mục **Mentor Feedback** trên sidebar (hoặc xem trong chi tiết bài báo). |
| **Submission Guidance** | Đã có sẵn trong trang **New Submission** (`/student/my-preprints/new`). |

---

## 3. Kiến trúc luồng điều hướng mới (New Navigation Flow)

1. **Routing**:
   - `/student` -> Tự động chuyển hướng (`redirect`) sang `/student/my-preprints`.
   - `/student/dashboard` -> Chuyển hướng 301/rewrite sang `/student/my-preprints` để tránh lỗi 404 cho các link cũ.
2. **Menu Sidebar (`StudentSidebar.tsx`)**:
   - Bỏ mục `Dashboard`.
   - Mục đầu tiên của `WORKSPACE` là **`My Manuscripts`** (kèm badge tổng số bài).
   - Mục thứ 2: **`New Submission`**.
   - Nhóm `ACADEMIC REVIEW`: **`Mentor Feedback`** & **`Version Archive`**.
3. **Topbar**:
   - Breadcrumb: `Scholar Workspace / My Manuscripts`.
