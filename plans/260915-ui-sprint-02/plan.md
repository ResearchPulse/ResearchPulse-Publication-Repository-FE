---
title: "Hyperlabdata UI Sprint 02"
description: "Implement the approved user-first preprint interfaces and admin PDF preview/review surface with mock data."
status: pending
priority: P1
effort: "3-5d"
parentPlan: ../260914-1556-preprint-frontends/plan.md
blockedBy: []
blocks: []
created: 2026-09-15
---

# Hyperlabdata UI Sprint 02

## Overview

Focused follow-up to the parent frontend plan. Build User_FE first, then the Admin_FE review surface with PDF preview. This is UI-only: no Preprint BE, Preprint DB, Main DB, or SSO changes.

## Requirements

- Use Hyperlabdata tokens: `#0071BC`, Roboto, shared semantic colors, spacing, radius, and focus states.
- Keep User_FE and Admin_FE as separate repos with separate layouts/navigation.
- Reuse `@hyperlabdata/ui` primitives; keep workflow-specific components local.
- Use mock adapters first, with response shapes compatible with Preprint BE.
- Cover lifecycle states: `DRAFT`, `SUBMITTED`, `IN_REVIEW`, `NEEDS_REVISION`, `APPROVED`, `REJECTED`, `PUBLISHED`.
- User_FE: list, create/edit, PDF validation, upload progress/retry, detail, versions, reviewer feedback, and empty/loading/error states.
- Admin_FE: queue, detail, version selection, assignment/review controls, history, PDF preview, and download fallback.
- PDF files stay private. UI consumes an authorized stream or short-lived signed URL; it never receives storage credentials or builds public storage URLs.
- No DB field is required; existing `preprint_versions.file_key` and file metadata are sufficient.

## Architecture

```text
User_FE mock adapter ─┐
                      ├─ shared design tokens/components
Admin_FE mock adapter ┘

Later: both FE ─ authenticated API ─ Preprint BE ─ Preprint DB
                                  └─ authorized PDF stream/signed URL ─ private storage
```

`PdfPreviewPanel` consumes `versionId`, `fileName`, `mimeType`, `fileSize`, `previewUrl`, optional `downloadUrl`, and `expiresAt`. Production integration will call an endpoint such as `GET /api/v1/admin/preprints/:id/versions/:versionId/file-url` or an authorized stream equivalent. Backend owns authorization and `FILE_VIEWED` audit logging.

## Related Code Files

- Parent plan: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\plans\260914-1556-preprint-frontends\plan.md`
- Approved brainstorm: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\plans\reports\260915-ui-sprint-02-brainstorm.md`
- Shared UI: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Shared_UI\src\index.tsx`, `src\styles.css`
- User FE: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\my-preprints`, `src\lib\preprint-api.ts`, `src\lib\types.ts`
- Admin FE: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\submissions`, `src\lib`
- BE contract reference: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_BE\src\modules\preprints`, `src\routes\upload.route.js`

## Phases

| Phase | Name | Status | Dependencies |
|---|---|---|---|
| 1 | [Shared UI and Mock Contract](./phase-01-shared-ui-and-mock-contract.md) | Pending | None |
| 2 | [User Submission Workspace](./phase-02-user-submission-workspace.md) | Pending | Phase 1 |
| 3 | [Admin Review and PDF Preview](./phase-03-admin-review-and-pdf-preview.md) | Pending | Phase 1, 2 |
| 4 | [Cross-frontend Polish and Handoff](./phase-04-cross-frontend-polish-and-handoff.md) | Pending | Phase 2, 3 |

## Success Criteria

- [ ] Student can understand list → draft → PDF upload → submit → revision states using mock data.
- [ ] Submit is visibly blocked until required metadata and a valid PDF are present.
- [ ] Admin can open a submission, switch versions, preview/download the selected PDF, and recover from preview failure.
- [ ] Review actions are visibly gated by role/status and require comments where needed.
- [ ] Both frontends share tokens/primitives but retain distinct layouts.
- [ ] No backend, database, SSO, or storage source changes occur in this sprint.

## Risk Assessment

- Private PDF leakage: centralize authorized URL handling in the adapter.
- Mock/API drift: keep fixture types aligned with the contract.
- Shared-package coupling: add only stable primitives to `@hyperlabdata/ui`.
- Status ambiguity: use one typed status/action map per shared contract.
- PDF failure: preview must not block metadata/review; always provide retry/download fallback.

## Out of Scope

Backend endpoint implementation, migrations, Main DB mapping, DOI, plagiarism detection, real SSO/API integration, and DOC/DOCX inline rendering.
