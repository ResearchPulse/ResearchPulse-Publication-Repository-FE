---
title: "Implement Hyperlabdata Preprint Landing MVP"
description: "Build a public Academic Gateway landing page in Admin FE with SSO CTAs and responsive shared-brand styling."
status: completed
priority: P1
effort: "2-3d"
branch: master
tags: [feature, frontend, auth]
blockedBy: []
blocks: []
created: 2026-09-15
---

# Implement Hyperlabdata Preprint Landing MVP

## Overview

Build the public Hyperlabdata Preprint landing page at the root of the Admin FE repository. Use the approved Academic Gateway direction: explain preprints and the student journey, then send visitors to SSO sign-up or the existing login BFF route.

This plan follows the approved brainstorm report at `../reports/260915-1426-unified-preprint-landing-brainstorm.md`. It is intentionally landing-first. It does not migrate the existing User FE source or implement the complete `/student/**` and `/admin/**` workspace migration.

## Scope Challenge

- Existing code: root currently redirects to `/dashboard`; legacy admin pages use `AdminSidebar` and global `globals.css`; `@hyperlabdata/ui` already exports `BrandMark`, `Button`, `Panel`, and shared CSS tokens; OIDC login is already available at `/api/auth/login`; SSO FE exposes `/register`.
- Minimum change set: replace the public root redirect with a server-rendered landing page, add landing-scoped styles and inline illustration, add a safe `/register` redirect to SSO FE, and update metadata/environment documentation.
- Deferred: User FE migration, complete role resolver, `/student/**` and `/admin/**` route migration, public preprint catalogue, real metrics, backend/DB changes, and Vietnamese translation.
- Complexity: 3 sequential phases, approximately 6 source/config files touched or created, no new service or state-management abstraction.

## Cross-Plan Dependencies

| Relationship | Plan | Status |
| --- | --- | --- |
| Superseded assumptions | `../260914-1556-preprint-frontends/plan.md` | Pending, older separate-repository architecture |
| Superseded assumptions | `../260915-ui-sprint-02/plan.md` | Pending, paused UI sprint with separate-repository/Roboto assumptions |
| Input | `../reports/260915-1426-unified-preprint-landing-brainstorm.md` | Approved |

The two older implementation plans must not be cooked for this feature until their repository and typography assumptions are refreshed. This plan does not modify those paused plans.

## Approved Technical Design

### User flow

```text
Visitor opens /
  ├── Create a student account -> /register -> configured SSO FE /register
  └── Sign in -> /api/auth/login -> existing OIDC callback -> legacy dashboard until workspace migration
```

The landing page is public and contains no preprint records, private URLs, fabricated statistics, or role-specific workspace data. Use semantic HTML and native `details` elements for FAQ so the page remains a server component without client state.

### Component structure

```text
RootLayout
  PublicLandingPage
    Header
    Hero + ResearchIllustration
    PreprintValueSection
    HowItWorksSection
    IntegritySection
    RoleValueSection
    FAQSection
    FinalCTA + Footer
```

Use `BrandMark` from `@hyperlabdata/ui`. Use link elements styled as landing buttons for navigation; do not nest a Link around a button. Keep workflow-specific landing markup local to Admin FE.

### Route and auth boundary

- `/` is public and must render without calling protected APIs.
- `/register` is a public server redirect to a configured SSO FE origin. The destination is configuration-only, not user-controlled, so the route cannot become an open redirect.
- Sign-in uses the existing same-origin `/api/auth/login` BFF endpoint.
- Do not infer or accept roles from query parameters in landing code.
- Full role-aware guards and `/student/**` plus `/admin/**` migration are a separate implementation plan. Existing legacy admin routes remain outside this plan and must not be presented as the completed new route architecture.

### Visual contract

- Brand primary: `#0071BC`, consumed through existing/shared semantic tokens.
- New landing typography: Manrope, matching the SSO FE design system. Keep existing legacy admin styling stable where possible.
- Cool paper page background, white surfaces, generous whitespace, restrained borders, editorial hierarchy.
- Large panels approximately 24px radius; controls approximately 10px radius; interactive targets at least 44px.
- Visible focus states, 4.5:1 normal-text contrast target, purposeful motion, and a reduced-motion override.
- English copy for the first implementation.
- No gradients, stock photography, public counts, rankings, fake featured papers, or unsupported academic claims.

## Phases

| Phase | Name | Status | Dependencies |
| --- | --- | --- | --- |
| 1 | [Build public Academic Gateway landing](./phase-01-public-academic-gateway.md) | Completed | None |
| 2 | [Wire SSO entry points and page metadata](./phase-02-sso-entry-points.md) | Completed | Phase 1 |
| 3 | [Perform responsive and accessibility handoff](./phase-03-responsive-accessibility-handoff.md) | Completed | Phases 1-2 |

## File Ownership

| File | Owner phase | Action |
| --- | --- | --- |
| `src/app/page.tsx` | Phase 1 | Modify root from redirect to landing render |
| `src/components/public-preprint-landing.tsx` | Phase 1 | Create page composition and content |
| `src/components/public-research-illustration.tsx` | Phase 1 | Create accessible inline SVG illustration |
| `src/app/globals.css` | Phase 1 | Modify with landing-scoped tokens/layout/responsive rules |
| `src/app/register/page.tsx` | Phase 2 | Create safe redirect to SSO FE registration |
| `src/app/layout.tsx` | Phase 2 | Modify metadata and document language |
| `.env.example` | Phase 2 | Modify with SSO FE web-origin configuration |

## Dependencies

- Existing shared package `@hyperlabdata/ui` at `../ScienceJournalTrendingVN_Shared_UI`.
- Existing OIDC login BFF at `src/app/api/auth/login/route.ts`.
- SSO FE registration route at `/register`.
- Runtime configuration for the SSO FE web origin, for example `NEXT_PUBLIC_SSO_WEB_URL=http://localhost:3000`.
- Approved brainstorm report and SSO FE design system.

## Validation Strategy

- No new automated test suite is required for this landing-only MVP.
- Run `npm run build` after implementation.
- Run the app locally and manually check `/`, `/register`, `/api/auth/login`, anchor navigation, keyboard focus, reduced motion, and 375px/tablet/desktop layouts.
- Confirm no landing path fetches private preprint data and no primary CTA points directly to an unprotected admin workspace.

## Definition of Done

- [x] Root `/` renders the approved Academic Gateway landing page instead of redirecting to dashboard.
- [x] Student registration and sign-in CTAs point to the intended SSO entry points.
- [x] Landing content explains preprint value, four-step workflow, review distinction, and role value.
- [x] Page uses shared Hyperlabdata brand primitives and landing-scoped design tokens.
- [x] Mobile layout has no horizontal overflow and keeps the primary CTA accessible.
- [x] Existing legacy admin pages continue to compile without being silently rewritten.
- [x] `npm run build` passes.

## Follow-up Plan

Create a separate plan for migrating User FE into this repository and enforcing the final route policy: STUDENT under `/student/**`, LECTURER/ADMIN under `/admin/**`, with trusted server-side role resolution and admin-only publication.
