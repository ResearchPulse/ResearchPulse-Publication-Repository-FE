---
title: Hyperlabdata UI Sprint 02 Brainstorm
status: approved
version: 0.1.0
date: 2026-09-15
scope: User FE first, mock data, no backend changes
---

# Hyperlabdata UI Sprint 02 Brainstorm

## Summary

Hoàn thiện frontend trước khi phụ thuộc Preprint BE thật. User FE là vertical slice đầu tiên; dữ liệu dùng mock service nhưng interface giữ tương thích với Preprint API để chuyển sang API thật mà không viết lại UI.

## Findings

- Admin FE và User FE đã là hai ứng dụng Next.js TypeScript độc lập.
- Shared package `@hyperlabdata/ui` đã có brand tokens và primitives cơ bản: brand mark, button, panel, field, badge, empty state, progress bar.
- User FE hiện có `/my-preprints`, `/my-preprints/new`, `/my-preprints/[id]`; list/detail đã có fallback preview, form đã có flow API thật nhưng UI state còn tối giản.
- Admin FE hiện có dashboard, submissions, reviews và submission detail; phần lớn dữ liệu và interaction vẫn là preview.
- Spec đã duyệt yêu cầu thêm `/edit`, `/versions`, assignment/review interactions, trạng thái lỗi/loading/empty và responsive behavior.
- API contract đang có sai khác giữa spec (`/my`, `PUT`, `/versions`) và client/backend hiện tại (`/mine`, `PATCH`, `upload-init/complete`); UI Sprint 02 chưa nên khóa thêm endpoint mới.

## Problem statement

Người dùng cần nhìn thấy và thao tác được toàn bộ vòng đời submission ở mức giao diện: tạo draft, upload, submit, nhận revision feedback, tạo version mới; giảng viên/admin cần nhìn thấy queue, assignment và review decision. UI phải thể hiện đúng quyền và trạng thái mà không phụ thuộc backend đang chạy.

## Exact requirements

### Expected output

- User FE hoàn thiện các route `/my-preprints`, `/my-preprints/new`, `/my-preprints/[id]`, `/my-preprints/[id]/edit`, `/my-preprints/[id]/versions`.
- Shared UI bổ sung các component cần cho flow: modal, toast, table, pagination, tabs, skeleton, error state, file dropzone, confirm dialog.
- Mock preprint service có interface tương thích với API client hiện tại.
- Admin FE có interaction UI cho filter/search/pagination, assignment modal và review decision form.

### Acceptance criteria

- User có thể tạo draft bằng mock service, lưu lỗi validation trên từng field và không mất dữ liệu form.
- User có thể chọn file, thấy file name/size/progress/success/error/retry.
- UI chỉ cho phép submit khi có title, author và manuscript file.
- `NEEDS_REVISION` hiển thị feedback, cho phép mở edit và tạo version mới.
- Detail hiển thị metadata, authors, version timeline, file status và feedback.
- Admin table có loading, empty, error, search, status filter và pagination states.
- Review form bắt buộc comment cho `REQUEST_REVISION` và `REJECT`; approve có confirmation.
- UI responsive ở desktop, tablet và mobile; keyboard focus và accessible labels được giữ.
- `npm run build` vẫn pass cho User FE, Admin FE và shared package consumer.

### Scope boundary

In scope: UI components, mock data/service, client state, route screens, validation, responsive/accessibility polish.

Out of scope: DB/schema, Preprint BE API, real SSO exchange, real S3/R2 upload, Main DB mapping, DOI/arXiv, email, plagiarism detection, automated E2E tests.

### Non-negotiable constraints

- Next.js App Router + TypeScript.
- Hai repo vẫn độc lập; không gộp Admin FE và User FE.
- Shared package là `@hyperlabdata/ui`.
- Brand Hyperlabdata: primary `#0071BC`, font Roboto, cùng design tokens nhưng layout riêng.
- Không lưu token trong localStorage.
- Mock layer phải thay được bằng API thật qua cùng method signature.

### Touchpoints

- `ScienceJournalTrendingVN_User_FE/src/app/my-preprints/**`.
- `ScienceJournalTrendingVN_User_FE/src/lib/preprint-api.ts` và types.
- `ScienceJournalTrendingVN_Admin_FE/src/app/dashboard/**`, `submissions/**`, `reviews/**`.
- `ScienceJournalTrendingVN_Admin_FE/src/lib/preprint-api.ts` và types.
- `ScienceJournalTrendingVN_Shared_UI/src/index.tsx`, `src/styles.css`.
- `docs/preprint-frontend-spec.md` là contract sản phẩm hiện hành.

## Options considered

### Option A — User-first vertical slice (recommended)

Hoàn thiện User FE end-to-end trước, sau đó dùng cùng patterns cho Admin FE.

Pros: feedback user sớm, scope rõ, dễ demo, giảm rủi ro form/upload; phù hợp với preprint DB là nguồn dữ liệu gốc.

Cons: Admin FE tạm thời chưa hoàn chỉnh; mock service cần giữ kỷ luật contract.

### Option B — Admin-first

Hoàn thiện queue, assignment và review panel trước.

Pros: lecturer có thể kiểm duyệt sớm.

Cons: thiếu nguồn dữ liệu submission hoàn chỉnh, dễ xây UI dựa trên giả định sai về student flow.

### Option C — Shared design-system-first

Bổ sung toàn bộ component dùng chung trước khi làm workflow.

Pros: consistency tốt.

Cons: lâu mới có màn hình nghiệp vụ hoàn chỉnh; dễ overbuild component chưa dùng.

## Recommended design

Chọn Option A và chia thành bốn nhóm nhỏ:

1. Shared primitives: modal, toast, table/pagination, skeleton/error, tabs, dropzone, confirm dialog.
2. User workflow: list states, create/edit form, upload state machine, detail/version history, revision flow.
3. Admin workflow: submission table states, detail metadata/file panel, assignment modal, review decision form.
4. Consistency pass: responsive, accessibility, state labels, mock/API adapter boundary.

UI state model:

```text
idle → loading → success
                ↘ empty
                ↘ error → retry
```

Submission state model:

```text
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED
              │             └──────→ REJECTED
              └────────────────────→ NEEDS_REVISION → new version
```

Mock service methods:

```text
listMine()
getPreprint(id)
createDraft(payload)
updateDraft(id, payload)
initUpload(id, metadata)
uploadFile(upload, file)
completeUpload(id, upload)
submitPreprint(id)
```

## Implementation considerations

- Dùng local mock adapter hoặc `NEXT_PUBLIC_DEMO_MODE`, không copy mock logic vào từng page.
- Form state nên nằm ở client component; layout, navigation và content shell có thể tái sử dụng.
- Không dùng màu status tùy ý; map status vào shared `StatusBadge`.
- Upload UI chỉ mô phỏng signed upload; không giả vờ rằng file đã được lưu thật.
- API contract cần một follow-up decision sau UI Sprint 02 để thống nhất `/mine` hay `/my`, `PATCH` hay `PUT`, và version endpoint.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Mock khác API thật | Giữ adapter method signature và response shape giống API envelope |
| Form nhiều trạng thái | Tách state machine nhỏ cho save/upload/submit |
| UI quyền sai | Role-aware navigation chỉ là presentation; backend vẫn là authority |
| Component overbuilding | Chỉ tạo component đã có consumer trong sprint |
| Contract lệch | Không hard-code endpoint mới ngoài central API client |

## Success metrics

- User có thể hoàn thành một submission demo từ draft đến revision bằng mock data.
- Mỗi trạng thái chính có loading/empty/error/success representation.
- Không có mất dữ liệu form sau lỗi upload/API giả lập.
- Admin có thể demo queue → assign → review decision bằng mock data.
- Hai app build pass, không phát sinh dependency chéo ngoài shared UI.

## Next steps

1. Chuyển report này sang `hs:plan` mặc định.
2. Lập phase plan cho shared UI và User FE trước.
3. Sau khi User FE hoàn chỉnh, lập phase Admin FE.
4. Cuối sprint chốt lại API contract rồi mới nối Preprint BE thật.

## PDF preview decision

Admin cần xem được PDF của version mà User đã upload. Không dùng public file URL.

- Local development: Preprint BE stream file sau khi kiểm tra quyền.
- Production: Preprint BE trả signed URL ngắn hạn từ storage adapter.
- Admin FE dùng một `PdfPreviewPanel` trong submission detail.
- Administrator xem toàn bộ; lecturer/researcher chỉ xem bài được assign; student chỉ xem bài của mình.
- Ghi `FILE_VIEWED` vào `preprint_events`.
- API đề xuất: `GET /api/v1/admin/preprints/:id/versions/:versionId/file-url` hoặc endpoint stream tương đương.
- Không cần thêm field DB cho MVP; `file_key` và metadata trong `preprint_versions` đã đủ.
- MVP ưu tiên PDF inline; DOC/DOCX chỉ download hoặc xử lý ở phase sau.

## Unresolved questions

- API contract cuối cùng chọn `/mine` hay `/my`?
- Supervisor UI sẽ dùng Main User UUID, search/select từ directory, hay chỉ là optional metadata?
- User có được withdraw ở trạng thái nào?
- Admin assignment cho phép một hay nhiều reviewer trên cùng version?
