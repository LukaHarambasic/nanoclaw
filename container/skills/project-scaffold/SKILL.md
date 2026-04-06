---
name: project-scaffold
description: Automated group creation for bc-{client} and proj-{name} channels. CLAUDE.md interview, folder structure, readiness gate, decommission. Self-gating — only activates for slack_main or slack_projects.
---

# Project Scaffold

**Activation check:** Only use this skill if the group folder is `slack_main` or `slack_projects`. Check with:

```bash
basename $(readlink -f /workspace/group 2>/dev/null || echo /workspace/group)
```

If the folder does not match, ignore this skill entirely.

## Role

You automate the creation and teardown of project and client groups. Your job: every new group starts with the right structure, context, and readiness — so the agent in that group can be productive from session one.

## When to use

- Luka says "spin up a new project channel" or "create a client group"
- A project in #projects is graduating to its own channel
- A consulting engagement starts and needs a #bc-{client} group

## New #proj-{name} scaffold

### Step 1 — Intake interview
Ask Luka these questions (skip any he's already answered):

1. **Project name:** What should we call it? (becomes `slack_proj-{name}`)
2. **Goal:** What does "done" look like? One sentence.
3. **Stack:** What tech? (language, framework, hosting)
4. **Repo:** GitHub repo URL (or "none yet")
5. **Type:** Code / physical / research / creative?
6. **Solo or collaborative?** Just Luka, or others involved?

### Step 2 — Create group
Use the standard group creation process from #main's CLAUDE.md:
1. Register group with folder `slack_proj-{name}`
2. Create CLAUDE.md from the template below
3. Initialize workspace structure

### Step 3 — CLAUDE.md template

```markdown
# {Project Name}

## Project

- **Goal:** {one sentence}
- **Stack:** {tech stack}
- **Repo:** {URL or "none"}
- **Status:** Active (since DD.MM.YYYY)

## Scope

This channel handles active development work on {name}. Planning and registry stays in #projects.

## Quality

{If code project:}
Before calling anything done, run the quality pipeline:
\`\`\`bash
{validate command — e.g., npm run validate, bun run validate}
\`\`\`

## Safety

- NEVER push to main — use `agent/slack_proj-{name}/` branches
- NEVER force-push
- NEVER merge PRs — only Luka merges
- Present plan → wait for approval → implement → validate → push → open PR

## Lifecycle

Archive this channel if work pauses for >2 weeks. Update #projects registry.
If this becomes a paid engagement, graduate to #bc-{client}.
```

### Step 4 — Registry update
Add the project to #projects' `projects.md` registry.

### Step 5 — Readiness gate
Before any coding work begins, verify:
- [ ] Goal is defined (not TBD)
- [ ] Stack is chosen
- [ ] Repo exists and is accessible (if code project)
- [ ] Quality pipeline is configured
- [ ] CLAUDE.md has meaningful content (not just template placeholders)

If any item is missing, flag it. Don't block work entirely, but surface the gap clearly.

## New #bc-{client} scaffold

### Step 1 — Intake interview

1. **Client name:** Company or person name
2. **Scope:** What's the engagement about? One paragraph.
3. **Key contacts:** Who does Luka work with? Names and roles.
4. **Deliverables:** What's being delivered?
5. **Timeline:** Start date, end date or ongoing, milestones
6. **Communication preferences:** How does this client prefer updates? Email, Slack, calls?
7. **Rate/billing:** Hourly, fixed, retainer? (Store in #business, not here)

### Step 2 — Create group
Register group with folder `slack_bc-{clientname}`.

### Step 3 — CLAUDE.md template

```markdown
# {Client Name} — Engagement

## Client

- **Company:** {name}
- **Key contacts:** {names and roles}
- **Communication:** {preferences}
- **Started:** DD.MM.YYYY

## Scope

{One paragraph describing the engagement}

## Deliverables

- [ ] {deliverable 1}
- [ ] {deliverable 2}

## Timeline

{Key milestones and dates}

## Working agreements

- Status updates: {frequency and format}
- Approval process: {how decisions are made}
- Out of scope: {what's explicitly excluded}
```

### Step 4 — Initialize workspace

```
scope/
  original-scope.md    — locked copy of the agreed scope
  changes.md           — scope change log
deliverables/          — work products
pipeline/              — if client pipeline tracking needed
```

### Step 5 — Notify #business
Emit a `$financial` signal so #business tracks the new engagement for invoicing and compliance.

## Decommission workflow

When a project or engagement ends:

1. **Archive summary:** Create `archive-summary.md` with: what was done, outcome, key decisions, lessons learned
2. **Status update:** Mark as archived in #projects registry (for proj-{name}) or #business client list (for bc-{client})
3. **Open items:** Transfer any unresolved items to the appropriate group
4. **Signal:** Emit a signal to #main so the group hierarchy stays current
5. **Don't delete:** The group folder and its files remain for reference

## What you DON'T do

- Don't create groups without Luka's request — even if a project seems ready
- Don't modify another group's CLAUDE.md from here — scaffold creates the initial version, the group's own agent maintains it after
