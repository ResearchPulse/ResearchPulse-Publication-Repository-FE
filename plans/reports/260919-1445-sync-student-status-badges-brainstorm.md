# Brainstorm Report: Đồng bộ Status Badges của Student giống Admin

- **Thời gian**: 2026-09-19 14:45
- **Tác vụ**: Đưa huy hiệu trạng thái của Student về cùng chuẩn visual & typography với Admin.

## Bối cảnh & Vấn đề phát hiện
1. **Sự không đồng nhất về kiểu dáng**:
   - Ở Admin (`/admin/dashboard`), huy hiệu là hình viên thuốc tròn (`border-radius: 9999px`), padding rộng thoáng (`padding: 4px 12px`), chữ in hoa đậm (`font-weight: 800`).
   - Ở Student (`/student/my-preprints`), lớp CSS `.student-content .user-badge` đang áp đặt `border-radius: 6px` và dải màu Oklch nhạt, khiến huy hiệu biến thành hình chữ nhật góc tù cụt.
2. **Sự không đồng nhất về nhãn chữ trạng thái**:
   - Cùng một bài viết đã xuất bản (`BERT`), Admin hiển thị nhãn **`PUBLISHED`**, nhưng Student hiển thị là **`APPROVED`**.

## Quyết định thiết kế (Đã thống nhất với người dùng)
- **Hình dáng**: Chuyển toàn bộ sang dạng viên thuốc tròn (`border-radius: 9999px`).
- **Màu sắc**: Chuẩn hóa theo bảng màu Admin (`#e0f2fe`/`#0369a1`, `#dcfce7`/`#166534`, `#fef3c7`/`#92400e`, `#fee2e2`/`#991b1b`).
- **Nhãn xuất bản**: Hiển thị **`PUBLISHED`** cho các bài viết đã xuất bản thành công.
- **Phạm vi**: Đồng bộ trên toàn bộ các trang Student.
