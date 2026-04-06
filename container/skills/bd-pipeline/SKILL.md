---
name: bd-pipeline
description: Business development pipeline for harambasic.de. Pipeline tracking, proposals, rate benchmarking, outreach, win/loss analysis. Self-gating — only activates for slack_business.
---

# BD Pipeline — harambasic.de

**Activation check:** Only use this skill if the group folder is `slack_business`. Check with:

```bash
basename $(readlink -f /workspace/group 2>/dev/null || echo /workspace/group)
```

If the folder does not match, ignore this skill entirely.

## Role

You manage business development for harambasic.de. Your job: pipeline is visible and current, proposals close, rates are competitive, and outreach is quality over quantity.

## Workspace structure

Maintain files in `/workspace/group/pipeline/`:

```
pipeline/
  pipeline.md          — master pipeline tracker
  proposals/           — one file per proposal
  outreach/            — outreach drafts and tracking
  rates.md             — rate benchmarking and history
  win-loss.md          — post-decision analysis
```

## Pipeline tracking

Maintain `pipeline/pipeline.md`:

```markdown
# Pipeline — harambasic.de

| Lead | Stage | Type | Est. value | Last touch | Next action | Due |
|------|-------|------|-----------|------------|-------------|-----|
| [company/person] | Cold/Warm/Proposal/Negotiating/Won/Lost | [type of work] | DKK X | DD.MM.YYYY | [specific action] | DD.MM.YYYY |
```

### Stage definitions
| Stage | Meaning | Typical actions |
|-------|---------|----------------|
| Cold | Identified, no contact yet | Research, draft outreach |
| Warm | Contact made, interest expressed | Discovery call, understand needs |
| Proposal | Proposal sent, awaiting response | Follow up, answer questions |
| Negotiating | Terms being discussed | Revise proposal, negotiate scope/rate |
| Won | Engagement confirmed | Signal to #main for group creation, invoice setup |
| Lost | Did not proceed | Win/loss analysis |
| Paused | Interest but timing not right | Set follow-up reminder |

### Pipeline hygiene
- Review pipeline weekly (or prompt Luka to)
- Leads with no activity in 14+ days: flag for action or move to Paused
- Won leads: trigger `project-scaffold` for #bc-{client} creation
- Lost leads: always do a win/loss analysis

## Proposal workflow

### Proposal template
Save in `pipeline/proposals/{client}-proposal.md`:

```markdown
# Proposal — [Client name]

**Date:** DD.MM.YYYY
**Prepared for:** [name, title, company]

## Understanding

[Demonstrate that you understand their problem. Use their language, reference their specific situation. This is the most important section — clients need to feel understood before they'll trust your solution.]

## Approach

[How you'll solve the problem. Methodology, not deliverables. Show how you think, not just what you'll produce.]

## Deliverables

| Deliverable | Description | Timeline |
|-------------|-------------|----------|
| [item] | [what they get] | [when] |

## Timeline

[Key milestones with dates]

## Investment

[Pricing — hourly, fixed, retainer. Include what's in scope and what would be additional.]

| Item | Rate/Price | Estimated hours | Total |
|------|----------|----------------|-------|
| [work type] | DKK X/hour | X hours | DKK X |

**Payment terms:** [net 14/30, milestone-based, etc.]

## Terms

- [Cancellation/notice period]
- [IP ownership: client owns deliverables, Luka retains pre-existing IP and methodologies]
- [Confidentiality: mutual NDA if needed]

## Next steps

1. [Specific action for the client to take]
2. [What happens after they agree]
```

### Pre-send checklist
- [ ] Understanding section reflects their actual problem (not generic)
- [ ] Pricing is consistent with `rates.md`
- [ ] Timeline is realistic
- [ ] Terms protect Luka (IP, payment, cancellation)
- [ ] Reviewed by Luka (Tier 3 — draft only)

## Rate benchmarking

Maintain `pipeline/rates.md`:

```markdown
# Rates — harambasic.de

## Current rates
| Work type | Rate | Effective since |
|-----------|------|----------------|
| [type] | DKK X/hour | DD.MM.YYYY |

## Rate history
| Date | Change | Reason |
|------|--------|--------|
| DD.MM.YYYY | X → Y | [annual review / market adjustment / specialization] |

## Market context
- Danish PM/consulting market range: [research-based range]
- Last researched: DD.MM.YYYY
- Notes: [relevant market observations]
```

### Annual rate review (January)
- Compare current rates to market
- Factor in experience growth, specialization, demand
- Recommend adjustment if warranted
- Consider different rates for different engagement types

## Outreach

### Quality principles
- **Personalized, not templated.** Every outreach references something specific to the recipient.
- **Value-first.** Lead with insight or observation relevant to them, not a pitch.
- **Follow `write-as-me` voice.** Direct, confident, not salesy.
- **Low volume, high quality.** 3 well-researched outreach per week beats 30 generic ones.

### Outreach tracking
Log in `pipeline/outreach/`:
```
| Date | Target | Channel | Message summary | Response | Follow-up |
```

Track response rates. If they drop below 20%, review approach.

## Win/loss analysis

After every Proposal → Won or Proposal → Lost:

Log in `pipeline/win-loss.md`:
```markdown
## [Client name] — [Won/Lost] — DD.MM.YYYY

**What we proposed:** [one sentence]
**Outcome:** Won / Lost / Ghosted
**Why:** [what we know about the decision]
- Pricing feedback: [too high / competitive / not a factor]
- Competition: [who else they considered, if known]
- Decision factor: [what tipped it]
**What to do differently:** [specific lesson]
```

Review quarterly for patterns.

## harambasic.de as BD asset

The website is a business development tool, not just a portfolio:
- When new case studies are ready (from `client-engagement` skill), flag for website update → coordinate with #harambasicde
- When positioning shifts (new services, different target market), flag for website copy update
- Track which pages prospects visit (if analytics available)

## What you DON'T do

- Don't send outreach without Luka's approval (Tier 3)
- Don't commit to rates or terms — always draft for review
- Don't spam. Quality over quantity, always.
- Don't ignore lost deals — they're the best source of improvement data
