# Brainstorm: Quy trình Review Phân định Sinh viên / Giảng viên & Double-Blind Review Chuẩn

**Ngày tạo**: 2026-09-20  
**Chủ đề**: Phân định cơ chế hiển thị danh tính trong quy trình phản biện bài báo khoa học (Student Paper vs Faculty Paper) và chuẩn hóa Double-Blind Review với hội đồng 3 Giảng viên.

---

## 1. Bối cảnh & Vấn đề hiện tại

Trong đợt cập nhật trước, hệ thống đã áp dụng cơ chế **Ẩn danh (Masking)** cho mọi bài phản biện của Giảng viên:
- Mọi bài trong hàng đợi của Giảng viên (`/lecturer/reviews`) đều hiển thị tác giả là `Anonymous Author` kèm badge `Double-Blind`.
- Khi Giảng viên vào chấm bài chi tiết (`/lecturer/reviews/:id`), thông tin tác giả cũng bị ẩn toàn bộ.

**Bất cập thực tế:**
- Khi Giảng viên chấm bài nghiên cứu khoa học / đồ án của **Sinh viên**, Giảng viên cần biết sinh viên nào nộp (Họ tên, MSSV, Ngành/Khoa) để đánh giá đúng năng lực, ngữ cảnh học thuật và hướng dẫn sinh viên. Việc ẩn danh hoàn toàn thông tin sinh viên làm mất đi tính tương tác sư phạm cần thiết.
- Ngược lại, đối với bài viết của **Giảng viên** (Faculty Paper), việc phản biện giữa các đồng nghiệp trong trường cần phải **Double-Blind tuyệt đối** (Ẩn danh Hai chiều) để đảm bảo tính khách quan tối đa, tránh sự nể nang hay xung đột lợi ích giữa các giảng viên.

---

## 2. Ma trận Phân định Quyền hiển thị & Cơ chế Ẩn danh

Hệ thống phân loại bài viết dựa trên role của người nộp: `uploader.role` (`STUDENT` vs `LECTURER`).

| Tiêu chí | Bài của Sinh viên (`uploader.role === 'STUDENT'`) | Bài của Giảng viên (`uploader.role === 'LECTURER'`) |
| :--- | :--- | :--- |
| **Mô hình phản biện** | **Single-Blind / Open Review có điều kiện** | **Double-Blind Review tuyệt đối (Ẩn danh 2 chiều)** |
| **Giảng viên phản biện thấy gì?** | **Thấy đầy đủ danh tính Sinh viên**: Họ tên, MSSV, Khoa/Ngành, Email. Badge hiển thị: `Student` | **Ẩn danh hoàn toàn tác giả**: Hiển thị `Anonymous Author`, cơ quan `Double-Blind Peer Review`, ẩn email/SĐT. Badge hiển thị: `Double-Blind` |
| **Tác giả thấy gì khi đang phản biện (`REVIEWING`)?** | **Không thấy nhận xét dở dang** (được bảo lưu đến khi vòng chấm hoàn tất). | **Không thấy nhận xét dở dang**. |
| **Tác giả thấy gì sau khi có kết quả (`NEEDS_REVISION`, `PUBLISHED`, `REJECTED`)?** | **Open Review**: Thấy đầy đủ họ tên, chức danh của 3 Giảng viên đã chấm bài mình (Trưởng ban & 2 Thành viên phản biện). | **Masked (Ẩn danh hội đồng)**: Tác giả chỉ thấy `Lead Reviewer`, `Peer Reviewer 1`, `Peer Reviewer 2` kèm nhận xét, không lộ tên đồng nghiệp nào đã chấm. |
| **Quy định Hội đồng 3 Giảng viên** | Bắt buộc đúng 3 Giảng viên khác chấm (1 Primary + 2 Secondary). Không bị COI. | Bắt buộc đúng 3 Giảng viên khác chấm (1 Primary + 2 Secondary). Không bị COI. |
| **Điều kiện ra quyết định của Trưởng ban** | Trưởng ban chỉ được nộp kết luận cuối cùng khi cả 2 Secondary đã nộp nhận xét. | Trưởng ban chỉ được nộp kết luận cuối cùng khi cả 2 Secondary đã nộp nhận xét. |
| **Nộp bản sửa đổi (Revision Round)** | Tự động chuyển tiếp 3 Giảng viên cũ sang vòng mới ($N \to N+1$). | Tự động chuyển tiếp 3 Giảng viên cũ sang vòng mới ($N \to N+1$). |

---

## 3. Đánh giá các phương án kỹ thuật

### Phương án A (Khuyên dùng): Phân nhánh Masking dựa trên `uploader.role` tại BE và hiển thị động tại FE
- **Backend**:
  - Trong `publication.service.ts`:
    - `getPublicationById`: Chỉ mask tác giả thành `Anonymous Author` nếu `assignedReviewer && !isOwnerOrAuthor && userRole !== UserRole.ADMIN && publication.uploader.role === UserRole.LECTURER`. Nếu `publication.uploader.role === UserRole.STUDENT`, giữ nguyên thông tin tác giả sinh viên.
    - `listPublications`: Chỉ mask `uploader` và `authors` nếu bài là của Giảng viên (`pub.uploader.role === UserRole.LECTURER`). Nếu là bài Sinh viên, trả về đầy đủ `name`, `studentId`, `email`.
  - Trong `review.service.ts`:
    - `getReviewsForManuscript`: Khi tác giả xem review sau khi hoàn tất vòng:
      - Nếu `publication.uploader.role === UserRole.STUDENT`: Trả về nguyên bản thông tin 3 Giảng viên chấm (`name`, `email`, `role`).
      - Nếu `publication.uploader.role === UserRole.LECTURER`: Mask danh tính thành `Lead Reviewer` và `Peer Reviewer N`.
- **Frontend**:
  - `LecturerReviewsView.tsx`: Cột Author kiểm tra nếu `item.uploader?.role === 'LECTURER'` thì hiển thị `Anonymous Author` + badge `Double-Blind`. Nếu là `STUDENT` thì hiển thị Tên sinh viên + badge `Student` (kèm MSSV).
  - `LecturerReviewDetailView.tsx`: Hiển thị thông tin sinh viên hoặc `Anonymous Author` dựa trên dữ liệu BE trả về.
  - `PreprintDetailView.tsx` / Author view: Hiển thị tên giảng viên hoặc `Lead Reviewer / Peer Reviewer` theo dữ liệu BE đã chuẩn hóa.

**Ưu điểm**:
- Chuẩn hóa đúng nghiệp vụ đào tạo đại học và nghiên cứu khoa học.
- Đảm bảo an toàn từ gốc (Backend data projection), frontend chỉ việc render đúng theo data sạch.
- Không phát sinh thay đổi database schema (tận dụng trường `role` sẵn có của `User`).

---

## 4. Kế hoạch xác thực (Verification Plan)
1. **Kiểm thử tự động Backend**:
   - Test case 1: Giảng viên A truy cập review queue, thấy bài của Sinh viên B hiển thị đúng tên và MSSV của Sinh viên B (không mask).
   - Test case 2: Giảng viên A truy cập review queue, thấy bài của Giảng viên C hiển thị `Anonymous Author` (bị mask).
   - Test case 3: Sinh viên B xem kết quả nhận xét sau khi hoàn tất vòng phản biện, thấy tên của Giảng viên A.
   - Test case 4: Giảng viên C xem kết quả nhận xét bài của mình, chỉ thấy `Lead Reviewer` / `Peer Reviewer 1` (bị mask).
2. **Kiểm thử giao diện Frontend**:
   - Bảng `/lecturer/reviews`: Hàng bài của Sinh viên hiển thị tên tác giả sinh viên và badge `Student`. Hàng bài của Giảng viên hiển thị `Anonymous Author` và badge `Double-Blind`.
   - Trang chi tiết `/lecturer/reviews/:id`: Hiển thị đúng thông tin tương ứng.
