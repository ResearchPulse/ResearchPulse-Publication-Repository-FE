---
phase: 1
title: "Backend COI Enforcement, Role Payload & Admin Filtering"
status: pending
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Backend COI Enforcement, Role Payload & Admin Filtering

## Overview
Secure backend APIs against Conflict of Interest (COI) so that lecturers cannot review their own submissions, add author role payloads to publication responses, support `uploaderRole` filtering for Admin, and hide pending reviews from authors until decisions are finalized.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.service.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.schema.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/review/review.service.ts`

## Success Criteria
- [ ] Lecturer querying `assignedToMe=true` only receives publications assigned to them, excluding their own.
- [ ] `assignReviewers` rejects attempts to assign the uploader or coauthors.
- [ ] `uploader` object contains `role` (`STUDENT` | `LECTURER`) and `studentId`.
- [ ] Reviews are masked/hidden from authors while publication is in `REVIEWING` status.
