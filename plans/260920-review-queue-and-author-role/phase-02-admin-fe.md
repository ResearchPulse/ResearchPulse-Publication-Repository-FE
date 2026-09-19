---
phase: 2
title: "Frontend Admin Submissions Workspace (Option A Tabs & Standardization)"
status: pending
priority: P1
effort: "1.5h"
dependencies: [1]
---

# Phase 2: Frontend Admin Submissions Workspace (Option A Tabs & Standardization)

## Overview
Implement Option A Segmented Tabs (`All Submissions`, `Faculty Papers`, `Student Papers`) in the Admin Submissions management view, replace hardcoded `STUDENT AUTHOR` headers with `AUTHOR` and `Faculty` / `Student` role badges, and exclude authors from the reviewer assignment options.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/admin/api/preprintApi.ts`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminSubmissionsView.tsx`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminDashboardView.tsx`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminSubmissionDetailView.tsx`

## Success Criteria
- [ ] Admin can switch between `All Submissions`, `Faculty Papers`, and `Student Papers`.
- [ ] Table headers display `AUTHOR` instead of `STUDENT AUTHOR`.
- [ ] Badges `Faculty` and `Student` display next to author names.
- [ ] Admin cannot select the author as a reviewer.
