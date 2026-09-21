# Brainstorm Report: Chuẩn hóa Giao diện Kho bài báo công khai (Student Published View)

- **Date:** 2026-09-20 22:50
- **Feature Area:** `src/features/preprint/views/StudentPublishedView.tsx` & `src/features/preprint/styles/paper-student.css`
- **Route:** `/student/published`
- **Status:** Approved (Option 1 - Chuẩn hóa Catalog Card Grid theo Design System)

---

## 1. Vấn đề & Bối cảnh

Trang **Kho bài báo công khai** (`/student/published`) dành cho sinh viên và bạn đọc tra cứu các bài báo preprint đã được xuất bản chính thức. Tuy nhiên, giao diện hiện tại bị lệch chuẩn so với các màn hình khác trong hệ thống Hyperdata Lab:
1. **Thẻ thống kê (Metric Cards):** Thiếu hoàn toàn icon nhận diện (`.student-metric-icon`), chỉ hiển thị số và nhãn trần trụi, gây cảm giác đơn điệu và không đồng bộ với `PreprintListView`.
2. **Thanh lọc Lĩnh vực (Category Tabs):** Đang lấy trực tiếp từ cơ sở dữ liệu bao gồm các chuỗi dữ liệu test (`dsd`, `da`), render hơn 10 tab pill dàn trải làm tràn hàng, đẩy ô tìm kiếm rớt xuống hàng riêng.
3. **Thẻ bài báo (Paper Cards):** Sử dụng toàn bộ inline styles cứng (`style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', ... }}`) và hàm JavaScript `onMouseEnter/onMouseLeave` thay vì CSS classes trong `paper-student.css`. Màu sắc và bo góc bị lệch khỏi token hệ thống (`#dce4e9`, `#122331`, `12px`).
4. **Trạng thái rỗng & Phân trang:** Trạng thái empty và phân trang chưa đồng bộ chuẩn component.

---

## 2. Các phương án đã đánh giá

| Phương án | Mô tả | Ưu điểm | Nhược điểm | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **Phương án 1 (Được chọn)** | Chuẩn hóa Lưới thẻ Khám phá (Catalog Card Grid) theo Design System | Giữ trải nghiệm khám phá khoa học (đọc abstract, từ khóa, xem trích dẫn); chuẩn hóa toàn bộ token CSS, metric icon và dropdown lọc ngành | Cần bổ sung class CSS mới cho Card vào `paper-student.css` | **Tối ưu nhất cho trang kho tài liệu mở** |
| **Phương án 2** | Chuyển hoàn toàn sang Bảng dữ liệu (Table View) | Đồng bộ 100% với màn hình "Bản thảo của tôi" | Người đọc không lướt nhanh được abstract và từ khóa của bài nghiên cứu | Kém trực quan cho việc đọc/khám phá |
| **Phương án 3** | Chế độ xem kép (Grid / Table Toggle) | Linh hoạt tối đa cho người dùng | Tăng độ phức tạp logic và bảo trì 2 view | Chưa cần thiết ở giai đoạn hiện tại (YAGNI) |

---

## 3. Giải pháp chi tiết được phê duyệt (Phương án 1)

### 3.1. Thẻ Thống kê (Metric Cards Strip)
- Cập nhật 3 thẻ metric với cấu trúc chuẩn:
  - **Thẻ 1 (Tổng bài báo):** Icon văn bản tài liệu với nền xanh `.student-metric-icon--blue`
  - **Thẻ 2 (Lĩnh vực nghiên cứu):** Icon nón học thuật với nền xanh lá `.student-metric-icon--green`
  - **Thẻ 3 (Kết quả hiển thị):** Icon kính lúp với nền hổ phách/cam `.student-metric-icon--orange`
- Giữ animation fade-in so le chuẩn của hệ thống.

### 3.2. Thanh Filter & Search Toolbar
- Thay thế thanh tab pill bị vỡ bằng thanh toolbar 1 hàng chuẩn `.student-filter-toolbar`:
  - **Bên trái:** Tab phân loại ngắn gọn có badge đếm số lượng: `Tất cả bài báo (${count})`.
  - **Bên phải:**
    - Dropdown lọc **Lĩnh vực nghiên cứu** (lọc bỏ các chuỗi rác `dsd`, `da`, hiển thị các ngành học thuật chuẩn).
    - Ô tìm kiếm chuẩn `.student-search-box` hỗ trợ tìm theo tiêu đề, tác giả, tóm tắt và từ khóa.

### 3.3. Chuẩn hóa Thẻ Bài báo (Catalog Cards)
- Di chuyển toàn bộ inline styles sang các class chuyên dụng trong `paper-student.css`:
  - `.student-pub-grid`: CSS Grid responsive (`repeat(auto-fill, minmax(360px, 1fr))`).
  - `.student-pub-card`: Bo góc `12px`, viền `#dce4e9`, nền `#ffffff`, shadow nhẹ, hover mượt mà với viền `#0071bc` và shadow màu xanh thương hiệu.
  - `.student-pub-card__badge-row`: Badge lĩnh vực màu xanh Hyperdata `#0071bc` trên nền `#f0f7fc`, badge phiên bản (`v1.0`, `v2.0`).
  - `.student-pub-card__title`: Typography chuẩn `#122331`, font-weight 700.
  - `.student-pub-card__author`: Icon tác giả + tên tác giả dạng ellipsis.
  - `.student-pub-card__abstract`: Cắt dòng 3 dòng (`-webkit-line-clamp: 3`).
  - `.student-pub-card__tags`: Tag từ khóa `#tag` gọn gàng.
  - `.student-pub-card__footer`: Ngày xuất bản và nút text action *Xem & Trích dẫn ->*.

### 3.4. Trạng thái rỗng & Modal Trích dẫn
- Sử dụng `.student-empty-card` chuẩn khi không có kết quả.
- Giữ nguyên Modal Trích dẫn (APA, IEEE, BibTeX) đã có và đang hoạt động tốt.

---

## 4. Kế hoạch xác thực (Verification Plan)
- Chạy `npx tsc --noEmit` kiểm tra type safety.
- Mở trang `http://localhost:3003/student/published` trên trình duyệt để kiểm tra:
  - Bố cục 1 hàng chuẩn của toolbar (Tabs bên trái, Dropdown + Search bên phải).
  - Thẻ metric hiển thị icon và màu sắc đồng bộ.
  - Lưới bài báo hiển thị đẹp mắt, hover mượt mà, không còn inline styles.
  - Bộ lọc lĩnh vực và ô tìm kiếm hoạt động chính xác.
  - Modal xem chi tiết và trích dẫn hoạt động trơn tru.
