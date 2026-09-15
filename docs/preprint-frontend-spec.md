---
title: Hyperlabdata Preprint Frontend Specification
status: approved
version: 0.1.0
last_updated: 2026-09-14
scope: Admin_FE and User_FE
---

# Hyperlabdata Preprint Frontend Specification

## 1. Overview

Xây dựng hai frontend Next.js độc lập cho hệ thống quản lý preprint của Hyperlabdata:

- `Admin_FE`: dành cho administrator và lecturer.
- `User_FE`: dành cho sinh viên/tác giả nộp bài.

Hai frontend dùng chung:

- SSO từ `E:\SSO_BE` và `E:\SSO_FE`.
- Preprint BE làm backend nghiệp vụ.
- Preprint DB làm source of truth.
- Brand Hyperlabdata.
- Design token và UI component dùng chung.

Hai frontend không ghi dữ liệu trực tiếp vào Main DB hoặc bảng `Article` hiện tại.

## 2. Repository boundaries

```text
E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE
- Admin dashboard
- Review workflow
- Assignment and publishing

E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE
- Student workspace
- Draft and submission workflow
- Revision and feedback

Preprint BE
- Shared REST API
- Authorization and workflow rules

Preprint DB
- Source of truth for all preprint data

SSO_BE / SSO_FE
- Central authentication and session
```

## 3. Roles and permissions

| Role | User_FE | Admin_FE |
|---|---|---|
| `STUDENT` | Tạo, sửa, submit và theo dõi bài của mình | Không truy cập admin workflow |
| `LECTURER` | Không dùng workflow sinh viên | Xem bài được phân công, review và yêu cầu sửa |
| `RESEARCHER` | Không dùng workflow sinh viên | Có thể review nếu được cấp quyền |
| `ADMINISTRATOR` | Không dùng workflow sinh viên | Quản lý toàn bộ, phân công, approve và publish |

Frontend chỉ hiển thị đúng chức năng theo role; Preprint BE vẫn là nơi enforce authorization.

## 4. Authentication and SSO

### 4.1. SSO source

SSO service:

- Backend: `E:\SSO_BE`
- Frontend: `E:\SSO_FE`
- Session endpoint: `GET /api/v1/auth/me`
- Logout endpoint: `POST /api/v1/auth/logout`
- OIDC discovery: `GET /.well-known/openid-configuration`
- OIDC authorization: `GET /api/v1/oidc/authorize`
- OIDC token: `POST /api/v1/oidc/token`

### 4.2. Client registration

Đăng ký hai client riêng trong SSO:

```text
hyperlabdata-preprint-user
hyperlabdata-preprint-admin
```

Mỗi client cần redirect URI và post-logout redirect URI riêng.

### 4.3. Session behavior

- Frontend gọi SSO với `credentials: include`.
- Access token/session không lưu trong localStorage.
- HttpOnly cookie là phương án ưu tiên.
- Khi session hết hạn, frontend chuyển người dùng về SSO login.
- Sau login, frontend gọi `/api/v1/auth/me` để hydrate user và role.
- SSO CORS phải cho phép origin của cả hai frontend.

## 5. Visual and design system

### 5.1. Brand

| Token | Value |
|---|---|
| Primary | `#0071BC` |
| Font | Roboto |
| Background | `#F7FAFC` |
| Surface | `#FFFFFF` |
| Text | `#172B4D` |
| Muted text | `#64748B` |
| Border | `#D9E2EC` |
| Success | `#16803C` |
| Warning | `#B7791F` |
| Danger | `#C53030` |

### 5.2. Shared UI package

Khuyến nghị tạo package dùng chung `@hyperlabdata/ui` cho:

- Design tokens.
- Button, Input, Select, Textarea.
- Modal, Drawer, Toast.
- Table, Pagination, Tabs.
- Badge trạng thái.
- File upload/dropzone.
- Empty state, Loading state, Error state.
- Confirm dialog.
- Avatar và user identity display.

Layout không dùng chung hoàn toàn:

- User FE: content-first, ít điều hướng, tập trung vào form và tiến trình.
- Admin FE: sidebar, dashboard, bảng dữ liệu và review panel.

## 6. User_FE requirements

### 6.1. Routes

```text
/
/my-preprints
/my-preprints/new
/my-preprints/[id]
/my-preprints/[id]/edit
/my-preprints/[id]/versions
```

### 6.2. Main screens

#### My Preprints

Hiển thị:

- Tiêu đề.
- Trạng thái.
- Version hiện tại.
- Ngày cập nhật.
- Feedback mới nhất.
- Action theo trạng thái.

Actions:

- Tạo bài mới.
- Tiếp tục draft.
- Xem chi tiết.
- Sửa bài cần revision.
- Rút bài nếu được phép.

#### Create/Edit Preprint

Field bắt buộc:

- Title.
- Abstract.
- Ít nhất một tác giả.
- File PDF khi submit.

Field tùy chọn:

- Supervisor.
- Keywords.
- Corresponding author.
- Change summary khi tạo version mới.

Actions:

- Save draft.
- Upload file.
- Submit for review.
- Cancel.

#### Preprint Detail

Hiển thị:

- Metadata bài.
- Danh sách tác giả.
- Version history.
- File PDF hiện tại.
- Timeline trạng thái.
- Feedback của reviewer.

### 6.3. User acceptance criteria

- Student đăng nhập thành công qua SSO.
- Student không xem được bài của user khác.
- Student tạo được draft chưa có PDF.
- Không thể submit nếu chưa có PDF.
- Student xem được trạng thái và comment của reviewer.
- Student tạo version mới sau `NEEDS_REVISION`.
- UI hiển thị lỗi API rõ ràng và không mất dữ liệu form.

## 7. Admin_FE requirements

### 7.1. Routes

```text
/
/dashboard
/submissions
/submissions/[id]
/assignments
/reviews
```

### 7.2. Dashboard

Hiển thị số lượng:

- Draft.
- Submitted.
- Under review.
- Needs revision.
- Approved.
- Published.
- Rejected.

Có quick links tới danh sách bài cần xử lý.

### 7.3. Submission list

Features:

- Table responsive.
- Filter status.
- Search title, author.
- Filter supervisor/reviewer.
- Sort theo ngày submit/update.
- Pagination.
- Bulk selection chỉ khi workflow đã hỗ trợ an toàn.

Cột đề xuất:

- Title.
- Student/author.
- Supervisor.
- Status.
- Current version.
- Submitted at.
- Updated at.
- Actions.

### 7.4. Submission detail/review

Hiển thị:

- Metadata bài.
- Authors.
- PDF viewer/download.
- Version history.
- Assignment information.
- Review history.
- Audit timeline.

Actions:

- Assign reviewer.
- Accept assignment.
- Start review.
- Approve.
- Request revision.
- Reject.
- Publish approved preprint.

`PUBLISH` là action riêng, không tự động xảy ra ngay sau `APPROVE`.

### 7.5. Admin acceptance criteria

- Lecturer chỉ xem bài được phân công hoặc bài theo policy của backend.
- Administrator xem được toàn bộ bài.
- Reviewer bắt buộc nhập comment khi request revision hoặc reject.
- Không thể publish bài chưa `APPROVED`.
- Mọi thay đổi workflow hiển thị trong audit timeline.
- Sau khi publish, bài xuất hiện trong public preprint listing.

## 8. Preprint API interface

Base URL cấu hình qua environment variable:

```env
NEXT_PUBLIC_PREPRINT_API_BASE_URL=http://localhost:<port>
NEXT_PUBLIC_SSO_API_BASE_URL=http://localhost:3001
```

### User endpoints

```text
GET    /api/v1/preprints/my
POST   /api/v1/preprints
GET    /api/v1/preprints/:id
PUT    /api/v1/preprints/:id
POST   /api/v1/preprints/:id/submit
POST   /api/v1/preprints/:id/withdraw
GET    /api/v1/preprints/:id/versions
POST   /api/v1/preprints/:id/versions
```

### Admin endpoints

```text
GET    /api/v1/admin/preprints
GET    /api/v1/admin/preprints/:id
POST   /api/v1/admin/preprints/:id/assign
POST   /api/v1/admin/preprints/:id/review
POST   /api/v1/admin/preprints/:id/publish
GET    /api/v1/admin/reviews
GET    /api/v1/admin/dashboard
```

### Public endpoints

```text
GET    /api/v1/public/preprints
GET    /api/v1/public/preprints/:id
```

Response convention:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

Error convention:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Readable error message"
}
```

## 9. State-driven UI rules

```text
DRAFT
- Student can edit and submit

SUBMITTED
- Student read-only
- Admin can assign/review

UNDER_REVIEW
- Student read-only
- Assigned reviewer can review

NEEDS_REVISION
- Student can edit and create new version
- Previous review remains visible

APPROVED
- Reviewer/admin can publish
- Student read-only

PUBLISHED
- Public read-only
- No normal edit

REJECTED / WITHDRAWN
- Read-only unless backend permits a new submission
```

Backend remains authoritative if frontend state and API response differ.

## 10. Next.js technical conventions

- Next.js App Router.
- TypeScript preferred.
- Server Components for read-heavy pages where compatible with auth.
- Client Components only for forms, upload, filters and interactive review actions.
- Central API client per repo.
- Shared request/error handling.
- Route protection at middleware/layout level, with backend authorization as final authority.
- Accessible labels, keyboard navigation and visible focus state.
- Responsive breakpoints for desktop, tablet and mobile.

## 11. Non-goals for MVP

- Không tích hợp DOI tự động.
- Không tạo `Article` trong Main DB.
- Không xây peer-review ẩn danh nhiều vòng.
- Không xây plagiarism detection ngay trong frontend.
- Không lưu file PDF trực tiếp trong database.
- Không gộp Admin FE và User FE thành một app.

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| SSO cookie không được gửi cross-origin | Cấu hình CORS, cookie policy và redirect URI theo môi trường |
| Hai frontend lệch giao diện | Dùng shared tokens/components |
| Frontend tự quyết định quyền | Backend enforce role và resource ownership |
| Upload file lớn/lỗi mạng | Resumable upload hoặc retry ở phase sau; MVP có progress/error state |
| Reviewer thấy nhầm bài | Backend filter assignment; frontend không tự lọc bảo mật |
| API thay đổi làm FE hỏng | Chốt response envelope và error codes trước integration |

## 13. Delivery order

1. Chốt SSO client IDs và redirect URIs.
2. Chốt Preprint API contract.
3. Tạo shared design tokens và UI primitives.
4. Scaffold User FE.
5. Scaffold Admin FE.
6. Implement User submission workflow.
7. Implement Admin review workflow.
8. Tích hợp API và SSO.
9. Responsive/accessibility pass.
10. E2E validation cho luồng submit → review → revision → publish.

## 14. Definition of done

- Hai repo chạy độc lập bằng Next.js.
- User FE và Admin FE đăng nhập qua SSO.
- Shared brand token được áp dụng nhất quán.
- Student hoàn thành được luồng draft → submit → revision.
- Lecturer/admin hoàn thành được luồng assignment → review → publish.
- Public có thể xem preprint đã publish.
- Không có frontend nào ghi trực tiếp vào Main DB.
- Các lỗi unauthorized, forbidden, validation và network được xử lý rõ ràng.
