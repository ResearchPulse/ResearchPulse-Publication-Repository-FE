# Skill Domain Routing

When a user's task involves a specific domain, use these decision trees to pick the RIGHT skill based on user intent.

## Frontend / UI

```
User wants to...
├── Replicate a mockup, screenshot, or video    → /hs:frontend-design
├── Style with Tailwind CSS + shadcn/ui          → /hs:ui-styling
├── Choose colors, fonts, layout, design system  → /hs:ui-ux-pro-max
├── Apply React performance patterns             → /hs:react-best-practices
├── Create 3D / WebGL / Three.js experience      → /hs:threejs
├── Write GLSL shaders / procedural graphics     → /hs:shader
└── Build programmatic video with Remotion       → /hs:remotion
```

## Codebase Understanding

```
User wants to...
├── Quick file search, locate specific code     → /hs:scout
├── Onboard a new repo / dump codebase for LLM  → /hs:repomix
└── Port/adapt a feature from another repo      → /hs:xia
```

## Backend / API

```
User wants to...
├── Build REST/GraphQL API (NestJS, FastAPI, Django) → /hs:backend-development
├── Add authentication (OAuth, JWT, passkeys)        → /hs:better-auth
└── Integrate payments (Stripe, Polar, SePay)        → /hs:payment-integration
```

## Database

```
User wants to...
├── Design schemas, write SQL/NoSQL queries     → /hs:databases
├── Optimize indexes, migrations, replication   → /hs:databases
└── Add auth with database-backed sessions      → /hs:better-auth
```

## Infrastructure / Deployment

```
User wants to...
├── Deploy to Vercel, Netlify, Railway, Fly.io   → /hs:deploy
└── Docker, Kubernetes, CI/CD pipelines, GitOps   → /hs:devops
```

## Security

```
User wants to...
├── STRIDE/OWASP security audit with auto-fix    → /hs:security
└── Scan for secrets / vulnerable code patterns  → /hs:security (pattern scan mode)
```

## AI / LLM

```
User wants to...
├── Optimize context, agent architecture, memory → /hs:context-engineering
├── Analyze images / OCR / screenshots            → native Claude `Read` on the image file
├── Generate images (banners, assets, mockups)    → /hs:codex (gen-image)
└── Autonomous metric-driven iteration loop      → /hs:loop
```

## MCP (Model Context Protocol)

```
User wants to...
└── Build a new MCP server                       → /hs:mcp-builder
```

## Testing / Browser

```
User wants to...
├── Run test suites, coverage reports, TDD          → /hs:test
├── Test strategy + Playwright/Vitest/k6 runner     → /hs:web-testing
├── Drive a live browser                            → /hs:agent-browser
└── Use the user's real Chrome profile              → /hs:chrome-profile
```

## Media

```
User wants to...
└── Process video/audio (FFmpeg), images (ImageMagick) → /hs:media-processing
```

## Documentation

```
User wants to...
├── Update project docs (codebase-summary, PDR)   → /hs:docs
├── Search library/framework docs (context7)      → /hs:docs-seeker
├── Discover skills by capability / "is there a skill" → /hs:find-skills
├── Kit catalog and usage help                    → /hs:help
├── Inline doc diagrams (Mermaid v11)             → /hs:mermaidjs-v11
├── Publish-grade SVG/PNG diagrams (architecture) → /hs:tech-graph
├── Demo/show-off page for finished work          → /hs:show-off
├── Generate session hand-off / EOD summary       → /hs:watzup
└── Engineering journal entry                     → /hs:journal
```

## Documents / Office Files

```
User wants to...
└── Create / edit / extract from .docx / .pdf / .pptx / .xlsx → /hs:document-skills
```

## Content / Visuals

```
User wants to...
├── Visual explanation, preview, slides, diagrams → /hs:preview
└── Create Excalidraw diagrams                    → /hs:excalidraw
```

## Frameworks

```
User wants to...
└── Next.js App Router, RSC, Turborepo           → /hs:web-frameworks
```

## Project / Session Management

```
User wants to...
├── Plan a feature or multi-file change           → /hs:plan
├── Implement a feature or approved plan          → /hs:cook
├── Fix a bug / deep root-cause diagnosis         → /hs:fix
├── Review code quality and security              → /hs:code-review
├── Review a GitHub pull request                  → /hs:review-pr
├── Ship pipeline (tests, review, version, PR)    → /hs:ship
├── Multi-agent feature pipeline                  → /hs:vibe
├── Bootstrap a new project                       → /hs:bootstrap
├── Research options with sources                 → /hs:research
├── Brainstorm approaches with trade-offs         → /hs:brainstorm
├── Strategic advice via structured interview     → /hs:advise
├── Structured step-by-step reasoning             → /hs:sequential-thinking
├── Plan-progress sync / task reconciliation      → /hs:project-management
├── Organize outputs into project structure       → /hs:project-organization
├── Git commits, branches, hygiene                → /hs:git
├── Isolated worktree for a feature/fix           → /hs:worktree
├── Adjust AI coding autonomy level               → /hs:coding-level
└── Author or improve a skill                     → /hs:skill-creator
```

## Usage Notes

- Pick ONE skill per distinct user intent
- If a task spans two domains (e.g. "build + deploy"), suggest the primary skill and mention the secondary
- Domain skills combine with core workflow: `/hs:plan` → domain skill → `/hs:cook`
- Skills not listed here are utility skills activated on demand (e.g. `/hs:preview`, `/hs:sequential-thinking`)
