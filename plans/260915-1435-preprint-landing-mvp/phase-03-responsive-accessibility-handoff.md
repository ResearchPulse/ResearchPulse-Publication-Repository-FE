---
phase: 3
title: "Perform responsive and accessibility handoff"
status: completed
priority: P1
effort: "0.5-1d"
dependencies: [1, 2]
---

# Phase 3: Perform responsive and accessibility handoff

## Overview

Review the completed landing page at representative viewport sizes and interaction modes, then hand off a buildable MVP to the implementation agent. This phase is validation and small corrective styling only; it does not expand the feature scope.

## Requirements

- Functional: primary and secondary CTAs work from header, hero, and final CTA.
- Functional: section anchors and FAQ are usable with keyboard and touch.
- Non-functional: no horizontal overflow at 375px, tablet, or desktop widths.
- Non-functional: focus is visible, text remains readable, and reduced motion is honored.
- Non-functional: `npm run build` passes.

## Architecture

Validation follows the public-only flow:

```text
Anonymous browser
  -> /
  -> /register -> configured SSO FE registration
  -> /api/auth/login -> OIDC redirect
```

No live Preprint BE or Preprint DB data is needed for this phase.

## Related Code Files

- Validate: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/page.tsx`.
- Validate: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/components/public-preprint-landing.tsx`.
- Validate: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/components/public-research-illustration.tsx`.
- Validate: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/register/page.tsx`.
- Validate: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/globals.css`.
- Validate: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_Admin_FE/src/app/layout.tsx`.

## Implementation Steps

1. Run `npm run build` from the Admin FE repository.
2. Start the app locally and open `/` at desktop width.
3. Check 375px mobile, tablet, and desktop widths for overflow, clipped content, and CTA reachability.
4. Navigate through every header/hero/footer CTA and every section anchor.
5. Use keyboard-only navigation to confirm logical tab order, visible focus, and native FAQ operation.
6. Emulate reduced motion and confirm nonessential animations are disabled.
7. Confirm the page has no calls to private Preprint API routes and no fake dynamic metrics.
8. If a small CSS/content correction is needed, keep it in the owning phase file set and do not start User FE migration.

## Success Criteria

- [x] Build completes successfully.
- [x] First viewport communicates purpose and exposes registration CTA.
- [x] Landing remains usable at 375px, tablet, and desktop.
- [x] No horizontal scroll or inaccessible interactive control.
- [x] Focus and reduced-motion checks pass.
- [x] `/register` and `/api/auth/login` point to the intended auth entry points.
- [x] Handoff notes clearly state that route migration and role guards are separate work.

## Risk Assessment

The highest handoff risk is treating a visually complete landing page as proof that protected route authorization is complete. Record that distinction explicitly. This phase must not approve publication workflow claims or expose legacy admin pages as the final `/admin/**` design.

## Security Considerations

Manual checks must include direct navigation to the public root only. Do not use mock role query parameters to simulate access. Role enforcement belongs to the future unified workspace plan and the backend authorization layer.

## Next Steps

Return the plan path to the implementation agent. After landing acceptance, create and review the separate User FE migration and role-guard plan.
