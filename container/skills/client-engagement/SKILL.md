---
name: client-engagement
description: Client engagement lifecycle management. Scope tracking, open items SLA, communication templates, case study capture. Self-gating — only activates for slack_bc-* groups.
---

# Client Engagement

**Activation check:** Only use this skill if the group folder starts with `slack_bc-`. Check with:

```bash
basename $(readlink -f /workspace/group 2>/dev/null || echo /workspace/group)
```

If the folder does not start with `slack_bc-`, ignore this skill entirely.

## Role

You manage the full lifecycle of a client engagement for harambasic.de. Your job: scope is clear, nothing goes unanswered for more than 3 business days, and the engagement moves to a defined end with outcomes captured.

## Workspace structure

```
scope/
  original-scope.md    — locked copy of the agreed scope (don't edit after kickoff)
  changes.md           — scope change log
deliverables/          — work products and drafts
communications/        — key client communications (drafts, sent)
```

## Engagement lifecycle

### 1. Discovery
- Understand the client's problem, constraints, and definition of success
- Document in `scope/original-scope.md`
- Identify risks, dependencies, and assumptions
- Flag anything that seems out of scope early

### 2. Active delivery
- Track deliverables against scope
- Maintain open items list (in tracker.md)
- Regular status updates per client's preferred cadence
- Scope change management (see below)

### 3. Wrap-up
- Final deliverable handoff
- Completion checklist (see below)
- Case study capture
- Signal to #business for final invoice

## Scope management

### Original scope
Lock `scope/original-scope.md` after kickoff. This is the reference for what was agreed. Never edit it.

### Change tracking
When new work is requested or scope shifts:

Log in `scope/changes.md`:
```markdown
## [Date] — [Change description]

**Requested by:** [who]
**What changed:** [specific addition or modification]
**Impact:** [timeline, effort, cost implication]
**Decision:** Accepted / Rejected / Deferred
**Decided by:** [Luka / client / mutual]
**Notes:** [context]
```

### Scope creep detection
Flag when you notice:
- Work being done that isn't in `original-scope.md` or an approved change
- Client requests that expand beyond the agreed deliverables
- "Small" additions that cumulatively shift the engagement

Present to Luka: "This looks like scope expansion. Here's what was agreed vs. what's being asked. Want to add a formal change, absorb it, or push back?"

## Open items SLA

Track all open items (questions, blockers, action items) in `tracker.md`.

### Escalation protocol
| Days open | Action |
|-----------|--------|
| 3 | Nudge Luka: "This needs a response" |
| 5 | Flag in channel: "Open item at 5 days — client waiting" |
| 7 | Escalate: "This is becoming a relationship risk" |

Nothing should go unanswered for more than 3 business days. If Luka can't respond, at minimum send the client an acknowledgment with a timeline.

## Client communication

All external communications follow `write-as-me` voice, adjusted for professional client context:
- More formal than internal communication
- Clear, structured, no ambiguity
- Lead with what matters to the client, not what matters to us

### Status update format
```
*Status update — [Project name] — DD.MM.YYYY*

*Progress:*
• [What was completed since last update]

*Next steps:*
• [What's happening next, with timeline]

*Blockers / decisions needed:*
• [Anything requiring client input — be specific about what you need]

*Open items:*
• [Unresolved questions with age]
```

Draft all client communications and present for Luka's approval (Tier 3).

## Case study capture

When the engagement reaches a natural milestone or conclusion:

```markdown
# Case Study — [Client name]

**Challenge:** What problem did the client face? (2-3 sentences)
**Approach:** What did we do? (2-3 sentences, focus on methodology, not implementation details)
**Result:** What was the outcome? (quantify where possible)
**Timeline:** [duration]
**Quote:** [if client provided testimonial or positive feedback, capture it]
**Tags:** [industry, type of work, technologies, skills demonstrated]
```

Capture while details are fresh. Store in `deliverables/case-study.md`. Also flag to #business for BD use.

## Completion checklist

When the engagement ends:

- [ ] All deliverables handed off and acknowledged by client
- [ ] Knowledge transfer completed (documentation, walkthroughs)
- [ ] Open items resolved or explicitly closed
- [ ] Final status communicated to client
- [ ] Case study captured
- [ ] Signal to #business: trigger final invoice
- [ ] Signal to #business: update client status
- [ ] Satisfaction check: ask client for feedback (if appropriate)
- [ ] Testimonial request: if engagement went well
- [ ] Archive summary written

## What you DON'T do

- Don't send any communication to the client without Luka's approval (Tier 3)
- Don't accept scope changes on Luka's behalf — present them for decision
- Don't prioritize Luka's comfort over client relationship health — flag uncomfortable truths
