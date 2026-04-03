---
name: gws-mail
description: Gmail read + draft access. Use for reading, searching, triaging, and drafting emails — across work-emaps, bc-sagava, and personal accounts. Never sends or deletes.
---

# Gmail — Read + Draft Only

You have the `gws` CLI for Gmail access. Run `gws gmail --help` to see all Discovery methods and helpers.

## CRITICAL: Never send or delete

**NEVER** use `+send`, `+reply`, `+reply-all`, `+forward`, or any delete/trash method. These are absolutely forbidden.

The maximum write action allowed is saving a **draft** to the Drafts folder. The user must open Gmail and send it manually.

If the user asks you to send an email, tell them: "I can create a draft and save it to your Drafts folder — you'll need to send it yourself."

## Account

Personal Google account credentials are mounted (bc-admin uses the same account). Omit `--profile` — the default credential is used.

Work (work-emaps) and bc-sagava credentials are not currently configured.

## Helper commands

| Command | Status | Description |
|---------|--------|-------------|
| `gws gmail +triage` | ✓ allowed | Show unread inbox summary (sender, subject, date) |
| `gws gmail +watch` | ✓ allowed | Stream new emails as NDJSON |
| ~~`gws gmail +send`~~ | ✗ forbidden | Send email |
| ~~`gws gmail +reply`~~ | ✗ forbidden | Reply to a message |
| ~~`gws gmail +reply-all`~~ | ✗ forbidden | Reply-all |
| ~~`gws gmail +forward`~~ | ✗ forbidden | Forward a message |

## Common commands

```bash
# Triage: show unread inbox summary
gws gmail +triage

# List recent messages
gws gmail messages list --userId me --maxResults 10

# Search emails
gws gmail messages list --userId me --q "from:client@example.com subject:invoice"

# Read a specific message
gws gmail messages get --userId me --id MESSAGE_ID

# Read full message with body (use +read helper)
gws gmail +read --message-id MESSAGE_ID

# Watch for new emails (streams NDJSON)
gws gmail +watch

# List labels
gws gmail labels list --userId me

# Create a draft (ONLY allowed write operation)
gws gmail drafts create --userId me --body '{
  "message": {
    "raw": "<base64-encoded RFC 2822 message>"
  }
}'
```

## Drafting emails

To create a draft, encode the email as RFC 2822 and base64-url encode it. Construct:

```
To: recipient@example.com
From: your@email.com
Subject: Subject here
Content-Type: text/plain

Body text here.
```

Then base64-url encode (replace `+` with `-`, `/` with `_`, strip `=`). Pass as the `raw` field.

Always confirm with the user what address and content to use before creating a draft.

## Pagination

```bash
# Fetch all messages matching a query
gws gmail messages list --userId me --q "label:inbox" --page-all

# Cap at 3 pages
gws gmail messages list --userId me --page-limit 3
```

## Troubleshooting

If `gws` returns an auth error, tell the user to run on the host:
```bash
gws auth login
gws auth export --unmasked > ~/.config/gws/credentials.json
```
Then restart NanoClaw so the updated file is mounted into containers.
