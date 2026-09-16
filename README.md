# Hyperlabdata Public Repository Frontend

Next.js frontend for the public landing page, student preprint workspace, and lecturer/admin review workspace.

This repository is `ScienceJournalTrendingVN_Public_FE`: the public landing page, student submission workspace, and lecturer/admin review workspace.

## Run locally

```bash
npm ci
npm run dev
```

The app runs on `http://localhost:3003`.

Preprint business APIs are not implemented in `ScienceJournalTrendingVN_Public_BE` yet. Set `PREPRINT_API_ENABLED=true` only after those endpoints are available; otherwise the student workspace intentionally shows an API-pending state and never fakes persistence.

The reusable design system is included in this repository as `@hyperdata/design-system` at `packages/design-system`; no sibling UI checkout is required.

Import components from the package entrypoint and its stylesheet entrypoint:

```tsx
import { Button, Panel } from '@hyperdata/design-system';
import '@hyperdata/design-system/styles.css';
```
