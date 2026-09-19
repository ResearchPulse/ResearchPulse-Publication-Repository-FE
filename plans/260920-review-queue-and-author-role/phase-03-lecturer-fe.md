---
phase: 3
title: "Frontend Lecturer Review Queue & Review Detail (Double-Blind & Clean Queue)"
status: pending
priority: P1
effort: "1h"
dependencies: [1]
---

# Phase 3: Frontend Lecturer Review Queue & Review Detail (Double-Blind & Clean Queue)

## Overview
Connect Lecturer Review Queue to `assignedToMe=true` so that lecturers only see manuscripts assigned to them. Mask author identity to ensure double-blind review, update column headers to `AUTHOR`, and eliminate legacy "student author" terminology.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/api/lecturerReviewApi.ts`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/views/LecturerReviewsView.tsx`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/lecturer/views/LecturerReviewDetailView.tsx`

## Success Criteria
- [ ] Dr. Alan Turing's Review Queue displays only Alice Student's paper (pending count = 1).
- [ ] Review Queue and Review Detail show `Anonymous Author` for Double-Blind Review.
- [ ] Turing's own papers are absent from the review queue and remain accessible under `My Manuscripts`.
