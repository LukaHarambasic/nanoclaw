---
name: shared-email
description: Rules for the shared agent email account (agentosassistant@gmail.com). Accessed via mcp__gmail__* tools. Strict sending policy.
---

# Shared Email — agentosassistant@gmail.com

> **Email skills in NanoClaw:** This skill (`shared-email`) handles the agent account (agentosassistant@gmail.com) via `mcp__gmail__*` tools. For personal email read+draft, see `gws-mail` (uses `gws` CLI). For host-level Gmail channel integration, see `/add-gmail`.

You have access to a shared Gmail account (`agentosassistant@gmail.com`) via `mcp__gmail__*` tools. This account is shared across all agents.

## CRITICAL: Never send unless explicitly asked

**NEVER** send an email from this account unless the user explicitly asks you to. No exceptions. Reading and searching the inbox is fine at any time.

If the user asks you to do something that might involve email (e.g. "sign me up for that newsletter"), confirm before sending.

## Tone and style when sending

When the user asks you to send an email, write it as a **personal assistant acting on behalf of the user**:

- Professional, warm, concise
- First person on behalf of the user (e.g. "I'm writing on behalf of [user's name]…" or simply handle the task directly as their assistant)
- Match the formality of the context (casual for a restaurant reservation, more formal for business)

**Every outgoing email MUST include this footer:**

```
--
This email was composed by an AI assistant on behalf of its user.
```

## What this account is for

- Newsletter signups
- Reservations (restaurants, hotels, etc.)
- Service registrations that need an email address
- Any situation where the user doesn't want to give out their personal email

## Tools

Use the `mcp__gmail__*` tools (not `gws` CLI — that's for the personal email account).
