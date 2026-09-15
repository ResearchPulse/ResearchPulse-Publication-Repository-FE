---
phase: 2
title: "Shared Design System"
status: pending
priority: P1
effort: "1-2d"
dependencies: [1]
---

# Phase 2: Shared Design System

## Overview

Create Hyperlabdata visual foundations and reusable UI primitives consumed by both apps, while keeping User/Admin layouts independent.

## Requirements

- Primary color `#0071BC`.
- Roboto typography.
- Shared tokens for color, spacing, radius, typography, focus, status, and motion.
- Accessible controls with visible focus and reduced-motion support.
- Upload, status badge, table, modal, toast, empty, loading, error, and pagination primitives.

## Architecture

Use `@hyperlabdata/ui` as a separate package repository. Publish a versioned package or consume a pinned Git revision. Do not fork components into both repos.

## Related Code Files

- Create: shared `@hyperlabdata/ui` package token and component files.
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_Admin_FE\src\app\globals.css`
- Create: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_User_FE\src\app\globals.css`
- Create: app-specific shell and navigation layouts in both repos.

## Implementation Steps

1. Create the shared package repository and define ownership, package versioning, and install method.
2. Define token contract from the approved frontend spec.
3. Implement primitives with keyboard and screen-reader behavior.
4. Add User shell: compact top navigation, workspace content, status timeline.
5. Add Admin shell: sidebar, top bar, content frame, responsive table area.
6. Verify both apps render identical tokens and component states.

## Success Criteria

- [ ] Both apps use same primary color, font, status palette, and control states.
- [ ] Shared components have loading, error, disabled, and focus states.
- [ ] Mobile layout has no horizontal overflow.
- [ ] Reduced-motion preference is respected.
- [ ] Component usage requires no app-specific fork.
- [ ] Shared package location, ownership, versioning, and install method are documented.

## Risk Assessment

A third package adds release overhead. Mitigate by keeping package scope small: tokens and primitives only. Keep business screens in each app.
