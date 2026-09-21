---
phase: 4
title: "Audience Lifecycle, Review Round Sync & Schema Docs"
status: pending
priority: P2
effort: "1.5h"
dependencies: [1, 2]
---

# Phase 4: Audience Lifecycle, Review Round Sync & Schema Docs

## Overview
Restrict Audience Visibility configuration to active editorial review/publish phases, synchronize `reviewRound` from DB to Admin UI, and update Swagger documentation to reflect Lecturer upload support.

## Requirements
- Functional:
  - `updateVisibility` in `publication.service.ts`:
    - Disallow audience updates for manuscripts in `DRAFTING`, `PROCESSING`, or `REJECTED` status (throw `400 BadRequestError`).
    - Allow only when status is `REVIEWING` (editorial preparation) or `PUBLISHED`.
  - Expose `reviewRound: publication.reviewRound` in:
    - `getPublicationById` payload
    - `listPublications` payload
    - `AdminPublication` type in `preprintApi.ts`
  - In `AdminSubmissionDetailView.tsx`:
    - Display the Audience Visibility card only when `status === 'REVIEWING' || status === 'PUBLISHED'`.
    - Bind `currentRound` directly to `publication.reviewRound` (falling back to `reviews[0]?.round || 1`).
  - In `publication.schema.ts`:
    - Update outdated descriptions mentioning "Only STUDENT can upload".
- Non-functional: Consistent lifecycle state machine and documentation accuracy.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.service.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.schema.ts`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/admin/api/preprintApi.ts`
- Modify: `ScienceJournalTrendingVN_Admin_FE/src/features/admin/views/AdminSubmissionDetailView.tsx`
- Test: `ScienceJournalTrendingVN_Public_BE/tests/publication.test.ts`

## Implementation Steps (TDD)
1. Write failing tests:
   - Calling `PATCH /visibility` on a `DRAFTING` manuscript returns 400 BadRequest.
   - Calling `PATCH /visibility` on a `REVIEWING` manuscript succeeds (200).
   - Calling `GET /publications/:id` includes `reviewRound`.
2. Update `updateVisibility` in `publication.service.ts`:
   ```typescript
   if (!['REVIEWING', 'PUBLISHED'].includes(publication.status)) {
     throw new BadRequestError('Audience visibility can only be configured for manuscripts in REVIEWING or PUBLISHED status.');
   }
   ```
3. Expose `reviewRound` in publication formats & schemas.
4. Update `AdminSubmissionDetailView.tsx`:
   - Bind to `publication.reviewRound`.
   - Conditionally render audience card.
5. Update Swagger descriptions in `publication.schema.ts`.
6. Run tests and verify green.

## Success Criteria
- [ ] Audience cannot be edited during Draft/Processing/Rejected phases.
- [ ] UI round displays accurately based on `publication.reviewRound`.
- [ ] Swagger API docs accurately document Student & Lecturer capabilities.
