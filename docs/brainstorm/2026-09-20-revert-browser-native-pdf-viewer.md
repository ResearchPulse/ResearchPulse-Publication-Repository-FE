# Brainstorm Report: Khôi phục Trình đọc PDF mặc định của Trình duyệt (Browser Native PDF Viewer)

## 1. Problem Statement & Context
- **Hiện tượng**: Sau khi merge nhánh `origin/hao/feature/new-business-rule` (từ nhánh `dev`), giao diện xem file PDF trong trang phản biện của Giảng viên (`/lecturer/reviews/[id]`) và chi tiết bản thảo (`/student/my-preprints/[id]`) bị thay đổi sang component mới `NativePdfViewer` (`react-pdf`).
- **Phản hồi của người dùng**: Giao diện bị lạ lẫm, hiển thị trang canvas cuộn dọc kéo dài, có thanh toolbar custom và badge trang, không còn là trình đọc PDF quen thuộc của trình duyệt.
- **Nhu cầu**: Người dùng muốn khôi phục lại trình đọc PDF mặc định của trình duyệt (`<iframe>` chuẩn của Chrome/Edge) để có trải nghiệm mượt mà, đầy đủ thanh công cụ học thuật (thumbnails trang, phóng to thu nhỏ vừa màn hình, xoay trang, Ctrl+F tìm kiếm text gốc, in ấn trực tiếp).

---

## 2. Evaluated Approaches

### Phương án 1: Khôi phục lại thẻ `<iframe>` mặc định của trình duyệt (Lựa chọn được người dùng chốt)
- **Cơ chế**: Sử dụng thẻ `<iframe className="lecturer-pdf-viewer" src={downloadUrl} />`.
- **Ưu điểm**:
  - Trình duyệt (Chrome/Edge/Brave/Firefox) tự kích hoạt trình xem PDF Native C++ cực nhanh, nhẹ và ổn định.
  - Tích hợp đầy đủ: Tìm kiếm Ctrl+F tốc độ cao, danh sách trang/thumbnails ở sidebar trái, xoay trang, in, tải về, xem 2 trang cùng lúc (*Two-page view*).
  - Không tải thêm bộ thư viện JS nặng (`react-pdf`, `pdfjs-dist`) và không cần chạy API proxy trung gian `/api/pdf-proxy`.
  - Giữ nút tiện ích `Open PDF` / `Download` ở đầu bảng để người dùng có thể mở tab mới bất cứ lúc nào.
- **Nhược điểm**: Tùy thuộc vào trình duyệt của client (mặc dù hiện nay 100% Chrome/Edge/Firefox/Safari trên Desktop đều hỗ trợ native PDF).

### Phương án 2: Tinh chỉnh giao diện `NativePdfViewer` (`react-pdf`)
- **Cơ chế**: Giữ nguyên `react-pdf` nhưng giới hạn chiều cao khung xem, làm thanh cuộn riêng và ẩn toolbar thừa.
- **Ưu điểm**: Kiểm soát được 100% CSS styling đồng bộ theo Hyperdata Design System.
- **Nhược điểm**: Nặng, phụ thuộc CDN worker PDF.js, thiếu các tính năng nâng cao (Ctrl+F tìm kiếm trong PDF phức tạp hơn, không có thumbnails native).

---

## 3. Final Agreed Solution
Khôi phục sử dụng thẻ `<iframe>` chuẩn trình duyệt:
1. **[`LecturerReviewDetailView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/views/LecturerReviewDetailView.tsx)**:
   - Thay thế `<NativePdfViewer>` bằng `<iframe className="lecturer-pdf-viewer" src={downloadUrl} title="Manuscript PDF Preview" />`.
   - Giữ nút `Open PDF` ở header panel để giảng viên có thể mở tab mới xem toàn màn hình khi cần.
2. **[`PreprintDetailView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintDetailView.tsx)**:
   - Tại Tab `PDF_VIEW`, thay thế `<NativePdfViewer>` bằng thẻ `<iframe>` với kích thước linh hoạt, viền mềm mại.
3. **Dọn dẹp code thừa**:
   - Bỏ import dynamic `NativePdfViewer` không còn sử dụng.

---

## 4. Implementation Steps
1. Cập nhật `src/features/lecturer/views/LecturerReviewDetailView.tsx`.
2. Cập nhật `src/features/preprint/views/PreprintDetailView.tsx`.
3. Kiểm tra Next.js build (`npm run build`) và kiểm tra giao diện trên trình duyệt.
