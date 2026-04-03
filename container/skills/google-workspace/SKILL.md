---
name: google-workspace
description: Read-only access to Google Workspace (Gmail, Calendar, Drive, Sheets, Docs) via the gws CLI. Use when the user asks about emails, calendar events, files, or documents.
---

# Google Workspace — Read-Only Access

You have the `gws` CLI installed for read-only access to the user's Google Workspace account. Authentication is pre-configured via environment variable.

## IMPORTANT: Read-only restriction

You MUST only use read/list/get/search commands. NEVER use commands that create, send, delete, update, insert, forward, reply, or modify data. If the user asks you to send an email or create a calendar event, explain that you only have read access and suggest they do it manually.

## Common commands

### Gmail

```bash
# List recent messages
gws gmail messages list --userId me --maxResults 10

# Read a specific message
gws gmail messages get --userId me --id MESSAGE_ID

# Search emails
gws gmail messages list --userId me --q "from:someone@example.com subject:meeting"

# Quick inbox triage (summary of unread)
gws gmail +triage
```

### Calendar

```bash
# Today's agenda
gws calendar +agenda

# List events in a time range
gws calendar events list --calendarId primary --timeMin 2026-03-31T00:00:00Z --timeMax 2026-04-01T00:00:00Z

# Search for specific events
gws calendar events list --calendarId primary --q "standup"

# List all calendars
gws calendar calendarList list
```

### Drive

```bash
# List files
gws drive files list --q "name contains 'report'"

# Get file metadata
gws drive files get --fileId FILE_ID

# List files in a folder
gws drive files list --q "'FOLDER_ID' in parents"
```

### Sheets

```bash
# Read sheet data
gws sheets +read --spreadsheetId SHEET_ID --range "Sheet1!A1:D10"
```

### Docs

```bash
# Get document content
gws docs documents get --documentId DOC_ID
```

## Output format

`gws` outputs structured JSON (NDJSON for paginated results). Parse the JSON to extract relevant information and present it clearly to the user.

## Pagination

For large result sets, use `--page-all` to fetch all pages, or `--page-limit N` to cap the number of pages.

## Troubleshooting

If `gws` returns an authentication error, the credentials file may need refreshing. Tell the user to run on the host:
```bash
gws auth login
gws auth export --unmasked > ~/.config/gws/credentials.json
```
Then restart NanoClaw so the updated file is mounted into containers.
