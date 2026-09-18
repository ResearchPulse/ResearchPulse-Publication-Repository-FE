---
title: "Sync Admin Views UI & Streamline Detail View"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: AdminSubmissionDetailView.tsx, AdminSubmissionsView.tsx, AdminReviewsView.tsx"
---

# Sync Admin Views UI & Streamline Detail View

## Problem Statement & User Requests

1. **Submission Detail View (`AdminSubmissionDetailView.tsx`)**:
   - Redundancy: The `Version History` block is unnecessary because the active version indicator (`v1.0`) is already highlighted in the top Metadata Strip.
   - User Request: Remove `Version History`.
2. **Submissions Queue View (`AdminSubmissionsView.tsx` - Hình 2)**:
   - Visual Inconsistency: Uses the old `table-shell` and `data-table` with square inputs and a crude `Open` button column.
   - User Request: Synchronize UI style with Student & Admin Dashboard (use `.dashboard-table--repository`, rounded search box, status tab pills, empty card) and remove the `Open` column (make the manuscript title clickable).
3. **Reviews Oversight View (`AdminReviewsView.tsx` - Hình 3)**:
   - Visual Inconsistency & Error Handling: Shows a harsh red error banner when backend API request fails, and uses legacy table styling.
   - User Request: Synchronize UI style with Student & Admin Dashboard (academic table layout, graceful notice banner with retry, polished review status badges).

## Confirmed Requirements

### 1. `AdminSubmissionDetailView.tsx`
- Remove the `Version History` heading and `<VersionList>` component call.
- Retain all other blocks: `Contributing Authors`, `Audit Timeline`, `Abstract`, `Download PDF`, and sticky sidebar actions.

### 2. `AdminSubmissionsView.tsx` (Hình 2)
- **Remove `Open` column**: Title in the `Manuscript` column becomes the direct link to `ROUTES.ADMIN.SUBMISSION_DETAIL(item.id)`.
- **Toolbar**: Upgrade from square `<TextInput>` & `<SelectInput>` to:
  - Tab Pills (`ALL`, `REVIEWING`, `DRAFTING`, `PUBLISHED`, `REJECTED`).
  - Search box with magnifying glass SVG icon (`student-search-box`).
- **Academic Table**: Use `.dashboard-table-card.dashboard-table-wrapper` and `<table className="dashboard-table dashboard-table--repository">`.
  - Columns: `Manuscript` (Title link + Uploader email/ID), `Student Author`, `Version`, `Updated`, `Status`.
- **States**: Use `.student-loading-box` and `.student-empty-card` for empty/loading states.

### 3. `AdminReviewsView.tsx` (Hình 3)
- **API Resilience**: Catch initial `listAllReviews()` error and fallback to querying reviews per submission, or show a graceful notice banner with a `Retry` action instead of an alarming red error block.
- **Academic Table**: Upgrade from `.data-table` to `.dashboard-table dashboard-table--repository` matching the student/admin design system.

## Success Criteria

- [ ] `Version History` section removed cleanly from `AdminSubmissionDetailView.tsx`.
- [ ] `AdminSubmissionsView.tsx` displays academic table with no `Open` column, clickable title, and tab filter pills.
- [ ] `AdminReviewsView.tsx` renders in polished academic style with resilient error/fallback handling and retry button.
- [ ] TypeScript compilation succeeds with 0 errors (`npx tsc --noEmit`).
