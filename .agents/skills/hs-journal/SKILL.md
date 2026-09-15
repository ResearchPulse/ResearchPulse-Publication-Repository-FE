---
name: journal
description: "Write technical journal entries analyzing recent changes. Use for session reflections, change analysis, decision documentation."
---

# Journal

Use the `journal-writer` subagent to explore the memories and recent code changes, and write some journal entries.
Journal entries should be concise and focused on the most important events, key changes, impacts, and decisions.
Keep journal entries in the `./docs/journals/` directory.

**IMPORTANT:** Invoke the `hs:project-organization` skill to organize the outputs.

## Workflow Position

**Typically follows:** `hs:ship` (journal after shipping), `/hs:cook` (journal after implementation), `/hs:fix` (journal after bug fix)
**Terminal skill** — no typical successor.
