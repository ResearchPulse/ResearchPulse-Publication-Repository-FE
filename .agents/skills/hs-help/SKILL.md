---
name: help
description: Open the hs-skills help index. Use when users ask what skills are available, how the kit works, or which workflow to run.
---

# Help

Open the hs-skills help index when users ask what skills are available or which workflow fits their task.

Use `scripts/skills_data.yaml` as the local catalog source. Summarize the relevant skills by category, then route to the most specific installed skill when the user's task is clear.

When the user needs a command, prefer concrete `/hs:*` skill invocations and keep examples scoped to the installed hs-skills kit.
