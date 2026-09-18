---
title: "Preprint Detail Page Redesign Implementation Plan"
status: completed
version: 0.1.0
date: 2026-09-18
scope: "ScienceJournalTrendingVN_Admin_FE: PreprintDetailView.tsx & paper-student.css"
brainstorm: "plans/reports/260918-1239-preprint-detail-redesign-brainstorm.md"
phases:
  - id: 1
    file: "phase-01-detail-hero-and-layout.md"
    title: "Implement Hero Article Header and Modern Scholarly Layout in PreprintDetailView"
    status: completed
---

# Preprint Detail Page Redesign Implementation Plan

## Overview

Redesign the student preprint detail page at `/student/my-preprints/[id]` with a prominent article header, deduplicated author byline, integrated action buttons, and balanced two-column overview layout.

## Phases Summary

| Phase | Title | Status | Files Modified |
| :--- | :--- | :--- | :--- |
| **01** | Implement Hero Article Header and Modern Scholarly Layout | Pending | `src/features/preprint/views/PreprintDetailView.tsx`, `src/features/preprint/styles/paper-student.css` |

## Verification Plan

- Check Next.js build (`npm run build`).
- Verify proper rendering of Article Title, Byline, and Affiliations.
- Verify Action buttons (`Download PDF`, `Cite`, `Versions`, `Revise`).
- Verify Tab switching between Overview, Reviews, and Timeline.
