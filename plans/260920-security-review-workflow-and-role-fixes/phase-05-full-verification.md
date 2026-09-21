---
phase: 5
title: "End-to-End Test & Verification Suite"
status: pending
priority: P1
effort: "1h"
dependencies: [1, 2, 3, 4]
---

# Phase 5: End-to-End Test & Verification Suite

## Overview
Execute comprehensive automated test suites across both backend and frontend workspaces to verify type safety, security assertions, and build integrity.

## Verification Checklist
- [ ] Backend Typecheck: `npm run typecheck` in `ScienceJournalTrendingVN_Public_BE` (0 errors).
- [ ] Backend Test Suite: `npm run test` in `ScienceJournalTrendingVN_Public_BE` (all suites green).
- [ ] Frontend Typecheck: `npx tsc --noEmit` in `ScienceJournalTrendingVN_Admin_FE` (0 errors).
- [ ] Frontend Production Build: `npm run build` in `ScienceJournalTrendingVN_Admin_FE` (all 22 routes compile).
- [ ] Live Scenario Verification:
  - Lecturer upload & submit test.
  - Review re-assignment committee replacement test.
  - Revision auto-carryover test.
  - Audience visibility restriction test.
  - Unauthorized draft download/deletion test.
