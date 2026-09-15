---
phase: 4
title: "Admin FE Review Workflow"
status: pending
priority: P1
effort: "2-3d"
dependencies: [1, 2]
---

# Phase 4: Admin FE Review Workflow

## Overview

Implement administrator and lecturer workspace for monitoring, assignment, review, revision requests, rejection, approval, and publishing.

## Requirements

- Routes: `/`, `/dashboard`, `/submissions`, `/submissions/[id]`, `/assignments`, `/reviews`.
- Lecturer sees assigned or policy-allowed submissions.
- Administrator sees all submissions and can assign reviewers.
- Review comment is required for request revision and reject.
- Publish is separate from approve.
- UI reflects assignment and review history.

## Architecture

Use table-first admin layout with server-side pagination and filters. Detail page combines metadata, PDF viewer/download, version timeline, assignment panel, review form, and audit events. Mutations require confirmation and update the detail/list cache.

## Related Code Files

- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\dashboard\page.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\submissions\page.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\submissions\[id]\page.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\components\submissions\SubmissionTable.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\components\submissions\ReviewPanel.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\components\submissions\AssignmentPanel.tsx`
- Modify: Admin layout, navigation, API client, auth guard, shared UI imports.

## Implementation Steps

1. Build role-aware admin shell and navigation.
2. Build dashboard counts from backend summary endpoint.
3. Build submission table with search, status, reviewer, date filters, sorting, and pagination.
4. Build detail view with PDF access and version history.
5. Add assignment flow for administrator.
6. Add review form with decision-specific validation.
7. Add approve, reject, request revision, and publish actions.
8. Add audit timeline and success/error notifications.

## Success Criteria

- [ ] Lecturer sees only permitted submissions.
- [ ] Administrator can assign a lecturer.
- [ ] Reviewer can submit all three decisions.
- [ ] Comment validation matches backend rules.
- [ ] Publish is disabled unless status is `APPROVED`.
- [ ] Table filters and pagination preserve query state.
- [ ] Unauthorized role cannot load admin routes.

## Risk Assessment

Stale list data can cause duplicate review actions. Disable actions during mutation, re-fetch detail after success, and let backend reject invalid state transitions.
