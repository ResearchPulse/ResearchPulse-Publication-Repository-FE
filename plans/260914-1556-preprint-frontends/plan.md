---
title: "Build Hyperlabdata Preprint Frontends"
description: "Implement separate Next.js User and Admin frontends with shared Hyperlabdata design system and SSO integration."
status: pending
priority: P1
effort: 8-12d
branch: feature/preprint-frontends
tags: [feature, frontend, auth, api]
blockedBy: []
blocks: []
created: 2026-09-14
---

# Build Hyperlabdata Preprint Frontends

## Overview

Build two independent Next.js applications for the Hyperlabdata preprint workflow. `User_FE` supports student submission and revision. `Admin_FE` supports lecturer/admin review, assignment, and publishing. Both use SSO from `SSO_BE`, shared Hyperlabdata design tokens/components, and one Preprint BE backed by Preprint DB.

## Scope Challenge

- Existing code: Admin_FE and User_FE are skeleton repos. SSO_BE/SSO_FE provide OIDC and session contracts. Preprint DB schema and Docker setup exist.
- Minimum change set: Next.js bootstrap, SSO guard, API client, shared UI foundation, student submission flow, admin review flow, integration tests.
- Deferred: DOI automation, plagiarism detection, anonymous peer review, Article sync to Main DB, advanced resumable upload.
- Complexity: 5 phases, two frontend apps, one shared UI package decision, SSO and API integration.

## Architecture

```text
SSO_BE / SSO_FE
        │ session and identity
        ▼
User_FE ────────┐
                ├── Preprint BE ─── Preprint DB
Admin_FE ───────┘
```

Preprint DB remains source of truth. Main DB is not written by either frontend.

## Phases

| Phase | Name | Status | Dependencies |
|---|---|---|---|
| 1 | [Foundation and Contracts](./phase-01-foundation-and-contracts.md) | Pending | None |
| 2 | [Shared Design System](./phase-02-shared-design-system.md) | Pending | Phase 1 |
| 3 | [User FE Submission Workflow](./phase-03-user-fe-submission-workflow.md) | Pending | Phase 1, 2 |
| 4 | [Admin FE Review Workflow](./phase-04-admin-fe-review-workflow.md) | Pending | Phase 1, 2 |
| 5 | [Integration and Release Validation](./phase-05-integration-and-release-validation.md) | Pending | Phase 3, 4 |

## Dependencies

- SSO clients and redirect URIs for both frontends.
- SSO integration: server-side Next.js BFF with PKCE; never expose client secret.
- Role source: Main User API lookup after SSO identity validation.
- Preprint BE endpoint contract and CORS configuration.
- Object storage upload: presigned URL with MIME/size/checksum policy and signed download URL.
- Shared UI: separate `@hyperlabdata/ui` package repository.
- Local ports: SSO_FE `3000`, User_FE `3002`, Admin_FE `3003`, Preprint_BE `5002`.

## Success Criteria

- Student completes draft → upload → submit → revision loop.
- Lecturer/admin completes assignment → review → approve/reject/request revision → publish loop.
- Both apps authenticate through SSO and enforce role-aware routes.
- Shared brand tokens render consistently across both apps.
- Published preprints appear in public listing.
- No frontend writes directly to Main DB.
- CI/build/lint/test checks pass for both repos.

## Open Questions

None for MVP. Production hostnames and package remote URL can be filled during environment setup without changing the architecture.

## Red Team Review

### Session — 2026-09-14

Findings: 7 accepted. Review focused on SSO, role enforcement, upload security, API readiness, shared package risk, and deployment configuration.

| # | Finding | Severity | Disposition | Applied To |
|---|---|---|---|---|
| 1 | SSO PKCE/state/nonce/callback flow underspecified | High | Accept | Phase 1 |
| 2 | Client secret must never reach browser | High | Accept | Phase 1 |
| 3 | SSO response lacks documented role source | High | Accept | Phase 1 |
| 4 | Preprint API contract is not implemented yet | High | Accept | Phase 1 |
| 5 | Upload and private file access contract unresolved | High | Accept | Phase 3 |
| 6 | Shared UI package location unresolved | Medium | Accept | Phase 2 |
| 7 | Production origin and cookie policy unresolved | Medium | Accept | Phase 5 |

### Whole-Plan Consistency Sweep

- Files reread: `plan.md`, `phase-01-foundation-and-contracts.md`, `phase-02-shared-design-system.md`, `phase-03-user-fe-submission-workflow.md`, `phase-04-admin-fe-review-workflow.md`, `phase-05-integration-and-release-validation.md`
- Decision deltas checked: 7
- Reconciled stale references: 0
- Unresolved contradictions: 0
- The red-team open questions became validation questions; validation session resolved all five decisions.

## Validation Log

### Session 1 — 2026-09-14

**Trigger:** Validation gate after red-team review.
**Questions asked:** 5

### Verification Results

- **Tier:** Full
- **Claims checked:** 8
- **Verified:** 8 | **Failed:** 0 | **Unverified:** 0
- SSO discovery, supported scopes, PKCE method, and token auth methods verified in `E:\SSO_BE\CONTRACTS.md:23-42`.
- Authorization request requirements (`state`, `code_challenge`, `S256`) verified in `E:\SSO_BE\CONTRACTS.md:74-85`.
- Token exchange and `client_secret` handling verified in `E:\SSO_BE\CONTRACTS.md:90-114`.
- UserInfo identity fields verified in `E:\SSO_BE\CONTRACTS.md:135-143`.
- Existing SSO_FE uses `credentials: include` and centralized API error handling in `E:\SSO_FE\src\lib\api.js:1-10`.
- Existing SSO_FE validates session through `/api/v1/auth/me` in `E:\SSO_FE\src\lib\api.js:15-17` and `E:\SSO_FE\src\app\auth\callback\page.jsx:1-16`.
- Target frontend repos have no existing application files that conflict with planned Next.js scaffolding; inventory checked before plan creation.
- Preprint API and upload endpoints remain Phase 1 deliverables, not assumed existing implementation.

#### Questions & Answers

1. **[Architecture]** Which SSO flow should both Next.js applications use?
   - Options: server-side Next.js BFF with PKCE (Recommended) | browser PKCE public client | undecided
   - **Answer:** Server-side Next.js BFF with PKCE.
   - **Rationale:** Keeps `client_secret`, token exchange, and session handling out of browser code.

2. **[Architecture]** Where should frontend/API role authorization data come from?
   - Options: Main User API lookup (Recommended) | SSO role claim | Preprint BE response
   - **Answer:** Main User API lookup.
   - **Rationale:** Matches current SSO contract, which documents identity claims but no role claim.

3. **[Security]** Which upload contract should User_FE use?
   - Options: Presigned object-storage URL (Recommended) | multipart through Preprint BE | undecided storage
   - **Answer:** Presigned object-storage URL.
   - **Rationale:** Keeps large file transfer out of the application server and supports private signed downloads.

4. **[Architecture]** How should shared UI code be distributed?
   - Options: Separate `@hyperlabdata/ui` package repository (Recommended) | temporary Git dependency | duplicate components
   - **Answer:** Separate `@hyperlabdata/ui` package repository.
   - **Rationale:** Preserves repo separation while preventing visual and component drift.

5. **[Environment]** Which local ports should the applications use?
   - Options: SSO_FE `3000`, User_FE `3002`, Admin_FE `3003`, Preprint_BE `5002` (Recommended) | custom ports | undecided
   - **Answer:** SSO_FE `3000`, User_FE `3002`, Admin_FE `3003`, Preprint_BE `5002`.
   - **Rationale:** Avoids port collision and gives SSO/CORS setup a deterministic local matrix.

#### Confirmed Decisions

- SSO: server-side Next.js BFF with PKCE.
- Role: Main User API lookup.
- Upload: presigned object-storage URL.
- Shared UI: separate `@hyperlabdata/ui` package repository.
- Local ports: `3000`, `3002`, `3003`, `5002`.

#### Action Items

- [ ] Register BFF-backed SSO clients with the fixed local redirect URIs.
- [ ] Add Main User API role lookup contract to Phase 1 integration work.
- [ ] Define presigned upload and signed download endpoints in Preprint BE.
- [ ] Create the separate `@hyperlabdata/ui` package repository.
- [ ] Configure staging/production origins before deployment.

#### Impact on Phases

- Phase 1: implement BFF/PKCE callback and Main User API role lookup.
- Phase 2: create and consume separate `@hyperlabdata/ui` package.
- Phase 3: integrate presigned upload and signed download URLs.
- Phase 5: test the fixed local origin/port matrix.

### Whole-Plan Consistency Sweep

- Files reread: `plan.md`, `phase-01-foundation-and-contracts.md`, `phase-02-shared-design-system.md`, `phase-03-user-fe-submission-workflow.md`, `phase-04-admin-fe-review-workflow.md`, `phase-05-integration-and-release-validation.md`
- Decision deltas checked: 5
- Reconciled stale references: 0
- Unresolved contradictions: 0
