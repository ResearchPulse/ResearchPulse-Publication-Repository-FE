---
phase: 1
title: "Foundation and Contracts"
status: pending
priority: P1
effort: "1-2d"
dependencies: []
---

# Phase 1: Foundation and Contracts

## Overview

Bootstrap both Next.js repositories and lock shared integration contracts before feature UI work.

## Requirements

- Create TypeScript Next.js App Router baseline in Admin_FE and User_FE.
- Define environment variables for SSO and Preprint BE.
- Register two SSO clients with callback/logout URLs.
- Use server-side Next.js BFF with PKCE. Never expose `client_secret` in browser code.
- Define callback `state`, `nonce`, `code_verifier`, token/session storage, and failure handling.
- Resolve role through Main User API after validating SSO identity. Do not infer role from UI route.
- Define API response, error, pagination, status, and role types.
- Lock Preprint BE endpoint paths and response envelopes before feature UI work.
- Add route protection and session hydration using SSO.

## Architecture

Each app owns its API client and route guards. Both clients use `credentials: include` for SSO calls. OIDC code exchange runs in a server-side Next.js BFF. The BFF stores session state in HttpOnly cookies and calls Main User API for role resolution. Frontend authorization controls navigation; Preprint BE remains final authority.

## Related Code Files

- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\package.json`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\layout.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\lib\auth-client.ts`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\auth\callback\route.ts` as the BFF callback handler.
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\lib\preprint-api.ts`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\package.json`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\layout.tsx`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\lib\auth-client.ts`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\auth\callback\route.ts` as the BFF callback handler.
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\lib\preprint-api.ts`
- Modify: SSO client registry and CORS configuration in `E:\SSO_BE`

## Implementation Steps

1. Scaffold both apps with the same Next.js and TypeScript baseline.
2. Add shared environment variable names and local `.env.example` files.
3. Register BFF-backed client IDs, redirect URIs, and post-logout URIs.
4. Implement `state`, `nonce`, `code_verifier`, callback, `me`, logout, session-expired, and forbidden states.
5. Implement Main User API role lookup and shared API types for preprints, versions, reviews, assignments, and pagination.
6. Confirm Preprint BE paths, presigned upload contract, and response envelopes against the backend implementation.

## Success Criteria

- [ ] Both apps build from clean install.
- [ ] Unauthenticated user reaches SSO login.
- [ ] Authenticated user loads `/api/v1/auth/me` successfully.
- [ ] Role mismatch redirects to a clear forbidden page.
- [ ] API client handles 401, 403, validation, and network errors.
- [ ] No client bundle contains an SSO client secret or storage credential.
- [ ] Role source and callback flow are documented and tested.
- [ ] Client-side code has no token exchange or Main User API secret.

## Risk Assessment

SSO cookie policy or CORS can block local integration. Test two localhost origins early. Keep secrets server-side; expose only public URLs and client IDs.
