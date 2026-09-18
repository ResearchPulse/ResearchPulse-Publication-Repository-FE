---
title: "Remove Action Column from Admin Dashboard Table"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: AdminDashboardView.tsx"
---

# Remove Action Column from Admin Dashboard Table

## Problem Statement

On the Admin Dashboard (`/admin/dashboard` / [AdminDashboardView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminDashboardView.tsx)), the editorial submissions table includes an `ACTION` column containing a `Manage` link.

Because the manuscript title itself is already a prominent, accessible link to the detail/management page (`ROUTES.ADMIN.SUBMISSION_DETAIL(item.id)`), the `ACTION` column is redundant, consumes horizontal table width, and clutters the interface.

## Confirmed Requirements

1. **Delete Action Column**:
   - Remove `<th style={{ textAlign: 'right' }}>Action</th>` from `<thead>` (lines 309-310).
   - Remove `<td style={{ textAlign: 'right' }}>...<Link>Manage</Link>...</td>` from `<tbody>` (lines 354-362).
2. **Column Spacing & Balance**:
   - Remove hard-coded `style={{ width: '46%' }}` on the `Manuscript` header, allowing table columns to distribute width naturally across the 5 remaining columns (`Manuscript`, `Student Author`, `Version`, `Last Updated`, `Status`).
3. **Preserve Navigation**:
   - Retain the clickable title link on the manuscript title (`.dashboard-table__title-link`).
4. **Scope Boundaries**:
   - Apply only to [AdminDashboardView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminDashboardView.tsx).

## Evaluated Approaches

### Approach 1: Direct Column Removal (Approved & Recommended)
- **Concept**: Remove `<th>Action</th>` and `<td>Manage</td>` from `AdminDashboardView.tsx`, let table balance column widths automatically.
- **Pros**:
  - Simple, clean diff (KISS/YAGNI).
  - Maximizes readable space for manuscript titles and author names.
  - Keeps UX consistent since title is already clickable.
- **Cons**: None.

## Next Steps

1. Transition to plan execution via `hs:plan`.
2. Update `AdminDashboardView.tsx`.
3. Validate compilation with `npx tsc --noEmit` and check `http://localhost:3003/admin/dashboard`.
