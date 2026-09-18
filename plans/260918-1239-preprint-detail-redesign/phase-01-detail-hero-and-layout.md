---
phase: 1
title: "Implement Hero Article Header and Modern Scholarly Layout in PreprintDetailView"
status: completed
priority: P1
effort: "45m"
dependencies: []
---

# Phase 01: Implement Hero Article Header and Modern Scholarly Layout in PreprintDetailView

## Overview

Transform `PreprintDetailView.tsx` into a modern scholarly gateway by adding an article header with `<h1>` title, compact author byline with superscript indicators and deduplicated affiliations, prominent action bar (Download, Cite, Versions), and clean two-column layout.

## Requirements

- Functional:
  - Fix topbar breadcrumb to avoid title blowout (`Scholar Workspace / My Manuscripts / Details`).
  - Render high-contrast academic `<h1>` title in `.student-paper-hero`.
  - Calculate unique affiliations from `item.authors` and display authors as inline byline with superscripts.
  - Render deduplicated affiliation footnotes below author byline.
  - Implement top action buttons: `Download PDF`, `Cite` (with APA string generator & copy feedback), `Versions (X)`, and conditional `Revise Manuscript` / `Continue Draft`.
  - Provide two-column overview layout: Abstract & Keywords + Document download box in main column; Publication details + Citation copy box in sidebar.
  - Preserve Review feedback and Timeline tabs.
- Non-functional:
  - Responsive stacking on smaller viewports.
  - Professional typography matching scholarly publications.

## Related Code Files

- Modify: `src/features/preprint/views/PreprintDetailView.tsx`
- Modify: `src/features/preprint/styles/paper-student.css`

## Implementation Steps

1. In `PreprintDetailView.tsx`, compute `uniqueAffiliations` and `affiliationsMap` from `item.authors`.
2. Implement `handleCopyCitation` for formatting and copying APA citations to clipboard.
3. Build the Hero Article Header (`.student-paper-hero`) containing title, author byline, meta badges, and action buttons.
4. Clean up the Overview tab into a 2-column layout (Main: Abstract + Keywords + Document Box; Sidebar: Publication Details + Quick Citation).
5. In `paper-student.css`, add styling for `.student-paper-hero`, byline, author tags, affiliations, and action buttons.
6. Verify type integrity and compilation with `npm run build`.

## Success Criteria

- [ ] Breadcrumb on Topbar is concise and does not overflow.
- [ ] Article title is prominently rendered in `<h1>`.
- [ ] Authors are rendered as a clean horizontal byline with deduplicated affiliations.
- [ ] Download, Cite, and Versions buttons function as expected.
- [ ] All tabs (Overview, Reviews, Timeline) toggle properly.
- [ ] `npm run build` succeeds with zero errors.
