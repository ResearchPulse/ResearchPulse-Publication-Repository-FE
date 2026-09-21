# Brainstorm: Hiện trạng và Thiết kế tính năng Tìm kiếm (Search) trong phân hệ Sinh viên

**Ngày tạo**: 2026-09-21  
**Chủ đề**: Đánh giá hiện trạng tính năng Search trong phân hệ Student và kích hoạt Global Search trên thanh Topbar.

---

## 1. Khảo sát Hiện trạng Codebase (Codebase Scout Findings)

Qua rà soát toàn bộ các trang thuộc phân hệ Sinh viên (`/student/*`):

| Vị trí | Tệp tin / Component | Trạng thái Search | Chi tiết hoạt động |
| :--- | :--- | :--- | :--- |
| **Topbar chung** | [`StudentTopbar.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/components/StudentTopbar.tsx) | 🟡 **Chỉ là Mock / Dummy UI** | Có ô input và icon kính lúp nhưng không có state, không có handler `onChange`, không có submit form hay điều hướng. |
| **Bản thảo của tôi** | [`PreprintListView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintListView.tsx) | 🟢 **Đã có Local Search** | Đã có ô tìm kiếm cục bộ lọc realtime theo `title`, `abstract`, `discipline`, `keywords`. Tuy nhiên chưa hỗ trợ nhận `?search=...` từ URL. |
| **Kho bài báo đã xuất bản** | [`StudentPublishedView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentPublishedView.tsx) | 🟢 **Đã có Local Search** | Đã có ô tìm kiếm cục bộ lọc theo tên bài báo, tác giả, từ khóa và danh mục. |
| **Lịch sử phiên bản** | [`StudentVersionArchiveView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentVersionArchiveView.tsx) | 🟢 **Đã có Local Search** | Đã có ô tìm kiếm lọc theo tiêu đề, DOI, mã băm SHA-256, tóm tắt thay đổi. |
| **Nhận xét của giảng viên** | [`StudentMentorFeedbackView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentMentorFeedbackView.tsx) | 🟢 **Đã có Local Search** | Đã có ô tìm kiếm lọc theo tiêu đề bản thảo, tên người phản biện và nội dung nhận xét. |
| **Backend API** | `publication.service.ts` | 🟢 **Đã hỗ trợ Query Search** | `GET /publications?search=...` đã hỗ trợ lọc theo tiêu đề, tóm tắt, từ khóa và DOI. |

---

## 2. Vấn đề & Yêu cầu Người dùng

- **Câu hỏi của người dùng**: "Feature search trang student đã có chưa?"
- **Phản hồi**: Các trang danh sách con đều đã có ô tìm kiếm nội bộ, nhưng **ô tìm kiếm trên thanh Topbar (vị trí nổi bật nhất mà người dùng nhìn thấy đầu tiên)** hiện tại chưa hoạt động.
- **Lựa chọn đã thống nhất**: Kích hoạt ô tìm kiếm trên Topbar thành **Global Search**, cho phép người dùng gõ từ khóa từ bất kỳ trang nào và nhấn Enter để điều hướng và tự động lọc danh sách bài báo.

---

## 3. Thiết kế Giải pháp đã Thống nhất (Global Search trên Topbar)

### A. Kích hoạt Topbar Search ([`StudentTopbar.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/components/StudentTopbar.tsx))
- Chuyển `<div>` ô tìm kiếm thành thẻ `<form onSubmit={handleSearch}>`.
- Quản lý state `keyword` đồng bộ với query param trên URL:
  - Khi người dùng gõ từ khóa và nhấn `Enter` (hoặc click icon tìm kiếm):
    - Tự động điều hướng đến: `/student/my-preprints?search=${encodeURIComponent(keyword.trim())}`.
  - Có nút xóa nhanh `×` khi có từ khóa đang nhập.

### B. Hỗ trợ Query Param trên trang Bản thảo ([`PreprintListView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintListView.tsx))
- Đọc `searchParams = useSearchParams()`.
- Tự động khởi tạo `searchQuery` từ `searchParams.get('search')` hoặc `searchParams.get('q')`.
- Khi URL thay đổi param `search`, cập nhật lại `searchQuery` để lọc danh sách bản thảo tức thì.
- Đồng bộ ngược: Khi người dùng gõ tìm kiếm tại ô local search của trang, có thể cập nhật URL (shallow/replace state) để người dùng có thể chia sẻ hoặc bookmark kết quả tìm kiếm.

### C. Hỗ trợ tương tự trên trang Kho bài báo đã xuất bản ([`StudentPublishedView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentPublishedView.tsx))
- Tự động nhận diện `searchParams.get('search')` để lọc ngay khi người dùng được điều hướng tới kho bài báo đã xuất bản.

---

## 4. Kế hoạch Triển khai & Xác thực (Verification Plan)

1. **Typecheck**: Chạy `npx tsc --project tsconfig.json --noEmit` đạt 0 lỗi.
2. **Kiểm tra trực quan**:
   - Từ trang bất kỳ (ví dụ `/student/account` hoặc `/student/mentor-feedback`):
     - Nhập từ khóa (ví dụ: `AI`, `Machine Learning`, `SE100000`) vào ô tìm kiếm trên Topbar và nhấn `Enter`.
     - Xác nhận chuyển hướng đến `/student/my-preprints?search=...` và danh sách tự động lọc ra các bản thảo phù hợp.
     - Ô search trên Topbar và ô search trên bảng danh sách hiển thị khớp từ khóa.
     - Bấm nút `×` để xóa từ khóa -> Danh sách phục hồi đầy đủ.
