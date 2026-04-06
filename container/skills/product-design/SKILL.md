---
name: product-design
description: Product design and system architecture. Design briefs, UX flows, visual critique, architecture decision records. Self-gating — only activates for slack_work, slack_harambasicde, slack_proj-folio, slack_proj-meyster.
---

# Product Design

**Activation check:** Only use this skill if the group folder is one of: `slack_work`, `slack_harambasicde`, `slack_proj-folio`, `slack_proj-meyster`. Check with:

```bash
basename $(readlink -f /workspace/group 2>/dev/null || echo /workspace/group)
```

If the folder does not match, ignore this skill entirely.

## Role

You bring structured design thinking — both UI/UX and system architecture — before implementation begins. In #work, you help shape product features at Electricity Maps. In code groups, you ensure design-first development: goal and audience understood, architecture decided, then code.

## Workspace structure

Maintain files in `/workspace/group/design/`:

```
design/
  briefs/            — design briefs per feature or project
  architecture/      — system architecture specs and ADRs
  flows/             — UX flow maps
  critiques/         — visual and UX review notes
```

## Design brief protocol

Before any design or implementation work, create a design brief:

```markdown
# Design Brief — [Feature/Project name]

## Goal
What is this trying to achieve? One sentence.

## Audience
Who is this for? Be specific — role, context, expertise level.

## Constraints
- Technical: [platform, performance, existing systems]
- Business: [timeline, budget, brand guidelines]
- User: [accessibility requirements, device context, familiarity]

## Current state
What exists today? What's the starting point?

## Proposed direction

### Information architecture
- What are the key objects/entities?
- How do they relate?
- What's the navigation structure?

### Layout approach
- [Option A]: description, trade-offs
- [Option B]: description, trade-offs
- Recommendation and why

### Typography & color
- Typography system: headings, body, captions, code
- Color system: primary, secondary, semantic (success/warning/error), neutral scale
- Dark mode considerations if applicable

### Component inventory
| Component | Purpose | Variants | Notes |
|-----------|---------|----------|-------|
| [name] | [what it does] | [states/sizes] | [considerations] |

## Accessibility
- WCAG 2.1 AA as minimum
- Keyboard navigation requirements
- Screen reader considerations
- Color contrast requirements (4.5:1 text, 3:1 large text)

## Open questions
- [Design decision that needs input]
```

## System architecture spec

For features or projects that need architectural decisions:

```markdown
# Architecture — [Feature/Project name]

## Overview
What does this system do? One paragraph.

## Component boundaries
| Component | Responsibility | Inputs | Outputs |
|-----------|---------------|--------|---------|
| [name] | [what it owns] | [what it receives] | [what it produces] |

## Data flow
Describe how data moves through the system. Include:
- Entry points (user actions, API calls, events)
- Processing steps
- Storage locations
- Output/display

## State management
- What state exists? Where does it live?
- Server vs. client state boundaries
- Caching strategy if applicable

## API design (if applicable)
Key endpoints or interfaces with request/response shapes.

## Trade-offs
| Decision | Chosen approach | Alternative | Why this one |
|----------|----------------|-------------|-------------|
| [area] | [what we're doing] | [what we considered] | [reasoning] |
```

## UX flow mapping

When designing user-facing features:

```markdown
# UX Flow — [Feature name]

## Happy path
1. User [action] → sees [result]
2. User [action] → system [response]
3. ...

## Edge cases
| Scenario | Expected behavior | Notes |
|----------|------------------|-------|
| Empty state | [what user sees] | First-time experience |
| Error state | [what user sees] | [recovery path] |
| Loading state | [what user sees] | [skeleton/spinner/etc.] |
| Permission denied | [what user sees] | [how to get access] |

## Friction points
- [Step where users might get confused or drop off]
- [Potential improvement]

## Mobile considerations
- [How this flow adapts to smaller screens]
```

## Visual critique framework

When reviewing existing designs or implementations:

### Checklist
| Criterion | Status | Notes |
|-----------|--------|-------|
| **Hierarchy:** Is the most important thing the most prominent? | | |
| **Whitespace:** Does spacing create clear groupings? | | |
| **Contrast:** Text readable? Interactive elements distinguishable? | | |
| **Alignment:** Elements aligned to a consistent grid? | | |
| **Consistency:** Same patterns for same actions throughout? | | |
| **Accessibility:** WCAG 2.1 AA met? Keyboard navigable? | | |
| **Responsive:** Works at mobile, tablet, desktop? | | |
| **Loading:** Graceful loading states? No layout shift? | | |

### Output
Present as: what works, what needs attention, and specific suggestions (not vague "make it better").

## Architecture Decision Records (ADRs)

For significant architectural decisions, create `design/architecture/ADR-NNN-title.md`:

```markdown
# ADR-NNN: [Decision title]

**Date:** DD.MM.YYYY
**Status:** Proposed / Accepted / Deprecated / Superseded

## Context
What is the situation? What forces are at play?

## Options considered
1. **[Option A]:** description, pros, cons
2. **[Option B]:** description, pros, cons

## Decision
What did we decide and why?

## Consequences
- [Positive consequence]
- [Negative consequence or trade-off]
- [What this enables or prevents in the future]
```

ADRs are written BEFORE implementation, not after. They capture the reasoning so future-you understands why.

## Context-specific behavior

### In #work (Electricity Maps)
Focus on product design: feature design briefs, user flow for product features, data visualization design for energy/carbon data, dashboard layouts. Reference `pm-specs` skill for spec handoff.

### In code groups (#harambasicde, #proj-folio, #proj-meyster)
Focus on implementation design: component architecture, page layouts, system architecture. Reference `github-workflow` skill for implementation handoff. Design brief should be approved before coding begins.

## Design system extraction

When Luka provides reference screenshots, mockups, or existing UIs to match:

### What to extract
1. **Color palette:** Primary, secondary, accent, functional (success/warning/error), backgrounds, dark mode variants — capture as hex values
2. **Typography:** Font families, sizes (heading/body/caption/code), weights, line heights
3. **Spacing system:** Base unit (usually 4px or 8px), scale from tight to loose
4. **Component styles:** Buttons (primary/secondary/ghost), cards, inputs, icons, navigation patterns
5. **Elevation and depth:** Shadows, borders, layering
6. **Motion:** Transition durations, easing curves, animation patterns

### Output format
Document as a design system reference in `design/system.md`:
```markdown
## Colors
| Role | Light | Dark |
|------|-------|------|
| Primary | #XXXX | #XXXX |
| ...

## Typography
| Style | Font | Size | Weight | Line height |
|-------|------|------|--------|-------------|
| H1 | ... | ... | ... | ... |

## Spacing
Base: Xpx. Scale: 4, 8, 12, 16, 24, 32, 48

## Components
[Per component: variants, states, dimensions]
```

Use specific values (hex codes, px sizes), not vague descriptions. This becomes the source of truth for implementation.

## Diagramming

When architecture or flows need visualization, use Mermaid syntax:

```mermaid
graph TD
    A[User Action] --> B{Decision}
    B -->|Yes| C[Outcome 1]
    B -->|No| D[Outcome 2]
```

Useful for: component relationships, data flow, user journeys, state machines, sequence diagrams. Include diagrams in architecture specs and ADRs where they clarify structure.

## What you DON'T do

- Don't skip to visual details before information architecture is established
- Don't produce abstract design philosophy without concrete, actionable specifications
- Don't design in isolation — ask about goal, audience, and constraints first
- Don't ignore existing patterns in the codebase — check what's already built before proposing new components
