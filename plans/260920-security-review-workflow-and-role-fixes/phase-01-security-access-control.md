---
phase: 1
title: "Access Control & Storage Endpoint Protection"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Access Control & Storage Endpoint Protection

## Overview
Lock down publication direct retrieval and Cloudflare R2 storage endpoints so unauthorized users cannot inspect draft/reviewing manuscripts or download/delete arbitrary PDF objects.

## Requirements
- Functional:
  - `GET /api/v1/publications/:id`:
    - In `DRAFTING`, `PROCESSING`, `REJECTED`: Only author (`uploaderId === userId`), verified co-authors, or Admin can view.
    - In `REVIEWING`: Only author, co-authors, Admin, or assigned reviewers for current round can view (reviewers get masked double-blind author info).
    - In `PUBLISHED`: Audience rules apply.
  - `DELETE /api/v1/storage/object`:
    - Disallow deleting files attached to `REVIEWING` or `PUBLISHED` publications.
    - Disallow deletion unless user is `ADMIN` or the uploader of a `DRAFTING` publication.
  - `GET /api/v1/storage/download-url`:
    - Check user access against the associated publication record before issuing presigned download URL.
- Non-functional: TDD, OWASP compliance, prevention of IDOR.

## Related Code Files
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/publication/publication.service.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/storage/storage.service.ts`
- Modify: `ScienceJournalTrendingVN_Public_BE/src/modules/storage/storage.controller.ts`
- Test: `ScienceJournalTrendingVN_Public_BE/tests/publication.test.ts`
- Test: `ScienceJournalTrendingVN_Public_BE/tests/storage.test.ts`

## Implementation Steps (TDD)
1. Write failing tests:
   - Student B attempting `GET /api/v1/publications/:id` on Student A's draft returns 403 Forbidden.
   - Student B attempting `DELETE /api/v1/storage/object` on Student A's manuscript returns 403 Forbidden.
   - Student B attempting `GET /api/v1/storage/download-url?key=...` on Student A's unassigned reviewing manuscript returns 403 Forbidden.
2. Refactor `canViewAuthenticated` in `publication.service.ts` to gate by status:
   ```typescript
   if (['DRAFTING', 'PROCESSING', 'REJECTED'].includes(publication.status)) {
     return publication.uploaderId === userId || this.isAuthor(publication, userId) || userRole === UserRole.ADMIN;
   }
   if (publication.status === 'REVIEWING') {
     return publication.uploaderId === userId || this.isAuthor(publication, userId) || userRole === UserRole.ADMIN;
     // Note: assigned reviewers are handled via assignedReviewer check in getPublicationById
   }
   if (publication.status === 'PUBLISHED') {
     if (publication.isPrivate) return publication.uploaderId === userId || userRole === UserRole.ADMIN;
     if (publication.audiences.length === 0) return true;
     return publication.audiences.includes(userRole === UserRole.STUDENT ? PublicationAudience.STUDENT : PublicationAudience.LECTURER);
   }
   ```
3. Update `StorageService.deleteObject` and `generateDownloadUrl` with publication ownership checks:
   - Query `Publication` / `PublicationVersion` by `objectKey`.
   - Validate caller permissions before performing S3/R2 commands.
4. Run tests and ensure all pass green.

## Success Criteria
- [ ] Unauthorized users cannot fetch draft or reviewing papers of other authors.
- [ ] Unauthorized users cannot delete or download R2 objects by guessing `objectKey`.
- [ ] All storage and publication tests pass.
