---
title: "Remove Student Dashboard Hero Banner"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: StudentDashboardView.tsx"
---

# Remove Student Dashboard Hero Banner

## Problem Statement

On the student research dashboard (`/student/dashboard` / [StudentDashboardView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentDashboardView.tsx)), the top Hero Banner (`.dashboard-hero` with text "STUDENT RESEARCH SCHOLAR / Your research workspace / Manage your manuscripts... / Publication API connected / Submit New Preprint") takes up substantial vertical screen real estate.

Additionally, the primary action button `+ Submit New Preprint` inside the banner is redundant because [StudentTopbar.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/components/StudentTopbar.tsx) already provides a persistent `+ New Submission` CTA in the top-right corner.

## Confirmed Requirements

1. **Delete Hero Banner**:
   - Completely remove the `.dashboard-hero` element (lines 49-74 in `StudentDashboardView.tsx`).
   - Clean up any unused imports or unneeded inline layout spacing resulting from this removal.
2. **Layout Adjustment**:
   - Allow the Urgent Revision Alert (`.dashboard-alert-banner`) and the Metrics Overview (`.dashboard-metrics`) to sit immediately at the top of the content area.
   - Maintain clean padding/margins between the topbar and metrics/alert.
3. **Preserve Navigation & Actions**:
   - Rely on the topbar's persistent `+ New Submission` button for starting a new manuscript submission.

## Evaluated Approaches

### Approach 1: Complete Removal (Approved & Recommended)
- **Concept**: Remove the `.dashboard-hero` JSX block entirely from `StudentDashboardView.tsx`.
- **Pros**:
  - Immediate visual clarity: metrics and actionable manuscript data appear above the fold.
  - Zero duplicate CTA buttons.
  - Minimal diff (KISS/YAGNI).
- **Cons**: None.

### Approach 2: Compact Header Replacement
- **Concept**: Replace with a slim single-line title bar.
- **Cons**: Unnecessary because `StudentTopbar` already displays `Scholar Workspace / Research Dashboard` breadcrumbs right above the content area.

## Next Steps

1. Transition to `hs:plan` to execute the removal.
2. Verify visual appearance and layout spacing at `http://localhost:3003/student/dashboard`.
