---
name: cross-group-signal
description: Cross-group signal propagation. All groups emit signals for cross-domain awareness. Main group consumes signals during briefings and weekly reviews.
---

# Cross-Group Signal

Enables agents to flag information that has cross-domain implications. Without this, Luka is the only bus connecting the team.

## How it works

- **Every group** can emit signals when something happens that another group should know about
- **#main** reads all signals during morning briefings and weekly reviews, and routes or synthesizes as needed
- Signals are lightweight — one file per event, not a messaging system

## Emitting a signal

When you encounter something with cross-group implications, write a signal file:

```
/workspace/group/signals/YYYY-MM-DD-short-description.md
```

Format:

```markdown
---
type: $absence | $financial | $deadline | $pattern | $escalation
source_group: this group's name
date: DD.MM.YYYY
affects: comma-separated list of affected groups
---

One paragraph: what happened and why it matters to the affected groups.
```

### Signal types

| Type | When to emit | Example |
|------|-------------|---------|
| `$absence` | Time off, capacity change, unavailability | Vacation next week — affects #business client deadlines |
| `$financial` | Income change, rate change, expense threshold | New consulting contract — affects personal tax estimate |
| `$deadline` | Deadline in this group creates dependency elsewhere | Insurance renewal in 14 days — may affect travel plans |
| `$pattern` | Same topic surfacing 3+ times across sessions | Burnout signals appearing in both #work and #coach |
| `$escalation` | Something needs #main attention urgently | Compliance deadline missed — needs immediate routing |

### When NOT to emit

- Routine task completion — that's what the tracker is for
- Information that stays within this group's domain
- Minor updates with no cross-group impact

## Consuming signals (#main only)

During morning briefings and weekly reviews, scan all group signal directories:

```bash
for f in /workspace/project/groups/*/signals/*.md; do
  [ -f "$f" ] && echo "=== $f ===" && cat "$f" && echo
done
```

After processing a signal:
1. Route action items to affected groups via the briefing summary
2. Move the signal file to `signals/processed/` in its source group
3. If 3+ signals share a theme, synthesize into a pattern note

## Anticipation guidelines

Don't wait for cross-group impact to be obvious. Emit a signal when:
- A life event could affect work capacity (even if you're not sure yet)
- A financial change in #business could affect #life personal finance
- A deadline in one group creates a soft dependency in another
- You notice the user's energy or focus shifting in a way other groups should adapt to

The cost of a false signal is low. The cost of a missed connection is high.
