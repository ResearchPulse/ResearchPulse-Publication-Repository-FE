---
phase: 3
title: "User FE Submission Workflow"
status: pending
priority: P1
effort: "2-3d"
dependencies: [1, 2]
---

# Phase 3: User FE Submission Workflow

## Overview

Implement the student workspace for creating drafts, uploading versions, submitting papers, and responding to reviewer feedback.

## Requirements

- Routes: `/`, `/my-preprints`, `/my-preprints/new`, `/my-preprints/[id]`, `/my-preprints/[id]/edit`, `/my-preprints/[id]/versions`.
- Student sees only own preprints.
- Draft can exist without a file.
- Submit requires a valid PDF upload.
- Upload uses a presigned object-storage URL issued by Preprint BE.
- File validation covers PDF MIME, maximum size, checksum, upload failure, and retry behavior.
- Private files use signed or authorized download URLs. Browser never receives storage credentials.
- Revision creates a new version and preserves prior review history.
- Status actions follow backend state machine.

## Architecture

Use server-rendered reads where compatible with SSO. Use Client Components for form state, upload progress, validation, filters, and submit actions. Keep draft form state local until save; invalidate list/detail data after mutations.

## Related Code Files

- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\my-preprints\page.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\my-preprints\new\page.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\my-preprints\[id]\page.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\components\preprints\PreprintForm.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\components\preprints\PreprintStatusBadge.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\components\preprints\VersionTimeline.tsx`
- Modify: User layout, API client, auth guard, shared UI imports.

## Implementation Steps

1. Build authenticated workspace shell.
2. Build preprint list with status, date, version, and actions.
3. Build create/edit form with authors, keywords, supervisor, abstract, and file input.
4. Add draft save and validation feedback.
5. Request presigned upload URL, upload directly to object storage, then confirm upload with Preprint BE.
6. Add submit confirmation and state transition.
7. Add detail page with version timeline and review feedback.
8. Add revision flow and withdraw action where permitted.

## Success Criteria

- [ ] Student can create, save, reopen, and edit draft.
- [ ] Student can upload PDF and see progress/failure state.
- [ ] Submit is blocked without required fields and PDF.
- [ ] `NEEDS_REVISION` exposes reviewer feedback and edit action.
- [ ] Previous versions remain visible.
- [ ] Student cannot access another student's preprint.

## Risk Assessment

Large or failed uploads can lose form context. Preserve metadata draft locally until API save succeeds. Do not expose storage credentials in browser.
