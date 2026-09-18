---
title: "My Manuscripts Table View Implementation Plan"
status: completed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintListView Table View"
brainstorm: "plans/reports/260918-1145-manuscript-table-view-brainstorm.md"
phases:
  - id: 1
    file: "phase-01-table-view.md"
    title: "Implement Academic Table View in PreprintListView"
    status: completed
---

# My Manuscripts Table View Implementation Plan

## Overview

Convert the manuscript listing page at `/student/my-preprints` from a card grid layout (`.user-grid`) into a high-density, academic data table (`.dashboard-table`).

## Phases Summary

| Phase | Title | Status | Files Modified |
| :--- | :--- | :--- | :--- |
| **01** | Implement Academic Table View in PreprintListView | Completed | `src/features/preprint/views/PreprintListView.tsx`, `src/features/preprint/styles/paper-student.css` |

## Verification Plan

- Check compilation and rendering at `http://localhost:3003/student/my-preprints`.
- Verify tab filtering (All, In Review, Needs Revision, Approved, Drafts).
- Verify real-time search query matching.
- Verify sorting by Updated, Title, and Status.
- Test `Open →` navigation to detail page.
- Test `Cite` button copying APA text and showing "Copied!".
