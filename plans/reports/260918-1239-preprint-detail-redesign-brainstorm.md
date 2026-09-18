---
title: "Preprint Detail Page Redesign (Modern Scholarly Gateway)"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintDetailView.tsx & paper-student.css"
---

# Preprint Detail Page Redesign (Modern Scholarly Gateway)

## Problem Statement

The manuscript detail view at `/student/my-preprints/[id]` ([PreprintDetailView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintDetailView.tsx)) currently exhibits several significant usability and visual design flaws:
1. **Topbar Breadcrumb Overflow**: The entire 300+ character manuscript title is pushed into the topbar breadcrumb, overflowing the top navigation and breaking layout alignment.
2. **Missing Article Heading (`<h1>`)**: The page lacks a prominent title header on the main canvas, disorienting the reader about which research paper they are viewing.
3. **Clunky Authors Stack**: Contributing authors are rendered as individual tall vertical cards. When a paper has 8 authors, it creates an 800px+ vertical scroll wall with duplicate affiliation text repeated 8 times.
4. **Scattered Action Buttons**: The PDF download button is relegated to the bottom of the right-hand sidebar instead of being immediately accessible next to the title and metadata.

## Confirmed Requirements

1. **Hero Article Header**:
   - Prominent, high-contrast academic `<h1>` title on the page.
   - Clean topbar breadcrumbs: `Scholar Workspace / My Manuscripts / Details` to prevent blowout.
   - **Authors Byline**: Authors rendered in an inline horizontal byline with superscript affiliation markers, primary/corresponding author indicators, and deduplicated affiliation footnotes.
   - **Meta Strip & Action Bar**: Status badge, Version pill, Discipline tag, License tag, DOI button, Date updated, and direct action CTAs (`Download PDF`, `Cite`, `Versions`, `Revise / Edit Draft`).

2. **Refined Two-Column Body Layout**:
   - **Main Column (70%)**:
     - Abstract with academic typography and line-height.
     - Scientific Keywords tags.
     - Document Access Box with file size, verified SHA-256 checksum, and download button.
   - **Sidebar (30%)**:
     - Publication Details card (Status, Version, Discipline, Advisor, License, DOI).
     - Citation Preview card (APA format with one-click copy).

3. **Tabbed Navigation**:
   - Overview & Document
   - Faculty Mentorship & Reviews (with count indicator)
   - Provenance & Timeline

## Evaluated Approaches

### Approach 1: Modern Scholarly Gateway (Approved & Recommended)
- **Concept**: Academic paper layout inspired by Nature, arXiv, and eLife with comprehensive Hero Header, byline with deduplicated affiliations, and balanced 2-column body.
- **Pros**:
  - Solves the breadcrumb blowout completely.
  - Reduces vertical author bloat by 80%.
  - High information density and immediate action accessibility.
- **Cons**: None.

## Next Steps

1. Create implementation plan and phase file.
2. Update `PreprintDetailView.tsx` and `paper-student.css`.
3. Run `npm run build` to verify type and build integrity.
