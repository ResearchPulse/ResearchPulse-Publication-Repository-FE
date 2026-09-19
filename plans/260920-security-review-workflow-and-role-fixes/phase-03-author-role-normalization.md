---
phase: 3
title: "Author Role Normalization & Lecturer Submission Fix"
status: pending
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 3: Author Role Normalization & Lecturer Submission Fix

## Overview
Normalize author role mapping so GROBID analysis respects uploader role context, and fix the frontend fallback primary author so Lecturers are never misclassified as Students or blocked for missing student IDs.

## Requirements
- Functional:
  - `PreprintEditorView.tsx`:
    - `basePrimaryAuthor`: role must be `user?.role === 'LECTURER' ? 'LECTURER' : 'STUDENT'`.
    - `studentId`: only populate if user has a `studentId`.
    - `incompleteAuthors` validation: if `author.role === 'LECTURER'`, only validate `name` and `email`; never demand `studentId`.
  - `publication.service.ts` (`analyzePublication`):
    - Identify primary extracted author matching uploader name and assign `role: userRole`.
    - Other authors: assign sensible default role (`STUDENT` if student ID pattern detected, else `LECTURER`), allowing author edit modal to refine.
- Non-functional: Seamless submission for both Student and Lecturer authors.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/preprint/views/PreprintEditorView.tsx`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.service.ts`
- Test: `ScienceJournalTrendingVN_Public_BE/tests/publication.test.ts`

## Implementation Steps (TDD)
1. Write failing tests:
   - Lecturer submits paper with no studentId -> succeeds (200/201), role stored as LECTURER.
   - GROBID analysis with Lecturer auth assigns LECTURER role to primary author matching uploader.
2. In `PreprintEditorView.tsx`:
   - Fix `basePrimaryAuthor` initialization:
     ```typescript
     const basePrimaryAuthor = {
       name: primaryAuthorName,
       email: primaryAuthorEmail,
       studentId: user?.role === 'LECTURER' ? undefined : (user?.studentId || ''),
       role: user?.role === 'LECTURER' ? ('LECTURER' as const) : ('STUDENT' as const),
       institution: primaryAuthorInst,
       isPrimary: true,
       isCorresponding: true,
     };
     ```
   - In `incompleteAuthors` check:
     ```typescript
     const role = author.role || (author.studentId ? 'STUDENT' : 'LECTURER');
     return role === 'STUDENT' ? !author.studentId?.trim() : !author.email?.trim();
     ```
3. In `publication.service.ts` (`analyzePublication`):
   - Normalize extracted authors against uploader's role.
4. Run tests and verify green.

## Success Criteria
- [ ] Lecturers can submit preprints without getting blocked by "Cần đăng ký thành viên" or missing studentId errors.
- [ ] Primary author role correctly matches the uploader.
