---
name: journaling
description: Maintains a bullet journal (journal.md) as the group's operating record. Covers writing, reading, searching, auto-logging, and end-of-conversation capture.
---

# Journaling — Bullet Journal Operating Record

Every group maintains a single `journal.md` file at `/workspace/group/journal.md` as its operating record. This is the default place for tasks, decisions, blockers, references, metrics, and learnings.

## Format

Newest day at the top. Each day gets a date header:

```markdown
## 2026-04-02

- [ ] prepare quarterly report | due:2026-04-05
- [x] sent invoice to client | done:2026-04-02
- $decision chose Stripe over manual invoicing because it automates reconciliation
- $ref https://notion.so/roadmap-q2

## 2026-04-01

- [~] blocked on API access | blocked:waiting for admin approval
- [>] review landing page copy | deferred:2026-04-07 | low priority this week
- $learning Slack threads older than 90 days are not indexed by search
- $metric activation rate 42%
```

## Task syntax

| Marker | Meaning | Suffix |
|--------|---------|--------|
| `- [ ]` | Open task | `due:YYYY-MM-DD` (optional) |
| `- [x]` | Completed | `done:YYYY-MM-DD` |
| `- [~]` | Blocked/cancelled | `blocked:reason` |
| `- [>]` | Deferred/migrated | `deferred:YYYY-MM-DD \| reason` |

## Meta prefixes

Use these at the start of a journal line (after the bullet) to tag entries:

- `$decision` — a choice that was made and why
- `$learning` — something discovered or understood
- `$blocker` — something preventing progress
- `$ref` — a URL, doc, or resource worth finding later
- `$metric` — a number worth tracking

## People

First mention of a person in a journal entry should use `@Name` for searchability.

## Due date inference

When the user says "by Friday" or "next Tuesday", convert to an absolute `due:YYYY-MM-DD` using today's date. Always use ISO dates, never relative dates in the file.

## Auto-logging rules

During a conversation, log to the journal when:

- A task is completed or created
- A decision is made (especially if it involved tradeoffs)
- A blocker is identified or resolved
- A meaningful metric is mentioned
- A useful reference URL or document comes up
- A non-obvious learning emerges

Do NOT log:

- Greetings and small talk
- Every intermediate draft step
- Information that already exists in a durable document
- System chatter or routine confirmations
- Things only useful for the current turn

## End-of-conversation check

Before wrapping up a conversation, briefly review what happened. If there are loggable items (tasks created, decisions made, blockers found, references shared), write them to the journal. Do not ask permission for routine logging — just do it. Only ask if the value of logging something is genuinely ambiguous.

## Reading and searching

To find open tasks across the journal:

```bash
grep -n '^\- \[ \]' /workspace/group/journal.md
```

To find decisions:

```bash
grep -n '\$decision' /workspace/group/journal.md
```

To find blockers:

```bash
grep -n '\$blocker\|blocked:' /workspace/group/journal.md
```

To find overdue tasks (compare due dates against today):

```bash
grep '\- \[ \].*due:' /workspace/group/journal.md
```

## Creating the journal

If `journal.md` does not exist yet, create it with a date header for today and a note:

```markdown
## YYYY-MM-DD

- $decision started bullet journal for this group
```
