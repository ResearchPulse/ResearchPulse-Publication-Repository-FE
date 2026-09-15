# Hyperlabdata Preprint Frontend

Unified Next.js frontend for the Hyperlabdata Preprint student and admin workspaces.

## Run locally

```bash
npm ci
npm run dev
```

The app runs on `http://localhost:3003`.

The reusable design system is included in this repository as `@hyperdata/design-system` at `packages/design-system`; no sibling UI checkout is required.

Import components from the package entrypoint and its stylesheet entrypoint:

```tsx
import { Button, Panel } from '@hyperdata/design-system';
import '@hyperdata/design-system/styles.css';
```
