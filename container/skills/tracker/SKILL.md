---
name: tracker
description: Manages the user's task/todo list at /workspace/group/tracker.md. Covers adding, completing, deferring, blocking, and searching tasks. The user is the audience.
---

# Tracker — User Task Management

Each group maintains a task tracker at `/workspace/group/tracker.md`. This is the user's todo list — things that need doing, following up on, or remembering.

## File structure

tracker.md has four sections in fixed order:

```markdown
# Tracker

## Open

- [ ] prepare quarterly report | due:2026-04-05 | source:chat:2026-04-02
- [ ] follow up with @Anders about API access | due:2026-04-08 | source:email

## Waiting

- [~] blocked on admin approval for API key | waiting-on:@IT | since:2026-04-01

## Deferred

- [>] review landing page copy | deferred:2026-04-14 | reason:low priority

## Done (recent)

- [x] sent invoice to ClientCo | done:2026-04-02 | source:chat:2026-04-02
```

## Task syntax

Each task is a single line: `- [marker] description | key:value | key:value`

| Marker | Meaning |
|--------|---------|
| `- [ ]` | Open — needs doing |
| `- [x]` | Completed |
| `- [~]` | Waiting/blocked on someone or something |
| `- [>]` | Deferred to a later date |

## Metadata keys

| Key | Format | When to use |
|-----|--------|-------------|
| `due:` | `YYYY-MM-DD` | Deadline or target date |
| `done:` | `YYYY-MM-DD` | When completed |
| `source:` | `chat:YYYY-MM-DD`, `email`, `scheduled-review`, `calendar` | Where the task came from |
| `waiting-on:` | `@Name` or description | Who/what is blocking |
| `since:` | `YYYY-MM-DD` | When the wait started |
| `deferred:` | `YYYY-MM-DD` | Resume date |
| `reason:` | free text | Why deferred or blocked |
| `priority:` | `high`, `normal`, `low` | Only when explicitly set |

## People

Use `@Name` for people mentioned in tasks, for searchability.

## Due date inference

When the user says "by Friday" or "next Tuesday", convert to an absolute `due:YYYY-MM-DD` using today's date. Always use ISO dates in the file, never relative dates.

## Task operations

### Adding a task

Append to `## Open`. Always include `source:`. Infer `due:` from relative language.

### Completing a task

Move from current section to `## Done (recent)`. Add `done:YYYY-MM-DD`.

### Blocking/waiting

Move to `## Waiting`. Add `waiting-on:` and `since:`.

### Deferring

Move to `## Deferred`. Add `deferred:` date and `reason:`.

### Unblocking or resuming

Move back to `## Open`. Remove the waiting/deferred metadata.

## Cleanup

During end-of-conversation check, remove done items older than 14 days from `## Done (recent)`. If `## Open` exceeds 50 items, suggest prioritization to the user.

## When to write

- User explicitly creates or manages a task
- An obligation or commitment emerges from conversation
- An email or message contains something the user needs to act on
- A scheduled review surfaces something actionable
- A blocker is identified that the user needs to track

## When NOT to write

- Agent operational notes (those go in the log)
- Decisions and learnings (those go in the log)
- Reference info, links, or facts to remember (those go in notes/)
- Things only useful for the current conversational turn

## Creating the tracker

If `tracker.md` does not exist, create it:

```markdown
# Tracker

## Open

## Waiting

## Deferred

## Done (recent)
```

## Search patterns

```bash
# All open tasks
grep '^\- \[ \]' /workspace/group/tracker.md

# Overdue candidates (compare dates programmatically)
grep 'due:' /workspace/group/tracker.md

# Tasks involving a person
grep '@Anders' /workspace/group/tracker.md

# High priority
grep 'priority:high' /workspace/group/tracker.md

# All waiting items
grep '^\- \[~\]' /workspace/group/tracker.md

# Cross-group open tasks (main group only)
grep -r '^\- \[ \]' /workspace/project/groups/*/tracker.md
```
