# Skill Workflow Routing

When orchestrating multi-step tasks, consider these workflow sequences. Skills are listed in typical execution order.

## Core Development Workflow

```
/hs:plan → /hs:cook → /hs:test → /hs:code-review → /hs:ship → /hs:journal
```

| User Intent | Suggested Start |
|-------------|----------------|
| "implement feature X", "build X", "add X" | `/hs:plan` then `/hs:cook` |
| "execute this plan" | `/hs:cook <plan-path>` |
| "quick implementation" | `/hs:cook --fast` |

## Bugfix Workflow

```
/hs:scout → /hs:fix → /hs:test → /hs:code-review
```

| User Intent | Suggested Start |
|-------------|----------------|
| "X is broken", "error in X", "bug in X" | `/hs:fix` (auto-scouts internally) |
| "CI is failing", "tests broken" | `/hs:fix --auto` |
| "investigate why X happens" | `/hs:scout` then `/hs:fix` (Deep Diagnosis) |

## Investigation Workflow

```
/hs:scout → /hs:fix → /hs:brainstorm → /hs:plan
```

| User Intent | Suggested Start |
|-------------|----------------|
| "understand how X works" | `/hs:scout` |
| "why is X happening" | `/hs:fix` (Deep Diagnosis) |
| "explore options for X" | `/hs:brainstorm` then `/hs:plan` |

## Post-Implementation Checklist

After completing implementation work, consider:
- `/hs:code-review` — review changes before merging
- `/hs:ship` — run full shipping pipeline (tests, review, version, PR)
- `/hs:journal` — document decisions and lessons learned

## Setup Skills

Before starting implementation in a shared codebase:
- `/hs:worktree` — create isolated worktree for the feature/fix
- `/hs:scout` — discover relevant files and code patterns
