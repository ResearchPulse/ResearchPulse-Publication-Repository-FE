---
phase: 1
title: "Shared UI and Mock Contract"
status: pending
priority: P1
effort: "0.5-1d"
dependencies: []
---

# Phase 1: Shared UI and Mock Contract

## Overview

Lock the smallest shared visual foundation and typed mock contract needed by both frontends.

## Requirements

- Confirm blue `#0071BC`, neutrals, semantic status colors, Roboto, spacing, borders, radii, shadows, and focus rings.
- Reuse/extend `BrandMark`, `Button`, `Panel`, `Field`, `TextInput`, `StatusBadge`, `EmptyState`, `ProgressBar`, and loading/error states.
- Define shared types for preprint summary/detail, author, version, review, assignment, and file descriptor.
- Define one status metadata map for labels, tones, and allowed actions.
- Add deterministic fixtures for draft, submitted, revision-requested, and approved papers plus PDF loading/ready/expired/unsupported/unavailable states.

## Architecture

Shared UI remains presentational and framework-agnostic. Mock services stay in the consuming repos; shared components do not own auth, storage, or backend fetch logic.

## Related Code Files

- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Shared_UI\src\index.tsx`
- Modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Shared_UI\src\styles.css`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\lib\preprint-mock.ts`
- Create/modify: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\lib\preprint-mock.ts`

## Implementation Steps

1. Compare current shared components with the approved brainstorm.
2. Add only missing primitives/states.
3. Define the file/version fixture shape and status/action map.
4. Add the mock adapter boundary for later API replacement.

## Success Criteria

- [ ] Both repos render the same status and file descriptor shapes.
- [ ] Shared components have keyboard focus and readable contrast states.
- [ ] Fixtures cover happy path and PDF-preview failures.

## Risk Assessment

Avoid over-generalizing the package; prefer a small stable shared surface and local workflow composition.
