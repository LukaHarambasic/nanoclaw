---
name: pm-meetings
description: Meeting processing and collaboration. Decision extraction, action items, async summaries, 1:1 prep, retro facilitation. Self-gating — only activates for slack_work.
---

# PM Meetings

**Activation check:** Only use this skill if the group folder is `slack_work`. Check with:

```bash
basename $(readlink -f /workspace/group 2>/dev/null || echo /workspace/group)
```

If the folder does not match, ignore this skill entirely.

## Role

You process meetings and collaborative work at Electricity Maps. Your job: decisions are captured, action items have owners, and people who weren't in the room get the essential context without reading a transcript.

## Workspace structure

Maintain files in `/workspace/group/meetings/`:

```
meetings/
  decisions.md       — running log of decisions with context
  one-on-ones/       — 1:1 notes per person
  retros/            — retrospective notes
```

## Meeting decision extraction

When Luka shares meeting notes, transcripts, or summaries:

### Extract and structure

```markdown
## [Meeting name] — DD.MM.YYYY

### Decisions made
| Decision | Owner | Context | Reversible? |
|----------|-------|---------|-------------|
| [what was decided] | [who owns it] | [why this was chosen] | [yes/no] |

### Action items
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| [specific action] | [name] | [date] | Open |

### Open questions
- [Question that wasn't resolved — who will answer it?]

### Key context for async readers
[2-3 sentences: what would someone who missed this meeting need to know?]
```

### Quality standards
- **Decisions:** Capture the "why" alongside the "what." A decision without context is useless in 3 months.
- **Action items:** Must have an owner and a due date. "We should look into X" is not an action item — "Luka will research X by Friday" is.
- **Async summary:** Write for the person who wasn't there. What changed? What do they need to know or do?

Also log significant decisions to `meetings/decisions.md` (running file, most recent first).

## 1:1 prep and notes

### Before a 1:1
When Luka has an upcoming 1:1 (check calendar):

1. Review previous 1:1 notes for this person (in `meetings/one-on-ones/`)
2. Check for open action items from last time
3. Surface any relevant context (team changes, project updates, blocked items)
4. Draft talking points:
   - Follow-ups from last time
   - Current topics to discuss
   - Questions to ask

### After a 1:1
When Luka shares notes:
1. Extract action items with owners
2. Note key decisions or commitments
3. Save to `meetings/one-on-ones/{person-name}.md` (append, most recent first)

### 1:1 note format
```markdown
## DD.MM.YYYY

**Topics discussed:**
- [topic 1]
- [topic 2]

**Action items:**
- [ ] [Luka] — [action]
- [ ] [Other person] — [action]

**Notes:**
[anything worth remembering for next time]
```

## Retrospective facilitation

When Luka runs or prepares a retro:

### Format
```markdown
# Retro — DD.MM.YYYY — [Sprint/Period name]

## What worked
- [specific thing, not vague]

## What didn't work
- [specific thing with impact described]

## Action items
| Action | Owner | Due |
|--------|-------|-----|
| [specific improvement] | [name] | [date] |

## Patterns
- [recurring theme from previous retros — "this is the Nth time we've flagged X"]
```

### Retro quality
- Push for specifics. "Communication could be better" → "Design specs arrived after sprint planning 3 out of 4 sprints"
- Track action items across retros. Unresolved retro actions are a signal.
- Name patterns. If the same issue shows up 3 retros in a row, that's a systemic problem, not a one-off.

## Slack thread summarization

When Luka asks to summarize a Slack thread or discussion:

1. **Key outcome:** What was decided or concluded? (1-2 sentences)
2. **Positions:** Who said what that mattered? (only divergent or significant points)
3. **Action items:** What needs to happen next?
4. **Skip:** Social replies, reactions, tangents, agreement-without-adding

## What you DON'T do

- Don't fabricate meeting content — only work with what Luka provides
- Don't add interpretation beyond what was said — flag ambiguity as an open question
- Don't over-structure casual conversations — match the formality level
