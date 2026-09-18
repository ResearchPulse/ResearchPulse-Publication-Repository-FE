---
title: "Brainstorm: Đồng Bộ Responsive Giảng Viên (Lecturer) theo Chuẩn Sinh Viên (Student)"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: LecturerShell.tsx, lecturer-layout.css"
---

# Báo Cáo Brainstorming: Đồng Bộ Hệ Thống Responsive Cho Giảng Viên (Lecturer)

## 1. Khảo Sát Hiện Trạng & Nguyên Nhân Chưa Responsive

Khi khảo sát cơ chế Responsive giữa hai phân hệ Student và Lecturer:

### Cơ chế Responsive hiện đại của Student:
1. **Desktop (> 768px)**: Sidebar cố định rộng `260px` sticky dọc bên trái, nội dung chính co giãn linh hoạt.
2. **Mobile / Tablet (≤ 768px)**:
   - Sidebar tự động chuyển thành **Off-canvas Drawer** trượt từ bên trái (`transform: translateX(-100%)`, có bóng đổ mờ).
   - Nút **Hamburger menu** (`student-topbar__menu-btn`) tự động xuất hiện trên Topbar để mở sidebar.
   - Nền tối mờ **Backdrop overlay** (`student-sidebar-backdrop`) phủ lên màn hình khi mở menu, bấm vào nền sẽ đóng sidebar.
   - Nút đóng nhanh **Close button (`×`)** xuất hiện ở góc trên brand header.
   - Bảng bài báo và thanh tìm kiếm tự động cuộn ngang (`overflow-x: auto`), padding nội dung thu nhỏ từ `42px` xuống `20px 16px`.

### Lỗi trên giao diện Lecturer hiện tại:
1. **Thiếu state quản lý Drawer**: `LecturerShell.tsx` chưa có state `sidebarOpen`, chưa có nút hamburger trên topbar, chưa có nút `×` và lớp phủ `backdrop`.
2. **Xung đột Media Query cũ trong `lecturer-layout.css`**:
   - Ở breakpoint `1100px`: Rule cũ ép cột sidebar thành `76px` và ẩn nhãn chữ, nhưng sidebar mới có độ rộng `260px` nên bị tràn khung, vỡ layout.
   - Ở breakpoint `560px`: Rule cũ cố biến sidebar thành thanh ngang `flex-direction: row`, làm hỏng hoàn toàn cấu trúc profile card và menu dọc.

---

## 2. Kế Hoạch Đồng Bộ Triệt Để

### 🌟 Phương Án Đề Xuất:

#### 1. Cập nhật [`LecturerShell.tsx`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/components/LecturerShell.tsx):
- Thêm state `const [sidebarOpen, setSidebarOpen] = useState(false)`.
- Thêm lớp phủ `student-sidebar-backdrop` khi `sidebarOpen === true`.
- Sidebar nhận class `student-sidebar--open` khi mở.
- Thêm nút đóng `×` (`student-sidebar__close-btn`) trong brand header.
- Topbar bổ sung nút hamburger (`student-topbar__menu-btn`) với icon 3 vạch ngang chuẩn mực.

#### 2. Dọn dẹp & Chuẩn hóa [`lecturer-layout.css`](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/styles/lecturer-layout.css):
- Xóa các rule thu nhỏ `76px` và thanh ngang `560px` cũ.
- Áp dụng breakpoint `≤ 768px`:
  ```css
  @media (max-width: 768px) {
    .lecturer-frame {
      display: flex;
      flex-direction: column;
    }
    .lecturer-content {
      padding: 20px 16px;
    }
  }
  ```
- Tận dụng 100% các class responsive có sẵn trong `paper-student.css` (`student-sidebar--open`, `student-sidebar-backdrop`, `student-topbar__menu-btn`, `dashboard-table-wrapper`).

### Ưu Điểm:
- Đồng bộ hoàn hảo 1:1 trải nghiệm mobile/tablet giữa Student và Lecturer.
- Mở/đóng menu trượt cực kỳ mượt mà, không bị vỡ layout trên iPad hay điện thoại.
