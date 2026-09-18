---
title: "Submission Detail UI Redesign"
status: approved
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: AdminSubmissionDetailView.tsx & admin-layout.css"
---

# Submission Detail UI Redesign Brainstorm & Specification

## Problem Statement & User Insights

Upon reviewing the Admin Submission Detail page (`/admin/submissions/[id]` / [AdminSubmissionDetailView.tsx](file:///e:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminSubmissionDetailView.tsx)), several critical UX and visual flaws were identified:

1. **Title Duplication**: The long manuscript title appears twice in succession (once in `AdminPageHeader` and again immediately below inside the left panel), creating visual redundancy and clutter.
2. **Squished Status Badge ("UNDER REVIEW")**: The status badge in the header has no `white-space: nowrap` and is compressed by the wide title in the flex layout, causing "UNDER REVIEW" to break awkwardly into two squished lines.
3. **Unrefined "Back to submissions" Button**: Rendered as a plain, unstyled text link (`← Back to submissions`) that lacks visual weight and proper alignment.
4. **Layout Balance & Action Access**: The right column contains critical editorial actions (Review status, Lecturer assignments, and Administrator Decision buttons) but scrolls out of view when reviewing long timelines, leaving dead space on the right.

## Confirmed Requirements

1. **Layout**:
   - Maintain the functional two-column layout:
     - **Left Column**: Manuscript details, Abstract, PDF download, Contributing Authors, Version History, Audit Timeline.
     - **Right Column**: Peer Review Progress, Lecturer Assignments, and Administrator Decision.
   - Make the right column sticky (`position: sticky; top: 20px`) for seamless access to editorial actions during long document reviews.
2. **Header & Title Deduplication**:
   - Keep the primary manuscript title in `AdminPageHeader`.
   - In the left panel, replace the duplicate `<h2>` title with an elegant, compact **Manuscript Meta Strip**:
     - Version indicator (`v1.0`)
     - Category / Discipline tag
     - Submission & update timestamp
     - Formatted status badge with zero text wrapping (`white-space: nowrap`, `flex-shrink: 0`).
3. **Refined Navigation ("Back to submissions")**:
   - Transform `back-link` into a modern button component (`.admin-back-btn`) featuring an SVG arrow icon, crisp border, subtle hover state, and clear typography.
4. **Badge Styling Fix**:
   - Ensure `.status-badge` has `white-space: nowrap`, `display: inline-flex`, proper padding (`4px 12px`), and robust minimum sizing to prevent text from ever wrapping or getting crushed.
5. **Assets & Buttons**:
   - Maintain a clean, professional single `Download PDF` action button.
   - Elevate the Administrator Decision buttons (`Publish Paper`, `Request Revision`, `Reject Paper`) with modern visual hierarchy and hover micro-interactions.

## Recommended Technical Design

### 1. `AdminSubmissionDetailView.tsx`
- Replace raw `back-link` with enhanced button markup:
  ```tsx
  <Link className="admin-back-btn" href={ROUTES.ADMIN.SUBMISSIONS}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
    <span>Back to Submissions</span>
  </Link>
  ```
- Redesign `.manuscript-detail-header`:
  - Remove duplicate `<h2 className="manuscript-detail-title">{publication.title}</h2>`.
  - Render a clean metadata summary bar containing Version, Date, Uploader ID/Email, and the pristine un-squished `<StatusBadge>`.

### 2. `admin-layout.css`
- Add `.admin-back-btn` styling (sleek border, rounded pill/card, smooth hover).
- Add `.status-badge` override ensuring `white-space: nowrap !important`, `flex-shrink: 0`.
- Update `.detail-grid` right column wrapper to support sticky positioning.
- Modernize the Decision Card buttons with refined gradients, box-shadows, and micro-transitions.

## Success Criteria

- [ ] Title appears exactly once at the top of the page.
- [ ] Status badge "UNDER REVIEW" renders on a single horizontal line with balanced padding and no squishing.
- [ ] "Back to submissions" is styled as a polished modern navigation action.
- [ ] Right action panel remains sticky when scrolling down long left-side content.
- [ ] TypeScript compilation succeeds with 0 errors.
