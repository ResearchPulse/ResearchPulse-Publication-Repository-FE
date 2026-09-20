---
title: "Security Tightening, Review Workflow & Author Role Normalization"
status: pending
priority: P1
mode: tdd
created: 2026-09-20
context: docs/brainstorm/2026-09-20-security-review-workflow-and-role-fixes.md
---

# Plan: Security Tightening, Review Workflow & Author Role Normalization

## Problem Statement
A thorough audit revealed 4 critical vulnerabilities and several business logic gaps:
1. **Authorization Leak**: Unauthenticated or non-author students/lecturers could view any manuscript in `DRAFTING` or `REVIEWING` status via `/api/v1/publications/:id` if audiences was empty.
2. **Storage IDOR & Arbitrary Deletion**: `/api/v1/storage/download-url` and `/api/v1/storage/object` allowed any authenticated user to download or delete any R2 object.
3. **Ghost Reviewers**: Re-assigning reviewers before submission left replaced reviewers in the DB, allowing >3 reviewers.
4. **Author Role Normalization & Lecturer Submission Blocker**: GROBID forced all authors to LECTURER, while FE defaulted `basePrimaryAuthor` to STUDENT, blocking Lecturer submissions for lack of student ID.
5. **Business Gaps**: Lack of automatic reviewer carry-over on revision submission, unrestricted audience editing during drafting, UI fallback to version instead of `reviewRound`, and outdated schema documentation.

## Phases

| Phase | Title | Priority | Status | Effort |
|---|---|---|---|---|
| [Phase 1](phase-01-security-access-control.md) | Access Control & Storage Endpoint Protection | P1 | pending | 2h |
| [Phase 2](phase-02-review-reassignment-and-revision-carryover.md) | Committee Re-assignment Cleanup & Revision Auto Carry-Over | P1 | pending | 2h |
| [Phase 3](phase-03-author-role-normalization.md) | Author Role Normalization & Lecturer Submission Fix | P1 | pending | 1.5h |
| [Phase 4](phase-04-audience-lifecycle-and-round-sync.md) | Audience Lifecycle, Review Round Sync & Schema Docs | P2 | pending | 1.5h |
| [Phase 5](phase-05-full-verification.md) | End-to-End Test & Verification Suite | P1 | pending | 1h |
