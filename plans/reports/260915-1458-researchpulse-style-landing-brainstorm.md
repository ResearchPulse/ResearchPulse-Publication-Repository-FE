---
title: "Hyperdata Lab Preprint Landing - ResearchPulse Style Redesign"
status: approved
version: 0.1.0
date: 2026-09-15
scope: "Admin_FE Public Landing Page: Centered Hero, Layered App Showcase Mockup, 3 Bento Features"
---

# Hyperdata Lab Preprint Landing - ResearchPulse Style Redesign

## Problem Statement & Objective

The user preferred the visual composition of the modern academic discovery platform (ResearchPulse) over the previous split 2-column layout. Specifically:
- A centered, high-impact Hero layout with a pill badge and clear value proposition.
- Prominent primary and secondary action CTAs without a search bar (search bar omitted as requested).
- A rich, layered **Preprint Portal App Showcase** mockup featuring an authentic preview of the manuscript review workspace with floating status & versioning cards.
- A 3-column **Bento Features** row directly below the showcase.
- 100% adherence to `hyperdata-lab-design-system.md` (Manrope font, `#0071bc` brand color, cool paper `#f7f9fa` background, `#122331` ink, 24px panel radius, and right-to-left link underline animations).

## Evaluated Approaches

1. **Approach A: Static SVG/Image Mockup**
   - *Pros*: Quick to render as a single asset.
   - *Cons*: Loses crispness on high-DPI/Retina screens, cannot dynamically adapt or stack gracefully on mobile screens, harder to maintain.

2. **Approach B: Semantic HTML/CSS Layered Mockup (Selected & Approved)**
   - *Pros*: Razor-sharp native typography, scales fluidly across viewports (mobile, tablet, desktop), zero external asset overhead, directly consumes the design system tokens (`--ds-blue-600`, `--ds-radius-panel`, etc.).
   - *Cons*: Requires precise CSS positioning and responsive media query tuning.

## Agreed Architecture & Changes

1. **New Component `src/components/public-portal-showcase.tsx`**:
   - Encapsulates the layered app mockup:
     - Ambient background glow (`radial-gradient`).
     - Main window: App header with logo, title, avatar, mini sidebar, and list of realistic student manuscript records with status badges (`Approved`, `Under Review`).
     - Floating Card Left: Version Timeline (`v1.0` → `v2.0` with feedback indicator).
     - Floating Card Right Top: Editorial Review Status distribution.
     - Floating Card Right Bottom: Publication Readiness Milestone.
   - Responsive behavior: On mobile (<= 768px), floating cards stack naturally without horizontal overflow.

2. **Update Component `src/components/public-preprint-landing.tsx`**:
   - Refactor Hero from a 2-column layout into a centered hero architecture.
   - Top centered pill: `🎓 A transparent pathway for student research`.
   - Centered headline: `Give your research a clear place to begin.`
   - Centered CTA button cluster: `Create a student account` (`/register`) and `Sign in with SSO` (`/api/auth/login`).
   - Insert `<PublicPortalShowcase />`.
   - Insert the 3 Bento Feature cards: `Prepare & Timestamp`, `Structured Mentorship`, `Academic Governance`.
   - Retain and align existing sections (`#why-preprint`, `#how-it-works`, `#integrity`, `#roles`, `#faq`, final CTA, footer).

3. **Update Styles `src/app/globals.css`**:
   - Add styling rules for `.pl-hero--centered`, `.pl-pill-badge`, `.pl-showcase-*`, `.pl-floating-card`, and `.pl-bento-*`.
   - Strictly scoped under `.public-landing`.
