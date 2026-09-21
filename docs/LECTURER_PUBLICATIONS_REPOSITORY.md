# Tài Liệu Đặc Tả Kỹ Thuật: Tính Năng Kho Bài Báo Khoa Học Cho Giảng Viên (Lecturer Publications Repository)

## 1. Giới thiệu tổng quan
Tính năng **Kho bài báo khoa học (Publications Repository)** mở rộng năng lực của Cổng thông tin Giảng viên (`Lecturer Portal`), giúp giảng viên:
- Tra cứu toàn bộ các công trình nghiên cứu khoa học, bài báo, bản thảo đã xuất bản hoặc đang trong phạm vi thẩm định/hướng dẫn.
- Lọc theo **Phạm vi hiển thị (Visibility Scopes)**:
  - 🌐 **Công khai (Public)**: Mọi độc giả (kể cả ngoài trường) đều xem được.
  - 🎓 **Chỉ Giảng viên (Faculty Only)**: Lưu hành nội bộ cán bộ - giảng viên.
  - 🏫 **Nội bộ trường (Campus-wide)**: Lưu hành trong nội bộ Sinh viên & Giảng viên của trường.
  - 🔒 **Được giao thẩm định (Assigned Review)**: Bài báo đang thẩm định mà giảng viên được phân công bình duyệt.
- Lọc theo **Chuyên ngành (Discipline)** và **Từ khóa tìm kiếm (Search query: tựa đề, tác giả, DOI, từ khóa)**.
- Đọc bản toàn văn trực tiếp trên Web (PDF Viewer tích hợp).
- Xuất trích dẫn khoa học chuẩn quốc tế (APA 7th, IEEE, BibTeX) với tính năng 1-click Copy.
- Tải file PDF trực tiếp về máy.

---

## 2. Các thay đổi phía Backend (BE)

### 2.1. Cập nhật Query Schema & Route
- **File**: `src/modules/publication/publication.schema.ts`
  - Thêm tham số `scope` vào `listPublicationsSchema.querystring`:
    ```ts
    scope: {
      type: 'string',
      enum: ['ALL', 'PUBLIC', 'FACULTY_ONLY', 'CAMPUS', 'ASSIGNED', 'MINE', 'all', 'public', 'faculty_only', 'campus', 'assigned', 'mine'],
      description: 'Visibility scope filter for browsing publications repository.'
    },
    discipline: { type: 'string', description: 'Filter publications by discipline or research area.' }
    ```
- **File**: `src/modules/publication/publication.route.ts`
  - Cập nhật interface `ListPublicationsQuery` hỗ trợ `scope?: string` và `discipline?: string`.
- **File**: `src/modules/publication/publication.controller.ts`
  - Cập nhật interface `ListPublicationsQuery` hỗ trợ `scope?: string` và `discipline?: string`.

### 2.2. Logic Phân quyền & Truy vấn Database (Prisma Query)
- **File**: `src/modules/publication/publication.service.ts`
  - Trong nhánh `userRole === UserRole.LECTURER` của phương thức `PublicationService.listPublications`:
    - `scope === 'PUBLIC'`:
      ```ts
      where.AND = [
        {
          status: PublicationStatus.PUBLISHED,
          isPrivate: false,
          audiences: { has: PublicationAudience.GUEST },
        },
      ];
      ```
    - `scope === 'FACULTY_ONLY'`:
      ```ts
      where.AND = [
        {
          status: PublicationStatus.PUBLISHED,
          isPrivate: false,
          audiences: { has: PublicationAudience.LECTURER },
          NOT: { audiences: { has: PublicationAudience.GUEST } },
        },
      ];
      ```
    - `scope === 'CAMPUS'`:
      ```ts
      where.AND = [
        {
          status: PublicationStatus.PUBLISHED,
          isPrivate: false,
          OR: [
            { audiences: { has: PublicationAudience.STUDENT } },
            { audiences: { isEmpty: true } },
          ],
        },
      ];
      ```
    - `scope === 'ASSIGNED'`:
      ```ts
      where.AND = [
        { id: { in: allAssignedIds } },
        { uploaderId: { not: userId } },
      ];
      ```
    - `scope === 'MINE'`:
      ```ts
      where.AND = [
        { uploaderId: userId },
      ];
      ```
    - `scope === 'ALL'` hoặc mặc định: Giữ nguyên logic an toàn (hiển thị bài của tôi + bài đang được assign review + bài PUBLISHED có quyền đọc).
    - Lọc chuyên ngành: `if (query.discipline) where.discipline = { equals: query.discipline, mode: 'insensitive' }`.

---

## 3. Các thay đổi phía Frontend (FE)

### 3.1. Định tuyến (Routing & Navigation)
- **File**: `src/app/router/routePaths.ts`
  - Bổ sung `PUBLICATIONS: '/lecturer/publications'` và `PUBLICATION_DETAIL`.
- **File**: `src/features/lecturer/components/LecturerShell.tsx`
  - Mở rộng kiểu điều hướng:
    ```ts
    export type LecturerNavKey = 'reviews' | 'submissions' | 'profile' | 'publications';
    ```
  - Bổ sung liên kết `Kho bài báo khoa học` với icon thư viện vào thanh menu điều hướng.

### 3.2. API Client & Types
- **File**: `src/features/lecturer/api/lecturerReviewApi.ts`
  - Mở rộng kiểu dữ liệu `LecturerPublication`: bổ sung `discipline`, `isPrivate`, `audiences`.
  - Khai báo kiểu `LecturerPublicationScope` và `ListPublicationsParams`.
  - Xuất đối tượng `lecturerPublicationApi`:
    - `lecturerPublicationApi.list(params)`: Gọi endpoint `/api/preprints` (proxy sang BE) với các tham số `scope`, `discipline`, `search`, `page`, `limit`.
    - `lecturerPublicationApi.get(id)`: Lấy chi tiết một bài báo.

### 3.3. View Component & Giao diện Người dùng
- **File**: `src/features/lecturer/views/LecturerPublicationsView.tsx`
  - **Banner Header**: Thiết kế sang trọng với gradient tối hiện đại (`#1e293b` đến `#0f172a`), nút làm mới dữ liệu tức thì.
  - **Dải thẻ chỉ số tương tác (Interactive Metric Cards)**:
    - Tổng bài tiếp cận được
    - 🌐 Công khai (Public)
    - 🎓 Chỉ Giảng viên (Faculty Only)
    - 🏫 Nội bộ trường (Campus-wide)
    - 🔒 Được giao thẩm định (Assigned)
    - *Bấm vào bất kỳ thẻ nào sẽ lập tức lọc theo phạm vi đó.*
  - **Thanh công cụ lọc (Filter Toolbar)**:
    - Tab Pills lọc phạm vi kèm số lượng đếm realtime.
    - Ô tìm kiếm tức thì theo Tiêu đề, Tác giả, DOI, Từ khóa (kèm nút xóa nhanh).
    - Dropdown chọn Chuyên ngành (tự động tổng hợp từ dữ liệu).
    - Dropdown sắp xếp theo thời gian mới nhất hoặc theo tên A-Z.
  - **Thẻ hiển thị bài báo (Academic Paper Card)**:
    - Huy hiệu phạm vi màu sắc rõ ràng kèm icon.
    - Tiêu đề học thuật nổi bật.
    - Dải danh sách tác giả kèm mã số DOI.
    - Tóm tắt (Abstract) hỗ trợ "Xem thêm / Thu gọn".
    - Nhãn từ khóa (`#tag`).
    - Nút **"Đọc toàn văn"**: Mở Modal xem PDF trực tiếp.
    - Nút **"Trích dẫn"**: Mở Modal xuất trích dẫn (APA 7th, IEEE, BibTeX) kèm 1-click Copy to clipboard.
    - Nút **"Tải PDF"**: Tải tệp bản thảo.
  - **Trình đọc PDF tích hợp (Integrated PDF Reader Modal)**:
    - Đọc toàn văn bài báo trên khung xem toàn màn hình mà không cần rời trang.

### 3.4. Next.js App Page & Đa ngôn ngữ (i18n)
- **File**: `src/app/lecturer/publications/page.tsx`: Page route SSR/Client component.
- **File**: `src/features/lecturer/views/index.ts`: Export `LecturerPublicationsView`.
- **File**: `src/i18n/locales/vi.json` & `src/i18n/locales/en.json`:
  - Thêm đầy đủ nhãn tiếng Việt và tiếng Anh cho tất cả các tính năng mới: `publicationsRepository`, `scopePublic`, `scopeFaculty`, `scopeCampus`, `scopeAssigned`, `citePaper`, `readFullText`, `downloadPdf`, `copyCitation`, `copied`...

---

## 4. Bảo mật & Kiểm soát truy cập (Security Considerations)
1. **Phân quyền tại máy chủ (Authoritative Server-side enforcement)**: Toàn bộ điều kiện lọc phạm vi `scope` đều được backend áp đặt trực tiếp vào câu lệnh truy vấn database; FE không thể vượt quyền xem các bài báo nháp `DRAFTING` của sinh viên hoặc bài riêng tư của người khác.
2. **Double-Blind & COI**: Trong giai đoạn `REVIEWING`, giảng viên chỉ thấy bài khi đã được phân công chính thức trong `PublicationReview` và không được phép tự review bài của chính mình.
3. **Download URL an toàn**: Các liên kết tải file và đọc toàn văn đều đi qua Cloudflare R2 Presigned URL hoặc proxy `/api/pdf-proxy`, không để lộ bucket tĩnh.
