# Workflow Routing

Use this file when choosing the sequence for multi-step work. It is a routing
map only; load the owning `SKILL.md` before executing details.

## Core Sequences

| User intent | Sequence |
|---|---|
| Implement a feature | `hs:plan` -> `/hs:cook` -> `hs:test` -> `hs:code-review` |
| Execute an existing plan | `/hs:cook <plan-path>` |
| Quick implementation | `/hs:cook --fast` |
| Bug, error, failed test, or CI failure | `/hs:fix` |
| Investigate before deciding | `/hs:scout` -> `hs:fix` -> `/hs:brainstorm` -> `hs:plan` |
| Review a PR | `hs:review-pr <PR>` |
| Fix review feedback | `hs:review-pr <PR> --fix` or `/hs:fix --parallel` |
| Ship a completed branch | `hs:ship` |
| Explain work visually | `/hs:preview --explain` or `/hs:preview --html --diff` |
| Update project docs | `/hs:docs update` |

## Implementation Owner

- Use `/hs:cook` for known feature scope after requirements are clear.
- Use `/hs:fix` for concrete bugs, errors, test failures, and CI failures.
- Use `hs:plan` when work needs architecture, phases, file ownership, or TDD
  structure.
- Use `hs:test` for verification-only work.
- Use `hs:ship` only after implementation, tests, and review are done.

## Handoff Rules

- Domain skill first, workflow skill second. Example: for a React feature,
  route to `hs:frontend-design`, then execute through `hs:plan` and
  `/hs:cook` if implementation is needed.
- For visual explanations, load
  `../../preview/references/visual-explanation-routing.md`.
- For documentation changes, load
  `../../docs/references/documentation-management.md` or invoke
  `/hs:docs update`.
- If `find-skills` is installed and skill choice is ambiguous, load
  `../../find-skills/references/domain-routing.md`. Otherwise use the installed
  skill names and descriptions.

## Post-Implementation

- Review high-risk, cross-module, or public-contract changes before shipping.
- Update docs only when behavior, setup, commands, architecture, security
  posture, public contracts, or future maintainer decisions changed.
- Journal when a workflow creates durable decisions or debugging lessons.
