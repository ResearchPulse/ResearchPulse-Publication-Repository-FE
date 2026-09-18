---
phase: 1
title: "Implement Academic Table View in PreprintListView"
status: completed
priority: P1
effort: "30m"
dependencies: []
---

# Phase 01: Implement Academic Table View in PreprintListView

## Overview

Replace the card grid in `PreprintListView.tsx` with a responsive table layout matching the academic dashboard style, complete with title links, discipline tag, version pill, status badge, updated date, and quick action buttons (Open, Cite).

## Requirements

- Functional:
  - Render filtered and sorted manuscripts in a clean HTML `<table>`.
  - Display manuscript title with link to detail page and truncated SHA-256 identifier.
  - Display discipline badge (`.dashboard-badge-tag`).
  - Display version pill (`.dashboard-version-pill`).
  - Display status badge using existing `renderStatusBadge` helper.
  - Display formatted updated date (`formatUpdatedDate`).
  - Implement `handleCopyCitation` for the `Cite` button with temporary "Copied!" feedback.
  - Keep metrics strip, filter pills, search input, and sort dropdown functional.
- Non-functional:
  - Responsive horizontal scroll wrapper for small viewports.
  - Clean hover state on rows (`#fafbfc`).

## Related Code Files

- Modify: `src/features/preprint/views/PreprintListView.tsx`
- Modify (Optional): `src/features/preprint/styles/paper-student.css`

## Implementation Steps

1. In `PreprintListView.tsx`, add state `copiedId` and citation handler function `handleCopyCitation`.
2. Replace `.user-grid` block (lines 278-343) with `.dashboard-table-wrapper` containing `table.dashboard-table`.
3. Add table headers: `Manuscript`, `Discipline`, `Version`, `Status`, `Updated`, `Actions`.
4. Render each manuscript row with corresponding cell data and action buttons.
5. Verify build and runtime rendering in local Next.js dev server.

## Success Criteria

- [x] Table renders all manuscripts properly without runtime errors.
- [x] Tab switching, search filtering, and sorting continue to update the rows correctly.
- [x] Clicking `Open →` navigates to manuscript detail.
- [x] Clicking `Cite` copies citation string and temporarily displays "Copied!".
- [x] Empty state renders correctly when no items match search or filter.
