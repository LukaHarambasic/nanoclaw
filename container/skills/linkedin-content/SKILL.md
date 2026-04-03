---
name: linkedin-content
description: LinkedIn post drafting and idea extraction. Self-gating — only activates for groups with folder matching slack_personal, slack_work-emaps, or slack_bc-admin.
---

# LinkedIn Content — Post Drafting

**Activation check:** Only use this skill if the group folder is one of: `slack_personal`, `slack_work-emaps`, `slack_bc-admin`. Check with:

```bash
basename $(pwd)
```

If the folder does not match, ignore this skill entirely.

## What this skill does

- Helps draft LinkedIn posts from real work, learnings, and shipped results
- Extracts post-worthy ideas from conversations
- Applies the `write-as-me` voice to all drafts
- Never posts automatically. Always produces a draft for review.

## Post formats

### Insight post
A specific takeaway from real experience. Structure:
- Hook line (what you learned or noticed)
- 2-3 supporting points or examples
- One concrete takeaway

### Question post
Starts with a genuine question to spark discussion:
- The question
- Brief context on why you're asking
- Your current thinking (optional)

### Story post
A short narrative from real work:
- Situation (1-2 sentences)
- What happened or what you did
- What you learned or what changed

## Drafting rules

- Draw from actual work, decisions, and learnings. Never generate generic content.
- Keep posts under 1300 characters (LinkedIn sweet spot)
- No hashtag spam. 2-3 relevant hashtags max, at the end.
- Write in first person
- Apply `write-as-me` tone: direct, no em dashes, American English, not overly polished
- If the user shares something that could make a good post, mention it. Don't force it.

## Saving drafts

Save drafts to `/workspace/group/linkedin-drafts/` with a descriptive filename:

```
linkedin-drafts/2026-04-02-discovery-patterns.md
```

Include a one-line summary at the top of the file so drafts are easy to scan later.
