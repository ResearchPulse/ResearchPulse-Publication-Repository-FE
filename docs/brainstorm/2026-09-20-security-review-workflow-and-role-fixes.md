# Brainstorm Report: Security Tightening, Review Workflow & Author Role Normalization

**Date:** 2026-09-20  
**Status:** Agreed  
**Target Repos:** `ScienceJournalTrendingVN_Public_BE`, `ScienceJournalTrendingVN_Admin_FE`  

---

## 1. Executive Summary & Problem Statements

Following a comprehensive audit of the manuscript submission, review, and storage workflows, 5 key architectural and security areas were identified:

1. **Authorization Leak on Draft/Reviewing Manuscripts (`publication.service.ts:184-195`)**:
   `canViewAuthenticated` failed to check manuscript status. Any authenticated Student or Lecturer could view any other author's draft/unassigned paper and retrieve presigned R2 download URLs if `audiences` was empty.
2. **Storage API Insecure Direct Object Reference (IDOR) & Arbitrary Deletion (`storage.route.ts:35`, `storage.controller.ts:46-58`)**:
   `GET /download-url` and `DELETE /object` accepted any `objectKey` without verifying ownership or Admin role, allowing unauthorized downloading and deletion of manuscript PDFs.
3. **Ghost Reviewer Assignments on Re-assignment (`review.service.ts:106-127`)**:
   When Admin re-assigned reviewers before reviews were submitted, replaced lecturers were not deleted from `publicationReview`, allowing more than 3 reviewers to remain active.
4. **GROBID Author Role Discrepancy & Lecturer Submit Blocker (`publication.service.ts:413-419`, `PreprintEditorView.tsx:214-239`)**:
   GROBID assigned `role: LECTURER` to all extracted authors, while frontend defaulted `basePrimaryAuthor` to `role: 'STUDENT'`, demanding a student ID from Lecturer uploaders and blocking submission with `"Cần đăng ký thành viên"`.
5. **Business Lifecycle & Display Desynchronizations**:
   - Lack of automatic reviewer carry-over on manuscript revision (`round + 1`).
   - Unrestricted audience visibility configuration during draft phases.
   - UI fallback to `version` instead of actual `reviewRound`.
   - Outdated schema descriptions stating "Only students".

---

## 2. Agreed Architectural Solutions

### A. Access Control & Authorization (Tier 1 Security)
* **Status-Gated Access in `publication.service.ts`**:
  * `DRAFTING`, `PROCESSING`, `REJECTED`: Strictly restricted to `uploaderId === userId`, co-authors (`isAuthor`), or `ADMIN`.
  * `REVIEWING`: Restricted to `uploaderId === userId`, co-authors, `ADMIN`, and **assigned reviewers for the current round** (`assignedReviewer`). Reviewers see masked author identity (`Anonymous Author`).
  * `PUBLISHED`: Governed by `audiences` (Student, Lecturer, Guest).
* **Storage Guard in `storage.controller.ts` & `storage.service.ts`**:
  * `DELETE /api/v1/storage/object`:
    * Verify `objectKey` against `Publication` and `PublicationVersion`.
    * Disallow deletion if publication is `REVIEWING` or `PUBLISHED`.
    * Allow deletion only if user is `ADMIN` or the `uploader` of a `DRAFTING` manuscript.
  * `GET /api/v1/storage/download-url`:
    * Verify access permissions against the associated manuscript record before generating a presigned download URL.

---

### B. Review Committee Re-assignment & Revision Auto Carry-Over
* **Re-assignment Cleanup in `review.service.ts`**:
  * When Admin updates assignments for round $N$, before upserting the 3 new reviewers, execute:
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
  * Ensures that replaced reviewers are immediately purged from the review committee.
* **Automatic Carry-Over on Revision (Option 1)**:
  * In `submitRevision` (when a revised PDF is submitted after `NEEDS_REVISION`):
  * The manuscript advances to `reviewRound = round + 1` and `status = 'REVIEWING'`.
  * Automatically query the 3 assigned lecturers (1 Primary, 2 Secondary) from the previous round and create new unsubmitted review records for the new round and new `versionId`.
  * Reviewers immediately see the revised manuscript in their queue with a fresh SLA.

---

### C. Author Role Normalization (GROBID & Frontend)
* **Backend (`publication.service.ts`)**:
  * In `analyzePublication`: identify the primary extracted author matching the uploader and set `role: userRole` (preserving Lecturer or Student identity). Default subsequent authors sensibly without forcing all to LECTURER.
* **Frontend (`PreprintEditorView.tsx`)**:
  * Correct `basePrimaryAuthor`:
    ```typescript
    role: user?.role === 'LECTURER' ? 'LECTURER' : 'STUDENT',
    studentId: user?.role === 'LECTURER' ? undefined : (user?.studentId || ''),
    ```
  * Update `incompleteAuthors` validation: if `author.role === 'LECTURER'`, require only `name` and `email` (never require `studentId`).

---

### D. Audience Lifecycle & Review Round Sync
* **Audience Lifecycle**:
  * Backend `updateVisibility`: reject modification (`400 Bad Request`) if publication status is `DRAFTING`, `PROCESSING`, or `REJECTED`. Allow only in `REVIEWING` (pre-publish staging) or `PUBLISHED`.
  * Frontend `AdminSubmissionDetailView.tsx`: render Audience Visibility controls only when status is `REVIEWING` or `PUBLISHED`.
* **Review Round Sync**:
  * Expose `reviewRound: publication.reviewRound` in backend publication select schemas.
  * Update `AdminPublication` type in `preprintApi.ts`.
  * In `AdminSubmissionDetailView.tsx`, bind directly to `publication.reviewRound` rather than falling back to `currentVersion.version`.
* **Documentation**:
  * Refresh `publication.schema.ts` descriptions from "Student only" to "Students and Lecturers".

---

## 3. Implementation Phases Overview

| Phase | Scope | Primary Files |
|---|---|---|
| **Phase 1: Backend Security & Access Control** | Fix `canViewAuthenticated`, protect `/storage/object` and `/storage/download-url` | `publication.service.ts`, `storage.route.ts`, `storage.controller.ts`, `storage.service.ts` |
| **Phase 2: Review Committee & Revision Carry-Over** | Re-assignment cleanup, auto carry-over on revision | `review.service.ts`, `publication.service.ts` |
| **Phase 3: Author Role & Submission Fix** | Fix `basePrimaryAuthor`, Lecturer validation without MSSV, GROBID author mapping | `PreprintEditorView.tsx`, `publication.service.ts` |
| **Phase 4: Audience Lifecycle & UI Round Sync** | Lock audience in Draft, expose `reviewRound`, update Swagger | `publication.service.ts`, `publication.schema.ts`, `preprintApi.ts`, `AdminSubmissionDetailView.tsx` |
| **Phase 5: Verification & Tests** | Unit tests, access control tests, end-to-end revision flow verification | `tests/publication.test.ts`, `tests/storage.test.ts`, `tests/review.test.ts` |
