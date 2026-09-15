---
phase: 3
title: "Admin Review and PDF Preview"
status: pending
priority: P1
effort: "1-1.5d"
dependencies: [1, 2]
---

# Phase 3: Admin Review and PDF Preview

## Overview

Build the admin review surface around the same submission/version fixtures. The central interaction is selecting a version and opening the user's uploaded PDF.

## Requirements

- Routes: `/dashboard`, `/submissions`, `/submissions/[id]`; preserve assignments/reviews extension points.
- Queue: status, title, submitter, date, reviewer, filter, and search affordances.
- Detail: metadata, status, version, dates, permitted actions, assignment, review form, and audit/review history.
- Version selector/timeline identifies the active version and file metadata.
- `PdfPreviewPanel` supports inline PDF, loading, expired-link, unsupported-type, unavailable, and error states.
- Provide download fallback without storage credentials/public bucket paths.
- Require comments for reject/request-revision; keep approve and publish separate.

## Architecture

`PdfPreviewPanel` receives the file descriptor and authorized URL from an adapter. It never signs URLs or decides authorization. Backend later enforces access and audits `FILE_VIEWED`.

## Related Code Files

- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\submissions\page.tsx`
- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\submissions\[id]\page.tsx`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\components\submissions\PdfPreviewPanel.tsx`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\components\submissions\VersionSelector.tsx`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\components\submissions\ReviewPanel.tsx`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\lib\preprint-mock.ts`

## Implementation Steps

1. Build queue and status filters.
2. Build detail metadata, assignment, version, and review sections.
3. Implement `PdfPreviewPanel` and the full file-state matrix.
4. Add version switching, URL refresh/expiry mock, decision validation, and download fallback.

## Success Criteria

- [ ] Admin can select fixture versions and see metadata.
- [ ] Valid PDF renders inline.
- [ ] Expired/missing/unsupported/failed preview states are recoverable.
- [ ] Download remains available when inline preview is not.
- [ ] Raw storage credentials/public storage URLs never appear.

## Risk Assessment

Iframe/CSP/browser behavior may break preview. Keep a visible retry/download path and do not make review metadata depend on PDF rendering success.
