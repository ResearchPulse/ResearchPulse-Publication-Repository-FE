---
phase: 5
title: "Integration and Release Validation"
status: pending
priority: P1
effort: "1-2d"
dependencies: [3, 4]
---

# Phase 5: Integration and Release Validation

## Overview

Validate SSO, API integration, responsive behavior, security boundaries, and the full preprint lifecycle across both apps.

## Requirements

- Local and production-like environment variables documented.
- SSO CORS, cookie, redirect, and logout behavior verified.
- Local origin matrix uses SSO_FE `3000`, User_FE `3002`, Admin_FE `3003`, and Preprint_BE `5002`; staging/production origins are documented before deployment.
- Main User API role lookup verified for every protected route.
- User/Admin role matrix tested.
- Full workflow tested: submit → assign → review → revision → resubmit → approve → publish.
- Build, lint, unit, integration, and critical E2E checks pass.

## Architecture

Use independent deployment for both Next.js apps. Keep API base URLs and SSO URLs environment-driven. Use public preprint endpoints only for `PUBLISHED` records.

## Related Code Files

- Create: test files in both repos matching chosen test runner.
- Create: `.env.example` in both repos.
- Modify: deployment and CORS configuration as needed.
- Modify: API contract documentation if integration reveals mismatch.

## Implementation Steps

1. Configure the fixed local port matrix, then staging/production SSO client origins, cookie policy, and Preprint BE CORS.
2. Test PKCE/BFF callback, session hydration, logout, expiry, Main User API role lookup, and forbidden routes.
3. Seed representative preprint states for both apps.
4. Run critical user and admin workflow tests.
5. Test failed upload, stale update, duplicate review, and unauthorized access.
6. Run responsive/accessibility checks on primary screens.
7. Run clean-install build and document deployment commands.

## Success Criteria

- [ ] SSO works in both apps.
- [ ] Full lifecycle passes with real API.
- [ ] Cross-user and cross-role access is denied.
- [ ] Failed network/upload states are recoverable.
- [ ] No secrets ship to client bundles.
- [ ] No storage credential or private file URL bypass ships to client bundles.
- [ ] Production builds pass for both repos.

## Risk Assessment

Environment differences can hide cookie/CORS failures. Validate using production-like hostnames before release. Keep rollback simple: deploy frontend versions independently and preserve API backward compatibility.
