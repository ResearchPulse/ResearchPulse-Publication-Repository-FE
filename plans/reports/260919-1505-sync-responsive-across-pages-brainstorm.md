# Brainstorm Report: Đồng bộ Responsive Design giữa các trang Admin & Student

- **Thời gian**: 2026-09-19 15:05
- **Tác vụ**: Chuẩn hóa hệ thống Responsive đồng nhất giữa Admin Workspace và Student Workspace.

## Bối cảnh & Khảo sát hiện trạng
1. **Layout & Khung viền (Frame & Sidebar)**:
   - Cả Admin và Student đều dùng sidebar 260px và topbar 64px, nhưng quy tắc padding và co giãn ở tablet và mobile chưa ăn khớp.
   - Ở Tablet (768px - 1024px), sidebar vẫn cần giữ cố định 260px và nội dung điều chỉnh padding để hiển thị rộng rãi, không bị gò bó.
   - Ở Mobile (<= 768px), sidebar trượt thành Drawer (hamburger) kèm backdrop che mờ và nút đóng.
2. **Dãy thẻ số liệu (Metrics Grid)**:
   - Đồng bộ quy tắc: 4 cột trên Desktop (> 1024px) -> 2 cột trên Tablet (769px - 1024px) -> 1 cột trên Mobile (<= 768px).
3. **Thanh lọc và tìm kiếm (Filter Toolbar)**:
   - Dãy Tab Pills trạng thái hỗ trợ vuốt ngang mượt mà (`overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch`) trên mobile.
   - Bổ sung quy tắc CSS cho `.student-search-sort-group` để ô tìm kiếm và dropdown sắp xếp tự động co giãn full-width trên di động, tránh tràn màn hình.
4. **Bảng học thuật (Repository Tables)**:
   - Khóa `min-width: 680px` cho toàn bộ `.dashboard-table` và `.data-table` trong khung `.dashboard-table-wrapper` có thanh cuộn ngang mượt mà, đảm bảo chữ, ngày tháng và huy hiệu trạng thái không bao giờ bị co ép hoặc gãy chữ trên mobile.
5. **Trang chi tiết bản thảo (Submission Detail)**:
   - Lưới 2 cột `.detail-grid` xếp chồng 1 cột trên màn hình <= 1024px.
   - Các nút quyết định (Publish, Request Revision, Reject) chuyển thành xếp dọc full-width trên điện thoại (<= 640px) để thao tác cảm ứng dễ dàng.

## Quyết định thiết kế đã thống nhất
- **Tablet (768px - 1024px)**: Giữ thanh sidebar 260px cố định, thu gọn padding nội dung để tối ưu không gian.
- **Mobile (<= 768px)**: Chuyển sidebar thành Drawer trượt có nút hamburger; bảng học thuật giữ nguyên cấu trúc chuẩn kèm thanh cuộn ngang mượt mà.
