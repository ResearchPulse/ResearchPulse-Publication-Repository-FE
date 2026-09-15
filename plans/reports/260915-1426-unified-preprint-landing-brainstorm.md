---
title: "Unified Preprint Portal and Academic Gateway Landing"
status: approved
version: 0.1.0
date: 2026-09-15
scope: "Admin_FE unified repo, public landing page, route namespaces, and role permissions"
---

# Unified Preprint Portal and Academic Gateway Landing

## Problem Statement

Hyperdata Lab needs a public entry point that explains the value of a preprint and converts students into registered users. The current User FE and Admin FE are separate Next.js repositories; the approved direction is to consolidate the User FE into the Admin FE repository while keeping user and admin experiences separated by route namespace and authorization.

The landing page should feel like an academic gateway: a safe first home for student research, a structured feedback path, and a controlled route toward publication.

## Confirmed Requirements

- Public landing page at /, targeting students and making registration the primary conversion.
- User FE is brought into the Admin FE repository; there is one Next.js frontend.
- STUDENT and RESEARCHER access /student/**.
- LECTURER and ADMINISTRATOR access /admin/**.
- Multiple lecturers may review one submission; lecturers cannot publish.
- Administrators have the highest authority and make the final publish decision.
- Public pages require no authentication; protected access must fail closed.
- Authentication and registration use the existing SSO system.
- Roles must come from trusted server-side session/user data; query parameters never grant roles.
- The SSO FE design system at E:/SSO_FE/docs/hyperdata-lab-design-system.md is the source of truth.
- Backend and database changes are outside this landing-first scope.

## Evaluated Approaches

### A. Academic Gateway — Approved

A calm, research-grade public landing page that explains preprints, shows the student journey, and leads into registration. It communicates academic value before asking for an account, supports the future role model, avoids invented public metrics, and fits Hyperdata Lab. Trade-off: it has less catalogue-like content until real public preprints exist.

### B. Student Launchpad

An action-first submission entry point. It has a very clear conversion path, but can feel like a form rather than academic infrastructure and gives less context about review integrity.

### C. Research Commons

A discovery page with featured preprints, categories, and activity metrics. It may build credibility later, but needs reliable public data, moderation, privacy decisions, and anti-fabrication rules. It is not appropriate for the first landing scope.

## Approved Design

Use Approach A with the clarity and conversion discipline of Approach B. Keep the first version explanatory and trustworthy. Do not show featured papers, counts, rankings, or activity metrics until backed by real approved data.

### Landing Information Architecture

1. Header: Hyperdata Lab mark; How it works, For students, For educators; Sign in; Create a student account.
2. Hero: Give your first research a clear place to begin. Explain early research, lecturer feedback, version history, and the path toward publication. Use an abstract research/version illustration, not generic stock photography.
3. Why start with a preprint: preserve the first version, receive lecturer feedback, and create a transparent research record.
4. How it works: prepare manuscript; submit; improve with feedback; publish after approval.
5. Academic integrity: version history, author ownership, transparent review, and the distinction between a preprint and a peer-reviewed or formally published article.
6. Role value: explain value for students, lecturers, and administrators without exposing protected workflows.
7. FAQ: what a preprint is, who can submit, how review works, and what happens after revisions.
8. Final CTA and footer: repeat registration and sign-in actions with concise trust language.

## Unified Repository and Route Architecture

The target structure is one Next.js application with explicit route namespaces:

~~~text
src/app/
├── page.tsx                  # public landing
├── register/
├── student/
│   ├── layout.tsx            # student shell and guard
│   └── my-preprints/
└── admin/
    ├── layout.tsx            # admin shell and guard
    ├── dashboard/
    ├── submissions/
    └── reviews/
~~~

Use separate PublicShell, StudentShell, and AdminShell compositions with one authentication/session boundary and shared design tokens. Middleware and server-side layouts enforce route policy. Navigation visibility is not a security boundary.

Role policy:

| Role | Allowed namespace | Capability boundary |
| --- | --- | --- |
| STUDENT | /student/** | Submit and manage owned preprints |
| RESEARCHER | /student/** | Use the student-facing submission workspace in MVP |
| LECTURER | /admin/** | Review and recommend decisions; cannot publish |
| ADMINISTRATOR | /admin/** | Final moderation and publish decision |

Unrecognized roles must be denied protected workspace access and routed to a safe unauthorized/sign-in state. An unauthorized protected request must not silently fall back to the public landing page.

## Design System Decisions

Use the SSO FE design system as the source of truth:

- Brand blue: #0071BC.
- New landing typography: Manrope.
- Cool paper background, white surfaces, generous whitespace, restrained borders, and editorial hierarchy.
- Semantic tokens and shared primitives instead of page-local raw values.
- Controls around 52px where appropriate; interactive targets at least 44px.
- Large-panel radius about 24px and control radius about 10px.
- Visible keyboard focus, sufficient contrast, purposeful motion, and reduced-motion support.
- English-facing copy for the first implementation to align with the referenced design system.

This supersedes the earlier Roboto preference for the new landing surface. Existing legacy screens may migrate incrementally.

## Scope Boundary

### In scope

- Public / landing page, navigation, CTAs, and explanatory content.
- Route namespace/layout boundaries and role policy documentation.
- Protected-route behavior and SSO CTA integration.
- Alignment with the SSO FE design system.
- Static educational content without fake public data.

### Out of scope

- Moving the existing User FE source and routes; that needs a separate migration plan.
- SSO rewrite, backend, or database changes.
- Public catalogue, real metrics, rankings, or featured research.
- Changes to academic/review/publication governance.
- Final Vietnamese translation and copy approval.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Registration CTA loses SSO return flow | Verify the existing SSO registration/login redirect contract and preserve the intended post-auth destination. |
| Role spoofing through URL/query input | Resolve role from trusted server-side session/user data. |
| Protected content leaks between namespaces | Enforce middleware/server-layout guards and fail-closed unauthorized handling. |
| Copy overclaims academic validation | State precisely that lecturers review and administrators decide publication; distinguish preprint from peer review. |
| Landing depends on unavailable public data | Use static educational content until approved records exist. |
| Design drift | Reuse semantic tokens/shared primitives and review against the SSO design-system document. |

## Acceptance Criteria

- An unauthenticated visitor understands the product purpose within the first viewport.
- The primary registration CTA is visible without scrolling.
- The four-step journey is clear: prepare, submit, improve, publish after approval.
- The page distinguishes preprint, lecturer review, and final publication.
- Student and admin route namespaces are structurally separate.
- Lecturers can review but cannot publish; administrators can make the final publish decision.
- The page works at 375px, tablet, and desktop widths without horizontal overflow.
- Typography, color, spacing, focus, and reduced-motion behavior follow the SSO FE design system.
- No fabricated statistics, featured papers, rankings, or approval claims appear.

## Next Steps

1. Create an implementation plan for the landing page in the unified Admin FE repository.
2. Create a separate migration plan for bringing existing User FE routes/components into it.
3. Confirm SSO registration redirect and the trusted source for role assignment.
4. Implement the landing page with real SSO CTAs and static explanatory content.
5. Migrate User FE routes under /student/** after landing acceptance.
