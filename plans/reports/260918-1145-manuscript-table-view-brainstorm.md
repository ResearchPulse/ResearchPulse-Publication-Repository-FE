---
title: "My Manuscripts Table View Redesign"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: /student/my-preprints (PreprintListView.tsx & paper-student.css)"
---

# My Manuscripts Table View Redesign

## Problem Statement

The current student manuscript list view at `/student/my-preprints` ([PreprintListView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintListView.tsx)) uses a card grid layout (`.user-grid` / `.user-card`). While visual, this layout consumes significant vertical space, decreases information density, and diverges from the data-dense academic dashboard conventions already established in [StudentDashboardView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/StudentDashboardView.tsx).

The goal is to transition the manuscript repository list to a high-density, clean, and responsive academic data table format while preserving all existing filtering, searching, sorting, and metrics functionality.

## Confirmed Requirements

1. **Table Structure**:
   - Wrap in `.dashboard-table-wrapper` with horizontal scroll on small devices.
   - Use `.dashboard-table` styling adhering to academic design tokens.
   - Retain 6 distinct columns:
     - **Manuscript**: Title link (`/student/my-preprints/[id]`) + Monospace SHA-256 preview / DOI.
     - **Discipline**: Discipline tag (`.dashboard-badge-tag`).
     - **Version**: Version badge (`.dashboard-version-pill`, e.g. `v1`).
     - **Status**: Standard status badge (`.user-badge`, e.g. `APPROVED`, `UNDER_REVIEW`, `NEEDS_REVISION`, `DRAFT`).
     - **Updated**: Formatted concise date (e.g. `Sep 17, 2026`).
     - **Actions**: `Open →` link button + `Cite` button (copies APA citation with visual "Copied!" feedback).

2. **Preserved Features**:
   - 4 metrics summary cards on top (Total, In Review, Needs Revision, Approved).
   - Filter tabs pills (All, In Review, Needs Revision, Approved, Drafts).
   - Real-time search by Title, Abstract, Discipline, and Keywords.
   - Sort dropdown (Recently Updated, Title A-Z, Status).
   - Loading skeleton/spinner, Error banners, and Empty state display.

3. **Scope Boundaries**:
   - Target files: [PreprintListView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintListView.tsx) and [paper-student.css](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/styles/paper-student.css).
   - Backend/API and data contracts remain completely untouched.

## Evaluated Approaches

### Approach 1: Native Academic Dashboard Table (Approved & Recommended)
- **Concept**: Direct implementation of semantic HTML `<table>` using established `.dashboard-table` styles from `paper-student.css`.
- **Pros**:
  - Zero added bundle size / no external dependencies (KISS & DRY).
  - High information density, matches user expectation for scholarly repository.
  - Perfect consistency with dashboard table.
- **Cons**: Requires horizontal scroll container on mobile viewports (< 768px).

### Approach 2: Segmented Card-Row Table
- **Concept**: Table with detached bordered row strips (`border-spacing: 0 8px`).
- **Pros**: Visually modern card-like aesthetics.
- **Cons**: Lower information density, unnecessary CSS complexity.

### Approach 3: Reusable Generic Data-Grid
- **Concept**: Abstract headless table component `DataTable<T>`.
- **Pros**: Reusable across multiple admin/student pages.
- **Cons**: Over-engineering (YAGNI violation) given current single-page requirement.

## Recommended Design & Implementation Details

- **Citation Copy Handler**: Implement lightweight APA citation builder copying `[Authors]. "[Title]". Hyperdata Lab Preprint v[Version], [Year]. DOI: [DOI/SHA]`.
- **Badge Harmonization**: Ensure badge styles match student portal palette (`#0071bc`, `#16a34a`, `#d97706`, `#64748b`).
- **Accessibility**: Include standard ARIA table attributes (`scope="col"`, `caption` or `aria-label="Manuscripts repository list"`).

## Implementation Considerations & Risks

| Risk | Mitigation |
| :--- | :--- |
| Table overflow on mobile screens | Container `.dashboard-table-wrapper` with `-webkit-overflow-scrolling: touch` |
| Long manuscript titles breaking layout | Set `max-width: 320px`, `word-break: break-word` or ellipsis on title cell |
| Empty search/filter results | Graceful `.student-empty-card` fallback when `filteredItems.length === 0` |

## Next Steps

1. Select planning mode to create execution plan.
2. Execute code updates in [PreprintListView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintListView.tsx).
3. Validate locally in dev server (`http://localhost:3003/student/my-preprints`).
