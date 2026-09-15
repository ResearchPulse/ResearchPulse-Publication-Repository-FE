---
phase: 1
title: "Build public Academic Gateway landing"
status: completed
priority: P1
effort: "1d"
dependencies: []
---

# Phase 1: Build public Academic Gateway landing

## Overview

Replace the root redirect with a public, server-rendered Academic Gateway page. Keep page-specific markup and styles local to Admin FE while reusing the shared Hyperlabdata brand mark and semantic color variables.

## Requirements

- Functional: unauthenticated visitors can understand the product, preprint value, and student journey at `/`.
- Functional: primary CTA links to `/register`; secondary sign-in CTA links to `/api/auth/login`.
- Functional: all public navigation links target sections on the page or public auth entry points.
- Functional: FAQ is keyboard-usable without a client-side component.
- Non-functional: no private API calls, fake metrics, paper records, rankings, or protected workspace content.
- Non-functional: use semantic HTML, visible focus states, responsive layout, and landing-scoped CSS selectors.

## Architecture

Use a server component composition:

```text
src/app/page.tsx
  -> src/components/public-preprint-landing.tsx
       -> src/components/public-research-illustration.tsx
       -> @hyperlabdata/ui BrandMark
```

Suggested sections:

1. Header with brand, section anchors, Sign in, and Create a student account.
2. Hero with the approved headline, explanatory copy, registration/sign-in actions, and inline research/version illustration.
3. Why start with a preprint: preserve first version, receive lecturer feedback, keep a transparent research record.
4. How it works: prepare manuscript, submit, improve with feedback, publish after approval.
5. Academic integrity: version history, author ownership, transparent review, and distinction between preprint and formal publication.
6. Role value for students, lecturers, and administrators.
7. FAQ using `details` and `summary`.
8. Final registration CTA and footer.

The illustration should be a small inline SVG or CSS composition showing a manuscript, version marker, and review path. It must be decorative with an accessible hidden label or adjacent explanatory text; do not add a binary asset or stock image.

## Related Code Files

- Modify: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/page.tsx` — render the landing component.
- Create: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/components/public-preprint-landing.tsx` — page structure, copy, links, and FAQ.
- Create: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/components/public-research-illustration.tsx` — inline SVG illustration.
- Modify: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/globals.css` — landing-scoped tokens, sections, buttons, illustration, responsive rules, and reduced-motion behavior.
- Reuse: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Shared_UI/src/index.tsx` — `BrandMark` only.

## Implementation Steps

1. Replace the `redirect('/dashboard')` implementation in `src/app/page.tsx` with the public landing component.
2. Build the component as a server component with stable section IDs: `how-it-works`, `why-preprint`, `integrity`, `roles`, and `faq`.
3. Use sentence-case English copy. Avoid saying a preprint is peer reviewed or formally published. Say that lecturers provide review/feedback and administrators decide publication.
4. Render navigation CTAs as links. Use `/register` for account creation and `/api/auth/login` for sign-in.
5. Use `BrandMark` with a clear accessible label. Add a mobile menu only if needed; prefer a simple responsive anchor list for MVP.
6. Add a decorative inline illustration with no external request and no storage/public-file dependency.
7. Add landing-scoped CSS rather than changing selectors used by `.admin-frame`, `.topbar`, `.content`, or legacy dashboard tables.
8. Map colors, spacing, radius, and focus styles to existing/shared variables where possible. Add only the missing landing aliases.
9. Add responsive rules for mobile, tablet, and desktop. Ensure hero layout stacks before content becomes cramped and prevent horizontal overflow.
10. Add a reduced-motion media rule that disables nonessential transform/opacity transitions.

## Success Criteria

- [x] `/` renders without authentication and without a private API request.
- [x] First viewport contains a clear value proposition and registration CTA.
- [x] Four-step workflow and preprint/review/publication distinction are understandable.
- [x] FAQ opens and closes with keyboard controls.
- [x] No fake statistics, featured papers, rankings, or unsupported claims.
- [x] Legacy admin CSS selectors are not renamed or behaviorally changed.

## Risk Assessment

The main risk is visual CSS collision with the current one-file legacy stylesheet. Scope every new selector under a unique landing root such as `.public-landing` and preserve existing admin selectors. Avoid wrapping navigation links around shared `Button` elements because that creates nested interactive elements.

## Security Considerations

The public page must not call `/api/v1/admin/*`, expose file URLs, render private submission data, or make role-based claims about the current visitor. The presence of a Sign in link does not itself create authorization.

## Next Steps

Phase 2 wires the registration redirect and updates page metadata/configuration.
