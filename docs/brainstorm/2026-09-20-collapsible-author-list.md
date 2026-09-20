# Brainstorm Report: Hiển thị Thu gọn & Xem chi tiết khi Bài báo có trên 3 Tác giả (Collapsible Author List)

## 1. Vấn đề & Mục tiêu (Problem & Objective)
- **Vấn đề hiện tại**: Với các bài báo khoa học có số lượng tác giả lớn (ví dụ từ GROBID trích xuất 8 - 15 tác giả), danh sách tác giả hiển thị tràn lan theo chiều dọc chiếm quá nhiều diện tích màn hình (như hình ảnh người dùng phản ánh: 8 card tác giả đẩy phần "AUDIT TIMELINE" xuống rất sâu).
- **Mục tiêu**: Khi bài báo có **trên 3 tác giả**:
  - Mặc định chỉ hiển thị **3 tác giả đầu tiên**.
  - Bổ sung nút bấm trực quan: **`Show all {total} authors ▾`** (kèm số lượng tác giả còn lại).
  - Khi người dùng bấm vào, danh sách sẽ mở rộng mượt mà hiển thị đầy đủ tất cả tác giả.
  - Khi đã mở rộng, hiển thị nút **`Show less ▴`** để người dùng có thể thu gọn lại bất cứ lúc nào.
  - Áp dụng đồng bộ cho toàn bộ các trang chi tiết có danh sách tác giả.

---

## 2. Phạm vi Áp dụng (Scope & Touchpoints)

1. **Trang Chi tiết Bài nộp Admin ([`AdminSubmissionDetailView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminSubmissionDetailView.tsx))**:
   - Vị trí: Phần **Contributing Authors** (hiển thị thẻ `.author-chip`).
   - Mặc định hiện 3 `.author-chip` đầu tiên.
   - Thêm nút chuyển đổi: `Show all {N} authors ▾` / `Show less ▴`.

2. **Trang Chi tiết Bản thảo Sinh viên / Giảng viên ([`PreprintDetailView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintDetailView.tsx))**:
   - Vị trí: Header Hero (`.student-paper-hero__authors`).
   - Mặc định hiện 3 tác giả đầu tiên.
   - Nếu có > 3 tác giả, hiển thị nút bấm nhỏ gọn `+{count} more authors ▾` / `Show less ▴`.

3. **Trang Chấm bài của Giảng viên ([`LecturerReviewDetailView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/views/LecturerReviewDetailView.tsx))**:
   - Vị trí: Cột thông tin bản thảo `Authors` ở sidebar bên phải.
   - Mặc định hiển thị 3 tác giả đầu tiên kèm `+{count} more`.
   - Bấm vào mở rộng xem toàn bộ tên tác giả.

---

## 3. Thiết kế Kỹ thuật (Technical Design)

### Trạng thái State:
```tsx
const [showAllAuthors, setShowAllAuthors] = useState(false);
const visibleAuthors = showAllAuthors ? authors : authors.slice(0, 3);
```

### Nút Bấm Toggle:
- Thiết kế nút bấm hiện đại, viền mỏng hoặc dạng ghost button, có icon chevron xoay mượt mà:
```tsx
{authors.length > 3 && (
  <button
    type="button"
    className="authors-toggle-btn"
    onClick={() => setShowAllAuthors(!showAllAuthors)}
  >
    <span>{showAllAuthors ? 'Show less ▴' : `Show all ${authors.length} authors (${authors.length - 3} more) ▾`}</span>
  </button>
)}
```

---

## 4. Kế hoạch Triển khai (Next Steps)
- Tiến hành cập nhật lần lượt 3 trang: `AdminSubmissionDetailView.tsx`, `PreprintDetailView.tsx`, `LecturerReviewDetailView.tsx`.
- Thêm CSS styling cho `.authors-toggle-btn` trong `admin-layout.css` và `paper-student.css`.
- Chạy Typecheck (`tsc`) và Next.js Build xác thực.
