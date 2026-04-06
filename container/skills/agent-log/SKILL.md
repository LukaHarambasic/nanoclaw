---
name: agent-log
description: Maintains the agent's operational log at /workspace/group/log/YYYY-MM.md. Records actions, decisions, learnings, and references. The agent (in future sessions) is the audience.
---

# Agent Log — Operational Memory

Each group maintains a log directory at `/workspace/group/log/` with monthly files. This is the agent's memory — what happened, what was decided, and why.

## File structure

One file per month: `log/YYYY-MM.md`. Newest day at top within each file.

```markdown
# Log — 2026-04

## 2026-04-04

- signed up agentosassistant@gmail.com to 8 event newsletter sources | $action
- Absalon, Visit CPH, Cooking Festival, Royal Theatre confirmed | $result
- Håndboldligaen: no fan newsletter found, site down | $result $inconclusive
- discovered The Food Project as additional event source | $learning
- $decision recommended Luma as best general community event source

## 2026-04-03

- processed business group setup request | $action
- $decision split personal into personal + life groups for clearer scope boundaries
```

## Tags

Append tags at the end of each line (after `|`) or at the start (as prefix). Both work — pick whichever reads more naturally.

| Tag | Meaning |
|-----|---------|
| `$action` | Something the agent did |
| `$decision` | A choice made and why |
| `$learning` | Something discovered or understood |
| `$result` | Outcome of an action |
| `$inconclusive` | Attempted but unclear outcome |
| `$blocker` | Something preventing progress |
| `$ref` | URL or document reference |
| `$metric` | Number worth tracking |
| `$system` | Operational/infra event |

Multiple tags per line are fine: `| $result $inconclusive`

## People

Use `@Name` for people mentioned, for searchability.

## When to write

- Agent completes a meaningful action (not every tool call — just outcomes)
- A decision is made, especially one involving tradeoffs
- A non-obvious learning or discovery occurs
- A useful reference URL or resource is found (that the agent needs, not the user — user references go in notes/)
- A metric is mentioned worth tracking later
- A system event worth remembering (group created, skill applied, config changed)

## When NOT to write

- Greetings and small talk
- Intermediate draft steps
- Routine confirmations
- Things only useful for the current turn
- User tasks (those go in tracker.md)
- User reference info (those go in notes/)

## End-of-conversation check

Before wrapping up, review what happened. Log notable actions, decisions, and learnings. Do not ask permission for routine logging — just do it.

## Creating log entries

If `log/` directory or current month file doesn't exist, create them:

```bash
mkdir -p /workspace/group/log
```

New month file starts with `# Log — YYYY-MM` followed by today's date header.

When adding to an existing month file, check if today's date header already exists. If yes, append entries under it. If not, add a new date header at the top (below the `# Log` title).

## Search patterns

```bash
# All decisions this month
grep '\$decision' /workspace/group/log/2026-04.md

# All learnings ever
grep -r '\$learning' /workspace/group/log/

# What happened on a specific date
grep -A 50 '^## 2026-04-04' /workspace/group/log/2026-04.md | sed '/^## 2026-04-0[0-3]/q'

# Cross-group decisions (main group only)
grep -r '\$decision' /workspace/project/groups/*/log/

# All references
grep -r '\$ref' /workspace/group/log/
```
