---
phase: 4
title: "Verification & End-to-End Testing"
status: pending
priority: P1
effort: "0.5h"
dependencies: [1, 2, 3]
---

# Phase 4: Verification & End-to-End Testing

## Overview
Perform end-to-end verification across both backend API and frontend interfaces, testing the complete workflow for both student and faculty submissions.

## Verification Checklist
- [ ] API verification: `GET /api/v1/publications?status=REVIEWING&assignedToMe=true` as Dr. Alan Turing returns exactly 1 paper.
- [ ] COI verification: Attempting to assign Turing as reviewer on his own paper returns `400 Bad Request`.
- [ ] Admin UI: Option A tabs (`All`, `Faculty Papers`, `Student Papers`) filter accurately.
- [ ] Admin UI: Column header is `AUTHOR` and badges `Faculty` / `Student` display properly.
- [ ] Lecturer UI: Review queue has 1 item, no self-submissions, author name is masked (`Anonymous Author`).
- [ ] Lecturer UI: My Manuscripts shows Turing's 3 papers with status `Under Review`.
