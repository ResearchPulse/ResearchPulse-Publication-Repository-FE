---
title: "Remove My Manuscripts Header Banner"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintListView.tsx"
---

# Remove My Manuscripts Header Banner

## Problem Statement

On the student preprints listing page (`/student/my-preprints` / [PreprintListView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintListView.tsx)), the top Header Banner (`.dashboard-page-header`: "MANUSCRIPT REPOSITORY / My Manuscripts / Start a Submission") occupies excess vertical space and duplicates the persistent `+ New Submission` action already available on the [StudentTopbar.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/components/StudentTopbar.tsx).

## Confirmed Requirements

1. **Delete Header Banner**:
   - Completely remove the `.dashboard-page-header` JSX block from `PreprintListView.tsx`.
2. **Layout Adjustment**:
   - Allow the metrics strip (`.student-metrics-grid`) and notice banner (`.user-notice`) to sit immediately at the top of the content area.
   - Adjust notice banner top margin to 0 for a flush layout.
3. **Preserve Navigation & Actions**:
   - Rely on `StudentTopbar` for breadcrumb orientation (`Scholar Workspace / My Manuscripts`) and submission creation (`+ New Submission`).

## Evaluated Approaches

### Approach 1: Complete Removal (Approved & Recommended)
- **Concept**: Remove the `.dashboard-page-header` block completely from `PreprintListView.tsx`.
- **Pros**:
  - High information density: metrics and the manuscript table become immediately visible above the fold.
  - Aligns with the previous removal of `.dashboard-hero` from `StudentDashboardView.tsx`.
  - Zero duplicate buttons.
- **Cons**: None.

## Next Steps

1. Remove `.dashboard-page-header` block in `PreprintListView.tsx`.
2. Execute `npm run build` to verify type and bundle integrity.
