# Brainstorm: Tách biệt thông tin tác giả giữa Giảng viên và Sinh viên (Dynamic Adaptive Fields) & Nhận diện tự động theo URL

**Ngày tạo**: 2026-09-21  
**Cập nhật**: 2026-09-21 (Bổ sung nhận diện ngữ cảnh URL `/lecturer` và chuẩn hóa nhãn MSGV)  
**Chủ đề**: Phân tách và linh hoạt hóa trường định danh tác giả (Mã số sinh viên MSSV vs Mã Số Giảng Viên MSGV) trên form nộp/chỉnh sửa bản thảo và hồ sơ giảng viên.

---

## 1. Vấn đề & Thực trạng trong Codebase

- **Hiện tại**: Component [`PreprintEditorView.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintEditorView.tsx) được dùng chung cho cả Sinh viên (`/student/my-preprints/new`) và Giảng viên (`/lecturer/submissions/new`).
- **Bất cập mới phát hiện**:
  1. Khi người dùng đang ở đường dẫn giảng viên `/lecturer/submissions/new`, modal tác giả chính vẫn hiển thị mặc định `Vai trò: Sinh viên` và nhãn `MSSV`. Nguyên nhân do hệ thống kiểm tra vai trò dựa trên tài khoản người dùng hoặc fallback mặc định về Sinh viên thay vì tự động nhận diện theo URL `/lecturer`.
  2. Nhãn hiển thị cho giảng viên trước đây là `Mã giảng viên / Cán bộ (Staff ID)` dài dòng và chưa đồng bộ với văn phong học thuật Việt Nam. Người dùng yêu cầu chuẩn hóa thành **`Mã Số Giảng Viên (MSGV)`** (tương tự như `Mã số sinh viên (MSSV)`).

---

## 2. Các phương án đã đánh giá

| Phương án | Chi tiết | Ưu điểm | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Phương án A** | Chỉ tự động gán Giảng viên cho tác giả chính tại URL `/lecturer` + Đổi nhãn MSGV. | Nhanh | Khi thêm đồng tác giả mới vẫn mặc định là Sinh viên, giảng viên phải chọn lại dropdown. |
| **Phương án B** *(Người dùng đã chọn)* | Tự động nhận diện Giảng viên cho cả tác giả chính và form thêm đồng tác giả khi ở URL `/lecturer` + Đổi nhãn thành `Mã Số Giảng Viên (MSGV)`. | - Trải nghiệm liền mạch nhất cho Giảng viên<br>- Giảm thao tác chọn dropdown<br>- Chuẩn hóa thuật ngữ MSGV | **Phương án tối ưu nhất - Đã được phê duyệt** |

---

## 3. Chi tiết Thiết kế Giải pháp đã thống nhất (Phương án B)

### A. Tự động nhận diện ngữ cảnh URL Giảng viên (`isLecturerRoute`)
- Xác định `isLecturer = user?.role === 'LECTURER' || isLecturerRoute`.
- Khi ở URL `/lecturer/*`:
  - **Tác giả chính (`authors[0]`)**: Mặc định vai trò là `LECTURER`.
  - **Mở modal chỉnh sửa (`openEditAuthorModal`)**: Nếu đang ở `/lecturer/*`, vai trò mặc định khởi tạo là `LECTURER`.
  - **Form thêm đồng tác giả**: Giá trị khởi tạo `newAuthorRole` mặc định là `LECTURER`. Sau khi thêm đồng tác giả thành công, reset lại là `isLecturerRoute ? 'LECTURER' : 'STUDENT'`.
  - **Phân tích PDF (GROBID Smart Populate)**: Khi trích xuất PDF ở URL `/lecturer/*`, tác giả chính tự động gán `role: 'LECTURER'`.
  - **Nút "Điền nhanh"**: Tự động set `editRole: 'LECTURER'`.

### B. Chuẩn hóa nhãn thành "Mã Số Giảng Viên (MSGV)"
1. **Modal "Chỉnh sửa tác giả"**:
   - Nhãn: `editRole === 'LECTURER' ? 'Mã Số Giảng Viên (MSGV)' : 'Mã số sinh viên (MSSV)'`
   - Placeholder: `editRole === 'LECTURER' ? 'Ví dụ: MSGV0042' : 'Ví dụ: SE170123'`
   - Hint: `editRole === 'LECTURER' ? 'Dùng để tự động match và liên kết hồ sơ giảng viên' : 'Dùng để tự động match tài khoản sinh viên'`
2. **Form inline "Thêm đồng tác giả"**:
   - Placeholder: `newAuthorRole === 'LECTURER' ? 'Mã Số Giảng Viên (MSGV)' : 'Mã số sinh viên (MSSV)'`
3. **Thẻ tác giả (Author Card & Co-Author List)**:
   - Hiển thị: `MSGV: ${studentId}` khi tác giả là Giảng viên (thay vì `Mã CB:`).
4. **Hồ sơ Giảng viên (`LecturerProfileView.tsx`)**:
   - Hiển thị nhãn: `Mã Số Giảng Viên (MSGV)` (Tiếng Anh: `Lecturer Identifier (MSGV)`).

---

## 4. Kế hoạch Xác thực (Verification Plan)

1. **Typecheck**: `npx tsc --project tsconfig.json --noEmit` đạt 0 lỗi.
2. **Xác thực trực quan**:
   - Truy cập `http://localhost:3003/lecturer/submissions/new`.
   - Bấm nút "Chỉnh sửa" tại thẻ tác giả chính -> Modal mở ra hiển thị:
     - Vai trò: **Giảng viên** (tự động nhận diện)
     - Nhãn: **Mã Số Giảng Viên (MSGV)**
     - Placeholder: **Ví dụ: MSGV0042**
   - Kiểm tra form thêm đồng tác giả: Dropdown mặc định là **Giảng viên** và placeholder là **Mã Số Giảng Viên (MSGV)**.
   - Kiểm tra `http://localhost:3003/lecturer/profile`: Nhãn hiển thị **Mã Số Giảng Viên (MSGV)**.
