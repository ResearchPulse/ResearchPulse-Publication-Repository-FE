---
phase: 2
title: "Wire SSO entry points and page metadata"
status: completed
priority: P1
effort: "0.5d"
dependencies: [1]
---

# Phase 2: Wire SSO entry points and page metadata

## Overview

Make the landing CTAs operational with the existing OIDC login BFF and the SSO FE registration page. Keep redirect destinations configuration-driven and avoid introducing a user-controlled redirect parameter.

## Requirements

- Functional: `/register` redirects to the configured SSO FE `/register` route.
- Functional: Sign in continues to use the existing same-origin `/api/auth/login` flow.
- Functional: root metadata identifies Hyperlabdata Preprint and the document language matches the English MVP copy.
- Non-functional: SSO web origin is explicit in `.env.example` and production deployment configuration.
- Non-functional: registration redirect cannot be changed through URL query input.

## Architecture

```text
Landing /register link
  -> Admin FE src/app/register/page.tsx
      -> redirect(configured SSO_WEB_URL + /register)

Landing Sign in link
  -> Admin FE /api/auth/login
      -> OIDC authorization
      -> existing Admin FE callback
```

Do not change the OIDC protocol implementation in this phase. Do not add a second login implementation. The existing callback currently returns to the legacy `/dashboard`; the future unified-workspace migration must replace that with role-aware routing after the trusted role source is agreed.

## Related Code Files

- Create: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/register/page.tsx` — server redirect to SSO FE.
- Modify: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/layout.tsx` — title, description, and `lang` value.
- Modify: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/.env.example` — document `NEXT_PUBLIC_SSO_WEB_URL` or the chosen server-safe equivalent.
- Reuse: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/api/auth/login/route.ts` — no code change expected.
- Reuse: `E:/SSO_FE/src/app/register/page.jsx` — destination contract.

## Implementation Steps

1. Add the registration page as a server component using Next.js `redirect`.
2. Read the SSO FE web origin from a documented environment variable. Prefer a server-only `SSO_WEB_URL`; if deployment conventions require a public variable, use a fixed configured value and never append arbitrary user input.
3. Normalize the configured origin before appending `/register`; reject malformed configuration at runtime with a clear server error rather than falling back to an untrusted URL.
4. Keep the landing link as `/register`, so the page does not hardcode an environment-specific SSO host.
5. Update root metadata to `Hyperlabdata Preprint` and a concise public description. Set document language to `en` for the approved English copy.
6. Keep the existing `/api/auth/login` link and verify the login route still builds the existing OIDC callback URL.
7. Document the local default, for example `SSO_WEB_URL=http://localhost:3000`, in `.env.example` without committing secrets.

## Success Criteria

- [x] `/register` reaches SSO FE `/register` in local configuration.
- [x] `/register?next=https://attacker.example` does not redirect to the supplied value.
- [x] Sign in points to `/api/auth/login` and does not expose tokens to the browser URL.
- [x] Page title and description describe the preprint product.
- [x] No client-side auth state or localStorage token is added.

## Risk Assessment

The SSO FE and Admin FE may run on different origins in development and production. Treat the SSO web origin and SSO API origin as separate configuration values. Coordinate the final hostname and CORS/cookie settings with the SSO owner; do not silently substitute an API origin for the web origin.

## Security Considerations

A registration redirect is safe only when its destination comes from trusted deployment configuration. Do not accept `next`, `returnTo`, or callback URLs from the landing page query string. Existing OIDC state, nonce, verifier, and cookie handling remain the security boundary for sign-in.

## Next Steps

Phase 3 performs the manual visual, accessibility, and build handoff checks.
