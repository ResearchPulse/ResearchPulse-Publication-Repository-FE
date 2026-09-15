# Hyperdata Design System

Reusable React components and CSS tokens for Hyperdata products.

## Usage

```tsx
import { Button, Panel, StatusBadge } from '@hyperdata/design-system';
import '@hyperdata/design-system/styles.css';
```

## Structure

```text
src/
  components/       React primitives and compound UI pieces
  styles/
    tokens/         primitives -> semantic -> component tokens
    components/     component-level styles
    base.css        package reset and shared base rules
    index.css       CSS composition entrypoint
  index.tsx         public component and type exports
  styles.css        public stylesheet export
```

Components consume semantic or component tokens. Product-specific layouts and page styles stay in the consuming app.
