---
title: "Remove Actions Column from My Manuscripts Table"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintListView.tsx"
---

# Remove Actions Column from My Manuscripts Table

## Problem Statement

On the student preprints listing page (`/student/my-preprints` / [PreprintListView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintListView.tsx)), the table includes an `ACTIONS` column containing `Open →` and `Cite`.

The `Open →` button is redundant because the manuscript title is already a prominent, accessible link to the detail page. The `Cite` button is rarely used from the high-level overview and belongs on the dedicated preprint detail page with complete bibliographic metadata.

Removing this column simplifies the table to 5 core columns (`MANUSCRIPT`, `DISCIPLINE`, `VERSION`, `STATUS`, `UPDATED`), allocating more horizontal width (~48-52%) to the manuscript title for improved readability.

## Confirmed Requirements

1. **Delete Actions Column**:
   - Remove `<th style={{ textAlign: 'right', paddingRight: '22px' }}>Actions</th>` from `thead`.
   - Remove the corresponding `<td>` action buttons container from `tbody`.
2. **Clean Up Unused State**:
   - Remove `copiedDoi` state and `handleCopyCitation` handler.
3. **Table Structure & Navigation**:
   - Title link (`dashboard-table__title-link`) remains the primary entry point to `/student/my-preprints/[id]`.
   - Widen `MANUSCRIPT` column width to `48%`.

## Evaluated Approaches

### Approach 1: 5-Column Clean Table (Approved & Recommended)
- **Concept**: Remove `ACTIONS` column, clean up citation state, widen title column.
- **Pros**:
  - Highest information density and cleanest typography.
  - Zero duplicate buttons.
  - Standard scholarly repository table convention.
- **Cons**: None.

## Next Steps

1. Update `PreprintListView.tsx`.
2. Run `npm run build` to verify type safety and build success.
