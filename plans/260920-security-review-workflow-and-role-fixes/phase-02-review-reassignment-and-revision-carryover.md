---
phase: 2
title: "Committee Re-assignment Cleanup & Revision Auto Carry-Over"
status: pending
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: Committee Re-assignment Cleanup & Revision Auto Carry-Over

## Overview
Purge unsubmitted assignment records when Admin changes the review committee for a round, and automatically carry over the 3 assigned lecturers when an author submits a revision for round $N+1$.

## Requirements
- Functional:
  - `ReviewService.assignReviewers`:
    - Before upserting new reviewer assignments in round $N$, delete any unsubmitted review records for that round whose `reviewerId` is not in the new 3-reviewer set.
    - If any review in that round has already been submitted (`submittedAt !== null`), block reassignment with `400 BadRequestError`.
  - `PublicationService.submitRevision` / revision creation:
    - When a manuscript transitions from `DRAFTING` (after `NEEDS_REVISION`) to `REVIEWING`, `reviewRound` advances to `round + 1`.
    - Automatically carry over the 3 reviewers from round $N$ to round $N+1$ with clean initial states (`submittedAt: null`, `comment: null`, `recommendation: null`).
    - Create `PublicationEventType.REVIEW_ASSIGNED` event for audit timeline.
- Non-functional: Transactional consistency, strict 3-reviewer preservation across all rounds.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/review/review.service.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.service.ts`
- Test: `ScienceJournalTrendingVN_Public_BE/tests/review.test.ts`
- Test: `ScienceJournalTrendingVN_Public_BE/tests/publication.test.ts`

## Implementation Steps (TDD)
1. Write failing tests:
   - Assign committee [A, B, C]. Re-assign to [A, B, D] before any review. Verify total reviews in round is exactly 3 ([A, B, D]), and C no longer exists in that round.
   - Author submits revision v2 (round 2). Verify round 2 automatically has 3 review records for [A, B, D] in unsubmitted state.
2. Update `assignReviewers` in `review.service.ts`:
   ```typescript
   await tx.publicationReview.deleteMany({
     where: {
       publicationId: input.publicationId,
       round,
       reviewerId: { notIn: reviewerIds },
       submittedAt: null,
     },
   });
   ```
3. Update `commitDraftOrSubmit` / `createPublicationVersion` in `publication.service.ts`:
   - When advancing `reviewRound` from $N$ to $N+1$, query `tx.publicationReview.findMany({ where: { publicationId, round: N } })`.
   - Batch-insert the 3 reviewers for round $N+1$.
4. Run tests and verify green.

## Success Criteria
- [ ] No ghost reviewers remain when Admin re-assigns.
- [ ] Round count is always exactly 3.
- [ ] Revisions automatically carry over previous reviewers without requiring manual Admin re-selection.
