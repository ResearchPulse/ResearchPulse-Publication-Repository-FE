# Hyperdata Lab FE Design System

> A reusable visual and interaction system for focused, trustworthy web products.

**Scope:** authentication surfaces, account recovery, verification flows, and future product pages.

**Primary brand color:** `#0071bc`

**Design language:** quiet research-grade product UI, generous whitespace, cool paper surfaces, confident blue actions, and precise micro-interactions.

---

## 1. Design principles

### Clear before clever

Every screen should have one obvious next action. Labels are explicit, helper copy is short, and status messages explain what happened without exposing sensitive account information.

### Calm confidence

Use blue as a focused action color, not as decoration. Keep inactive surfaces neutral and let spacing, type scale, and alignment carry the hierarchy.

### One system, many products

Brand values live in primitives. Meaning lives in semantic tokens. Components consume semantic tokens only. A new website should be able to rebrand the system by changing the primitive layer.

### Motion with a job

Motion confirms interaction, reveals hierarchy, or communicates state. It never delays access to content or competes with the primary action.

---

## 2. Token architecture

The system uses three layers:

```text
Primitive tokens  ->  Semantic tokens  ->  Component tokens
raw values            purpose aliases      local component decisions
```

### 2.1 Primitive tokens

```css
:root {
  /* Brand palette */
  --ds-blue-700: #005f9e;
  --ds-blue-600: #0071bc;
  --ds-blue-100: #dbeef9;
  --ds-blue-50: #f0f7fc;

  /* Cool neutral palette */
  --ds-ink-900: #122331;
  --ds-slate-600: #647381;
  --ds-slate-400: #8b9aa4;
  --ds-slate-200: #dce4e9;
  --ds-slate-100: #e8eef2;
  --ds-paper-50: #f7f9fa;
  --ds-surface-0: oklch(1 0 0);

  /* Feedback */
  --ds-red-700: #b42318;
  --ds-red-100: #f2b8b5;
  --ds-red-50: #fff5f4;
  --ds-green-700: #176b36;
  --ds-green-100: #b7dfc5;
  --ds-green-50: #f2fbf5;

  /* Spacing. Base unit: 4px. */
  --ds-space-1: 4px;
  --ds-space-2: 8px;
  --ds-space-3: 12px;
  --ds-space-4: 16px;
  --ds-space-6: 24px;
  --ds-space-8: 32px;
  --ds-space-12: 48px;
  --ds-space-16: 64px;
  --ds-space-24: 96px;

  /* Shape */
  --ds-radius-control: 10px;
  --ds-radius-icon: 12px;
  --ds-radius-panel: 24px;
  --ds-radius-pill: 9999px;

  /* Typography */
  --ds-font-body: 'Manrope', 'Trebuchet MS', sans-serif;
  --ds-font-legacy: 'Inter', sans-serif;
  --ds-size-xs: 12px;
  --ds-size-sm: 13px;
  --ds-size-md: 16px;
  --ds-size-lg: 18px;
  --ds-size-xl: 24px;
  --ds-size-2xl: 32px;
  --ds-weight-regular: 400;
  --ds-weight-medium: 500;
  --ds-weight-semibold: 600;
  --ds-weight-bold: 700;

  /* Motion */
  --ds-duration-quick: 160ms;
  --ds-duration-state: 240ms;
  --ds-duration-layout: 360ms;
  --ds-duration-enter: 500ms;
  --ds-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ds-ease-soft: cubic-bezier(0.25, 1, 0.5, 1);
}
```

### 2.2 Semantic tokens

```css
:root {
  --color-page: var(--ds-paper-50);
  --color-surface: var(--ds-surface-0);
  --color-surface-soft: #f3f6f9;
  --color-surface-muted: #edf3f7;

  --color-text: var(--ds-ink-900);
  --color-text-muted: var(--ds-slate-600);
  --color-text-subtle: var(--ds-slate-400);
  --color-border: var(--ds-slate-200);

  --color-primary: var(--ds-blue-600);
  --color-primary-hover: var(--ds-blue-700);
  --color-primary-soft: var(--ds-blue-50);
  --color-on-primary: oklch(1 0 0);

  --color-error: var(--ds-red-700);
  --color-error-border: var(--ds-red-100);
  --color-error-surface: var(--ds-red-50);
  --color-success: var(--ds-green-700);
  --color-success-border: var(--ds-green-100);
  --color-success-surface: var(--ds-green-50);

  --focus-color: var(--color-primary);
  --focus-width: 2px;
  --focus-offset: 3px;
}
```

### 2.3 Component tokens

```css
:root {
  /* Auth frame */
  --auth-frame-max-width: 1270px;
  --auth-frame-radius: var(--ds-radius-panel);
  --auth-frame-shadow: 0 22px 60px oklch(0.12 0.02 250 / 0.18);
  --auth-brand-surface: oklch(0.97 0.012 245);

  /* Controls */
  --control-height: 52px;
  --control-height-compact: 48px;
  --control-radius: var(--ds-radius-control);
  --control-border: var(--color-border);
  --control-focus-border: var(--color-primary);
  --control-padding-x: var(--ds-space-4);

  /* Primary button */
  --button-primary-bg: var(--color-primary);
  --button-primary-bg-hover: var(--color-primary-hover);
  --button-primary-fg: var(--color-on-primary);
  --button-primary-shadow: 0 8px 18px color-mix(in srgb, var(--color-primary) 24%, transparent);

  /* Text link */
  --link-color: var(--color-primary);
  --link-hover-color: var(--color-primary-hover);
  --link-underline-duration: var(--ds-duration-layout);
}
```

---

## 3. Typography

### Font roles

| Role | Family | Use |
| --- | --- | --- |
| Product UI | Manrope | New auth and product surfaces |
| Legacy compatibility | Inter | Existing non-reference components only |

Use Manrope for new pages so the system feels coherent. Keep Inter only where an existing legacy surface still depends on it. Do not introduce a third family.

### Type scale

| Token | Size | Line height | Weight | Use |
| --- | ---: | ---: | ---: | --- |
| `--ds-size-xs` | 12px | 1.5 | 500 | Footer and legal copy |
| `--ds-size-sm` | 13px | 1.5 | 600 | Top links, helper text |
| `--ds-size-md` | 16px | 1.5 | 400 | Inputs and body copy |
| `--ds-size-lg` | 18px | 1.55 | 400 | Brand description |
| `--ds-size-xl` | 24px | 1.15 | 700 | Small headings |
| `--ds-size-2xl` | 32px | 1.15 | 700 | Auth headings |

### Copy rules

- Use sentence case for labels, buttons, and links.
- Use one clear verb for the primary action: `Sign in`, `Create account`, `Verify email`, `Reset password`.
- Keep supporting text below 25 words where possible.
- Use generic recovery copy: `If the email exists in our system...`.
- Never reveal whether a recovery email belongs to an account.
- Keep all user-facing copy in English for this product.

---

## 4. Layout

### Auth split screen

Desktop uses a 50/50 split frame centered inside a cool paper background.

```css
.auth-page {
  min-height: 100dvh;
  padding: clamp(16px, 3.2vw, 48px);
  background: radial-gradient(circle at 50% 28%, oklch(1 0 0) 0%, #f7f9fb 46%, #f3f6f9 100%);
}

.auth-frame {
  width: min(100%, var(--auth-frame-max-width));
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: hidden;
  border-radius: var(--auth-frame-radius);
  background: var(--color-surface);
  box-shadow: var(--auth-frame-shadow);
}
```

### Brand panel

- Surface: `--auth-brand-surface`.
- Content is left aligned.
- Logo sits at the top.
- Headline contains no more than three lines.
- Illustration reinforces the research and discovery theme.
- Copyright stays anchored near the bottom.

### Form panel

- Surface: `--color-surface`.
- Form width: 424px maximum for focused auth flows.
- Registration form may use up to 560px because it contains more fields.
- Top account navigation aligns to the right.
- Primary action spans the full form width.
- Footer links align to the right on desktop.

### Mobile rule

At `760px` and below, hide the brand panel completely. The form becomes the only visible surface and can grow vertically when content needs room.

```css
@media (max-width: 760px) {
  .auth-page {
    display: block;
    min-height: 100dvh;
    overflow-y: auto;
    padding: 12px;
  }

  .auth-frame {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 20px;
  }

  .brand-panel {
    display: none;
  }
}
```

---

## 5. Component specifications

### 5.1 Primary button

**Anatomy:** label, optional trailing icon, optional loading spinner.

| State | Background | Border | Transform |
| --- | --- | --- | --- |
| Default | `--button-primary-bg` | `--button-primary-bg` | none |
| Hover | `--button-primary-bg-hover` | `--button-primary-bg-hover` | `translateY(-1px)` |
| Active | `--button-primary-bg-hover` | `--button-primary-bg-hover` | `translateY(1px) scale(.99)` |
| Focus | default | default | visible focus outline |
| Disabled | muted surface | muted border | none |
| Loading | default | default | pointer input disabled |

```css
.primary-button {
  min-height: var(--control-height);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-3);
  border: 1px solid var(--button-primary-bg);
  border-radius: var(--control-radius);
  color: var(--button-primary-fg);
  background: var(--button-primary-bg);
  box-shadow: var(--button-primary-shadow);
  transition: transform var(--ds-duration-state) var(--ds-ease-out),
    background-color var(--ds-duration-state) var(--ds-ease-out),
    border-color var(--ds-duration-state) var(--ds-ease-out),
    box-shadow var(--ds-duration-state) var(--ds-ease-out);
}
```

### 5.2 Google button

- Default: white surface with neutral border.
- Hover: `#f8fafc` surface, default border unchanged.
- Active: slight press scale.
- No colored border on hover.
- Icon and label are centered as one unit.

### 5.3 Text input

| State | Border | Surface | Shadow |
| --- | --- | --- | --- |
| Default | `--color-border` | `--color-surface` | none |
| Hover | unchanged | unchanged | none |
| Focus | `--control-focus-border` | unchanged | none |
| Error | `--color-error-border` | `--color-error-surface` | none |
| Disabled | muted border | muted surface | none |

```css
.reference-input {
  width: 100%;
  min-height: var(--control-height);
  padding: 0 var(--control-padding-x);
  border: 1px solid var(--control-border);
  border-radius: var(--control-radius);
  outline: none;
  color: var(--color-text);
  background: var(--color-surface);
  font: inherit;
  font-size: var(--ds-size-md);
  transition: border-color var(--ds-duration-quick) var(--ds-ease-out),
    background-color var(--ds-duration-quick) var(--ds-ease-out);
}

.reference-input:focus {
  border-color: var(--control-focus-border);
}
```

Inputs do not change border color on hover. Blue is reserved for focus and active states.

### 5.4 Password field

- Use a lock icon on the leading side.
- Use a 44px minimum touch target for visibility control.
- Use `Show password` and `Hide password` accessible labels.
- Keep the password visibility button visually quiet until interaction.

### 5.5 Status message

```css
.status-message {
  padding: 11px 13px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  font-size: var(--ds-size-sm);
  line-height: 1.45;
}

.status-message.is-error {
  border-color: var(--color-error-border);
  color: var(--color-error);
  background: var(--color-error-surface);
}

.status-message.is-success {
  border-color: var(--color-success-border);
  color: var(--color-success);
  background: var(--color-success-surface);
}
```

Use `role="alert"` for errors and `role="status"` for success. Recovery success copy must remain generic.

### 5.6 Text links

Links use a consistent underline reveal from right to left.

```css
.auth-link {
  position: relative;
  color: var(--link-color);
  text-decoration: none;
  transition: color var(--ds-duration-quick) var(--ds-ease-out);
}

.auth-link::after {
  position: absolute;
  right: 0;
  bottom: -4px;
  left: 0;
  height: 1px;
  content: '';
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--link-underline-duration) var(--ds-ease-out);
}

.auth-link:hover::after,
.auth-link:focus-visible::after {
  transform: scaleX(1);
}
```

### 5.7 Verification code

- Six single-character inputs.
- Numeric input mode.
- Paste distributes digits across all cells.
- Backspace moves to the previous cell when the current cell is empty.
- Arrow keys move between cells.
- Submit stays disabled by validation until six digits are present.

### 5.8 Form navigation

Use one context-appropriate prompt per screen:

| Screen | Prompt |
| --- | --- |
| Sign in | `Don't have an account? Sign up` |
| Sign up | `Already have an account? Sign in` |
| Forgot password | `Remember your password? Sign in` |
| Reset password | `Remembered your password? Sign in` |
| Verify | `Already have an account? Sign in` |

---

## 6. Motion system

| Interaction | Duration | Recommended motion |
| --- | ---: | --- |
| Press and toggle | 100 to 160ms | small scale or translate |
| Hover and color state | 160 to 240ms | color, icon nudge, underline |
| Layout state | 360ms | segmented indicator, underline reveal |
| Form entrance | 500ms | opacity plus small vertical translate |

Only animate `transform`, `opacity`, `color`, `background-color`, `border-color`, and `box-shadow`. Never use `transition: all`.

The current SSO FE intentionally does not include a `prefers-reduced-motion` override because that behavior was explicitly removed from the product. For future products adopting this system, add a reduced-motion override before shipping motion-heavy pages.

---

## 7. Accessibility contract

- Root document language: `en`.
- Every input has a visible label.
- Inputs use at least 16px text to avoid mobile browser zoom.
- Interactive targets are at least 44px in both dimensions.
- Every interactive element has default, hover, focus-visible, active, disabled, and loading behavior where applicable.
- Focus indicator uses a 2px primary outline with a 3px offset.
- Do not rely on color alone to communicate an error or success state.
- Status messages use `role="alert"` or `role="status"`.
- Password visibility controls expose their state through `aria-label`.
- Recovery flows never reveal whether an email is registered.
- Maintain at least 4.5:1 contrast for normal text and 3:1 for large text or meaningful UI boundaries.

```css
:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}
```

---

## 8. Responsive checklist

### Desktop, 961px and above

- Split frame is visible.
- Both panels fit within `100dvh`.
- Form width remains focused, never stretches to the full panel.
- Brand illustration remains secondary to the headline.

### Tablet, 761px to 960px

- Keep the split layout where space permits.
- Reduce vertical spacing before reducing type size.
- Use compact controls at shorter viewport heights.

### Mobile, 320px to 760px

- Hide the brand panel.
- Keep only the form panel visible.
- Allow vertical scrolling when a form contains many fields.
- Preserve 16px input text.
- Stack two-column form groups below 520px.
- Keep primary buttons full width.
- Avoid horizontal overflow.

---

## 9. Rebrand recipe

To reuse this system for another website:

1. Replace `--ds-blue-600` and `--ds-blue-700` with the new brand ramp.
2. Replace `--ds-ink-900`, `--ds-slate-600`, and the border ramp together so the neutral family stays consistent.
3. Update `--ds-font-body` only if the new font supports the required Latin and Vietnamese glyphs.
4. Replace the logo asset and wordmark text.
5. Rewrite brand panel headline and description without changing form structure.
6. Keep semantic names unchanged so components do not need to be rewritten.

### Example theme override

```css
.theme-atlas {
  --ds-blue-700: #174a7e;
  --ds-blue-600: #2563a6;
  --ds-blue-100: #dceafb;
  --ds-blue-50: #f1f6fd;
  --ds-ink-900: #172438;
}
```

---

## 10. Implementation map

| System area | Current FE location |
| --- | --- |
| Shared package API | `packages/design-system/src/index.tsx` |
| Primitive, semantic, and component tokens | `packages/design-system/src/styles/tokens/` |
| Shared component implementations | `packages/design-system/src/components/` |
| Shared component styles | `packages/design-system/src/styles/components/` |
| Shared stylesheet entrypoint | `packages/design-system/src/styles.css` |
| App base styles | `src/styles/base.css` |
| Admin workspace styles | `src/features/admin/styles/admin-layout.css` |
| Admin workspace composition | `src/app/admin/` |

The package API is intentionally named `@hyperdata/design-system`. Legacy UI package imports are not part of the supported contract.

### Recommended component contract

```text
AuthFrame
  BrandPanel
    BrandHeader
    BrandCopy
    ResearchIllustration
    BrandFooter
  FormPanel
    FormTopline
    FormShell
      FormHeading
      FormFields
      StatusMessage
      PrimaryButton
    FormFooter
```

Keep the contract stable and customize through tokens, copy, and small composition slots rather than duplicating entire pages.

---

## 11. Quality gate

Before reusing this system on another web product, confirm:

- All raw colors in components resolve through tokens.
- No component uses `transition: all`.
- All links share the same underline timing and direction.
- Inputs have no hover-only blue border.
- Focus state is visible by keyboard.
- Mobile hides decorative brand content when the form is the task.
- Recovery messages do not disclose account existence.
- The first viewport contains the primary action without avoidable scrolling.
- The page works at 375px without horizontal overflow.
