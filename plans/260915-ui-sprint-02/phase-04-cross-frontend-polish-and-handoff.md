---
phase: 4
title: "Cross-frontend Polish and Handoff"
status: pending
priority: P2
effort: "0.5-1d"
dependencies: [2, 3]
---

# Phase 4: Cross-frontend Polish and Handoff

## Overview

Perform a UI-only consistency sweep and prepare the mock-to-real API handoff.

## Requirements

- Check tokens, typography, spacing, responsive behavior, focus states, empty/error language, and status labels in both apps.
- Check PDF preview/download at desktop and narrow widths.
- Record the real API seams, including authorized file URL, expiry, retry, and download behavior.
- Run existing frontend build commands as readiness checks; do not expand into unrelated test scope.

## Architecture

Keep the handoff at the adapter boundary: pages consume domain data/capabilities; the future API adapter handles authenticated requests and file URL refresh.

## Related Code Files

- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\README.md` or frontend docs
- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\README.md` or frontend docs
- Review: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Shared_UI\src\styles.css`

## Implementation Steps

1. Run a manual route/state sweep against acceptance scenarios.
2. Fix only consistency/accessibility issues found.
3. Document real API replacement points and PDF authorization assumptions.
4. Run existing frontend builds and record results.

## Success Criteria

- [ ] Both apps share visual language but retain distinct layouts/navigation.
- [ ] Core loading/empty/error/success states exist for both workflows.
- [ ] PDF fallback behavior is documented for backend integration.
- [ ] Build readiness is recorded for affected frontend/package repos.

## Risk Assessment

Keep this phase limited to UI consistency, accessibility basics, documentation, and build readiness; defer real integration and E2E testing to the parent plan.
