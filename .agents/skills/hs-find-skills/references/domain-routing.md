# Domain Routing

Use this file only when choosing between installed skills. If the user
asks to discover or install external skills, return to `../SKILL.md` and use the
Skills CLI flow.

## Routing Rules

- If the user names a skill, use that skill.
- Pick one primary skill per distinct intent. Mention secondary skills only as
  follow-up helpers.
- If two skills overlap, prefer the more specific domain skill over a generic
  workflow skill.

## Core Workflow

| User intent | Primary skill |
|---|---|
| Plan a feature, migration, or multi-file change | `/hs:plan` |
| Implement a feature or approved plan | `/hs:cook` |
| Fix a bug, error, test failure, or CI issue (incl. deep root-cause diagnosis) | `/hs:fix` |
| Review code quality and security | `/hs:code-review` |
| Review a GitHub pull request | `/hs:review-pr` |
| Ship: tests, review, version, PR pipeline | `/hs:ship` |
| Multi-agent feature pipeline / team orchestration | `/hs:vibe` |
| Bootstrap a new project from scratch | `/hs:bootstrap` |
| Initialize/refresh AI project docs | `/hs:docs` |

## Discovery, Research, and Decision Support

| User intent | Primary skill |
|---|---|
| Locate files or understand code quickly | `/hs:scout` |
| Pack a repository for LLM use | `/hs:repomix` |
| Research technical options with sources | `/hs:research` |
| Brainstorm approaches with trade-offs | `/hs:brainstorm` |
| Strategic advice via structured interview | `/hs:advise` |
| Structured step-by-step reasoning | `/hs:sequential-thinking` |
| Discover skills by capability / "is there a skill" | `/hs:find-skills` |
| Kit catalog, usage help | `/hs:help` |
| Port/adapt a feature from another repo | `/hs:xia` |

## Frontend and UI

| User intent | Primary skill |
|---|---|
| Replicate a mockup, screenshot, or video | `/hs:frontend-design` |
| Style with Tailwind or shadcn/ui | `/hs:ui-styling` |
| Choose color, typography, layout, or design system | `/hs:ui-ux-pro-max` |
| Apply React or Next.js performance patterns | `/hs:react-best-practices` |
| Build 3D, WebGL, or Three.js scenes | `/hs:threejs` |
| Write shaders or procedural graphics | `/hs:shader` |
| Build programmatic video with Remotion | `/hs:remotion` |
| Create Excalidraw diagrams | `/hs:excalidraw` |

## Backend, Data, and Auth

| User intent | Primary skill |
|---|---|
| Build REST, GraphQL, or backend services | `/hs:backend-development` |
| Add auth, OAuth, sessions, or passkeys | `/hs:better-auth` |
| Design schemas or write SQL/NoSQL queries | `/hs:databases` |
| Integrate Stripe, Polar, Paddle, or SePay | `/hs:payment-integration` |

## Infrastructure and Security

| User intent | Primary skill |
|---|---|
| Deploy to hosted platforms | `/hs:deploy` |
| Docker, Kubernetes, CI/CD, or cloud ops | `/hs:devops` |
| STRIDE/OWASP audit, secret/vulnerability pattern scan, remediation | `/hs:security` |

## AI, MCP, and Browser Automation

| User intent | Primary skill |
|---|---|
| Context, memory, or agent architecture | `/hs:context-engineering` |
| Analyze images / OCR / screenshots | native Claude `Read` on the image file |
| Generate images (banners, assets, mockups) | `/hs:codex` (gen-image) |
| Second-opinion code/PR/plan review, edge-case audit | `/hs:codex` |
| Build MCP servers | `/hs:mcp-builder` |
| Test generic browser workflows | `/hs:agent-browser` |
| Use the user's real Chrome profile | `/hs:chrome-profile` |
| Autonomous metric-driven iteration loop | `/hs:loop` |

## Testing, Docs, and Media

| User intent | Primary skill |
|---|---|
| Run tests, coverage, or TDD gates | `/hs:test` |
| Playwright, Vitest, k6, visual or a11y tests | `/hs:web-testing` |
| Project docs init/update/summarize | `/hs:docs` |
| Library/framework docs lookup | `/hs:docs-seeker` |
| Office documents: docx, pdf, pptx, xlsx | `/hs:document-skills` |
| Visual explanation, preview, slides, or diagrams | `/hs:preview` |
| Mermaid syntax | `/hs:mermaidjs-v11` |
| Publish-grade technical diagrams | `/hs:tech-graph` |
| Video/audio/image processing | `/hs:media-processing` |
| Demo/show-off page for finished work | `/hs:show-off` |

## Frameworks and Platforms

| User intent | Primary skill |
|---|---|
| Next.js, App Router, RSC, Turborepo | `/hs:web-frameworks` |

## Project and Session Management

| User intent | Primary skill |
|---|---|
| Plan-progress sync, task reconciliation | `/hs:project-management` |
| Organize outputs/reports into project structure | `/hs:project-organization` |
| Git commits, branches, worktree hygiene | `/hs:git` |
| Isolated worktree for a feature/fix | `/hs:worktree` |
| Session hand-off / EOD summary | `/hs:watzup` |
| Engineering journal entry | `/hs:journal` |
| Adjust AI coding autonomy level | `/hs:coding-level` |
| Author or improve a skill | `/hs:skill-creator` |
