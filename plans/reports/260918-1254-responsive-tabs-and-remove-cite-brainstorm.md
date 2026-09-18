---
title: "Synchronize Responsive Design Across Tabs & Remove All Cite Buttons"
status: proposed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintDetailView, StudentDashboardView, StudentVersionArchiveView, paper-student.css"
---

# Synchronize Responsive Design Across Tabs & Remove All Cite Buttons

## 1. Context & User Requirements

1. **Remove All Cite Buttons (Approved Option 1)**:
   - Remove `Cite` button from the top hero action bar in `PreprintDetailView.tsx`.
   - Remove the entire `Cite this Preprint` card in the right sidebar in `PreprintDetailView.tsx`.
   - Remove `Cite` buttons from `StudentDashboardView.tsx` and `StudentVersionArchiveView.tsx`.
   - Clean up unused citation handlers/states.

2. **Synchronize Responsive Layout Across All Tabs**:
   - Currently, each tab in `PreprintDetailView.tsx` renders different layouts (2-column grid in Tab 1, list of review cards in Tab 2, vertical audit timeline in Tab 3).
   - Under mobile and tablet viewports (<=1024px, <=768px, <=480px), tabs and content containers need a unified responsive behavior so that spacing, typography, scrolling, and card boundaries remain consistent across all 3 tabs.

---

## 2. Scout & Architecture Analysis

### Current Layout per Tab
- **Tab Bar (`.student-detail-tabs`)**:
  - `display: flex; gap: 4px; border-bottom: 2px solid #e8eef2;`
  - *Issue*: Fixed flex without horizontal scrolling causes tab text wrapping or overflow on narrow screens (<640px).
- **Tab 1: Overview & Metadata (`.student-panel-grid`)**:
  - `grid-template-columns: 1fr 340px; gap: 24px;`
  - *Issue*: Sidebar stays at 340px fixed on tablets, squishing the Abstract.
- **Tab 2: Faculty Mentorship & Reviews (`.student-reviews-feed`)**:
  - `.student-review-header`: Avatar + Info + Decision Badge in one flex row.
  - *Issue*: Header overflows or squishes on small mobile (<640px).
- **Tab 3: Provenance & Timeline (`.student-timeline-card`)**:
  - Padding 28px, fixed item layout.
  - *Issue*: Fixed padding wastes screen real estate on mobile screens.

---

## 3. Responsive Design System Specification (Breakpoints)

### A. Breakpoint 1024px (Tablet Landscape / Small Laptop)
- `.student-panel-grid`: Collapse from `1fr 340px` to `1fr` (single column). The `Publication Details` card sits neatly below the `Abstract` card with full width.
- `.student-paper-hero`: Adjust horizontal padding from `32px` to `24px`.

### B. Breakpoint 768px (Tablet Portrait / Mobile)
- **Tab Navigation Bar (`.student-detail-tabs`)**:
  - Apply `overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch;`.
  - Add smooth scroll indicators and hide scrollbar (`scrollbar-width: none;`).
  - `.student-detail-tab`: `flex-shrink: 0; padding: 10px 14px; font-size: 13px;` ensuring zero awkward wrapping.
- **Hero Header (`.student-paper-hero`)**:
  - Padding: `20px 16px`.
  - Title: Scaled to `20px` line-height `1.35`.
  - Actions (`.student-paper-hero__actions`): Allow full width or equal distribution on small screens.
- **Tab 1 (Overview)**:
  - Cards padding: `18px 16px`.
  - Long values in `.student-meta-item` (DOI, SHA-256): Enforce `word-break: break-all;` and allow clean wrapping on mobile.
- **Tab 2 (Faculty Reviews)**:
  - Card padding: `18px 16px`.
  - Header: `flex-wrap: wrap; gap: 10px;`.
  - Decision badge: Wraps below reviewer name gracefully.
  - Bottom action button (`Open Revision Form`): Stretches full-width (`width: 100%; justify-content: center;`).
- **Tab 3 (Provenance & Timeline)**:
  - Card padding: `20px 16px`.
  - Timeline meta: `flex-wrap: wrap; gap: 4px 8px;`.

---

## 4. Implementation Plan

| File | Change |
|------|--------|
| `PreprintDetailView.tsx` | 1. Remove `Cite` button from hero actions.<br>2. Remove `Cite this Preprint` card from sidebar.<br>3. Remove unused citation states and helpers. |
| `StudentDashboardView.tsx` | Remove `Cite` button from table row actions. |
| `StudentVersionArchiveView.tsx` | Remove `Cite` button from table row actions. |
| `paper-student.css` | Add unified responsive rules for `.student-detail-tabs`, `.student-panel-grid`, `.student-review-card`, `.student-timeline-card`, `.student-paper-hero` under `@media (max-width: 1024px)` and `@media (max-width: 768px)`. |

---

## 5. Verification
- `npm run build`: Static validation, zero TypeScript errors.
- Visual inspection of generated layout rules for desktop, tablet, and mobile.
