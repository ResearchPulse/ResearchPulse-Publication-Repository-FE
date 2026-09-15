---
phase: 2
title: "User Submission Workspace"
status: pending
priority: P1
effort: "1-2d"
dependencies: [1]
---

# Phase 2: User Submission Workspace

## Overview

Build the user-facing preprint journey first with the Phase 1 mock adapter.

## Requirements

- Routes: `/`, `/my-preprints`, `/my-preprints/new`, `/my-preprints/[id]`; preserve edit/version extension points.
- List: search/filter affordance, status, updated date, version, and next action.
- Form: title, abstract, supervisor, authors, keywords, PDF, validation summary, save draft, submit.
- Upload: PDF-only validation, size/error messaging, progress, retry, replace-file, and complete state.
- Detail: metadata, status, version timeline, file card, reviewer feedback, and revision/edit CTA.
- Design empty, loading, API failure, and unsaved-change states.

## Architecture

Client components own form/upload interaction and call the mock adapter. The file descriptor stays compatible with the future authorized stream/signed URL contract.

## Related Code Files

- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\my-preprints\page.tsx`
- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\my-preprints\new\page.tsx`
- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\my-preprints\[id]\page.tsx`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\components\preprints\`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\lib\preprint-mock.ts`

## Implementation Steps

1. Establish user shell/navigation.
2. Render status-aware list fixtures and next actions.
3. Implement form validation and save/submit states.
4. Implement mocked upload progress/failure/retry.
5. Add detail/version/feedback states and responsive layouts.

## Success Criteria

- [ ] Student flow is understandable without backend setup.
- [ ] Submit is blocked without required metadata and valid PDF.
- [ ] Upload failure does not lose form metadata.
- [ ] Revision feedback and prior versions are easy to find.

## Risk Assessment

Keep mock-only behavior explicit so the interface does not promise unavailable backend behavior.
