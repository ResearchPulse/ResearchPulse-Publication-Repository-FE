---
title: "Brainstorm: Redesign Faculty Mentor Feedback & Reviews UX/UI"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: StudentMentorFeedbackView.tsx, paper-student.css"
---

# Báo Cáo Brainstorming: Tái Cấu Trúc UX/UI Trang Mentor Feedback & Reviews

## 1. Khảo sát hiện trạng (Codebase & UI Discovery)

Dựa trên ảnh chụp thực tế màn hình `/student/mentor-feedback` và mã nguồn [`StudentMentorFeedbackView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentMentorFeedbackView.tsx):

### Các nhược điểm UX/UI cốt lõi:
1. **Chưa đồng bộ Design System mới**:
   - Trang vẫn đang dùng layout cũ `StudentDashboardLayout` cùng các class cũ (`dashboard-page-header`, `dashboard-card`, `dashboard-metrics-grid`, cùng hàng loạt inline styles `style={{ ... }}`) thay vì component thống nhất [`StudentShell`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/components/StudentShell.tsx).
2. **Nút điều hướng bị lặp vô nghĩa**:
   - Nút to màu xanh `My Manuscripts` đặt ở góc trên bên phải header hoàn toàn thừa thãi, vì ngay trên Sidebar bên trái dòng đầu tiên đã là `My Manuscripts`.
3. **Metric Card thô sơ và từ ngữ kỹ thuật**:
   - Thẻ thứ 3 mang tên `Feedback Records` với phụ đề *"Loaded from publication API"* mang tính debug/kỹ thuật của lập trình viên chứ không phải ngôn ngữ học thuật thân thiện với sinh viên.
4. **Empty State "vô hồn" (Vấn đề lớn nhất trong ảnh chụp)**:
   - Khi chưa có phản hồi nào, giao diện chỉ vỏn vẹn một dòng chữ thô: *"No reviewer feedback has been recorded yet."* lọt thỏm giữa trang trắng.
   - Thiếu minh họa trực quan, thiếu giải thích quy trình (Sinh viên không biết: Khi nào giảng viên sẽ phản hồi? SLA phản biện là bao lâu? Làm sao để gửi bản thảo vào quy trình mentor?).
5. **Card phản hồi khi có dữ liệu còn đơn điệu**:
   - Chưa làm nổi bật các hạng mục hành động (Action Items Checklist), phiên bản bản thảo liên quan (v1.0, v1.1), và nút CTA mở ngay trình soạn thảo phiên bản chỉnh sửa (`/student/my-preprints/:id/edit`).

---

## 2. Các phương án thiết kế đề xuất

### 🌟 Phương án 1 (Khuyến nghị cao nhất - Hộp Thư Phản Biện Học Thuật Chuẩn Mực - Academic Review Hub):
* **Kiến trúc & Bố cục**:
  - Chuyển sang sử dụng `StudentShell` đồng bộ với trang `My Manuscripts` và `Start a New Preprint`.
  - Bỏ nút `My Manuscripts` bị lặp ở header.
* **3 Thẻ Thống kê Tinh tế (Academic Mentorship Metrics)**:
  - **Cần chỉnh sửa (Action Required)**: Nổi bật với viền hổ phách/đỏ nếu `> 0` kèm thông điệp *"Yêu cầu sửa đổi từ giảng viên hướng dẫn"*.
  - **Đang phản biện (Under Review)**: Thống kê các bản thảo đang trong quy trình đánh giá kèm chỉ số *"Đang trong vòng phản biện 48h SLA"*.
  - **Đã duyệt / Sẵn sàng xuất bản (Approved & Ready)**: Thống kê các phản hồi tích cực/chấp thuận xuất bản.
* **Empty State Truyền cảm hứng & Hướng dẫn quy trình (Inspiring Empty State)**:
  - Icon minh họa học thuật trang nhã (Giảng viên hướng dẫn & Bản thảo).
  - Tiêu đề: *"Chưa có nhận xét phản biện nào"*.
  - Đoạn hướng dẫn: *"Khi bạn nộp bài báo khoa học, giảng viên phụ trách chuyên ngành sẽ đọc duyệt, chấm điểm và gửi nhận xét chi tiết kèm danh sách sửa đổi tại đây trong vòng 48–72 giờ."*
  - 2 nút hành động nhanh: `Xem danh sách bản thảo (My Manuscripts)` hoặc `Nộp bản thảo mới (New Submission)`.
* **Card Nhận Xét Phản Biện Chuyên Nghiệp (Khi có dữ liệu)**:
  - Header: Avatar giảng viên, chức danh học hàm/học vị, ngày đánh giá, nhãn quyết định (`NEEDS REVISION` nổi bật màu cam, `APPROVED` màu xanh ngọc).
  - Thẻ thông tin bài báo: Tên bản thảo, Phiên bản (`v1.0`), Chuyên ngành (`Discipline Tag`).
  - Trích dẫn nhận xét của giảng viên trong khung blockquote học thuật trang trọng.
  - Danh sách khuyến nghị / đầu việc cần bổ sung (Action Items checklist).
  - Nút bấm trực tiếp: *"Mở trang nộp bản sửa đổi (Revise Manuscript)"* dẫn thẳng đến `/student/my-preprints/[id]/edit`.

---

### Phương án 2 (Bảng Dòng Thời Gian Phản Biện - Timeline Stream):
* Giữ cấu trúc stream cuộn dọc theo dạng **Dòng thời gian tương tác (Interactive Timeline)**.
* Mỗi phản hồi của giảng viên được biểu diễn như một mốc sự kiện (Milestone): Ngày gửi bài -> Giảng viên tiếp nhận -> Nhận xét vòng 1 -> Bản nộp lại -> Quyết định cuối cùng.
* **Ưu điểm**: Thấy rõ lịch sử tương tác giữa sinh viên và giảng viên.
* **Nhược điểm**: Nếu sinh viên chỉ có 1 bài hoặc chưa có feedback thì timeline bị cụt; phù hợp hơn cho trang chi tiết của từng bài báo riêng lẻ.

---

### Phương án 3 (Tối Giản Đơn Thuần - Quick Polish):
* Giữ nguyên cấu trúc hiện tại nhưng:
  - Đổi layout sang `StudentShell`.
  - Bỏ nút `My Manuscripts` thừa.
  - Vẽ lại Empty State có icon và nút hành động.
  - Sửa lại text "Loaded from publication API" thành "Approved Preprints".
* **Ưu điểm**: Làm nhanh nhất.
* **Nhược điểm**: Chưa tạo được trải nghiệm wow và thiếu các tiện ích xem action items checklist của phản biện.
