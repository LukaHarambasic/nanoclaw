---
name: gws-calendar
description: Read-only Google Calendar access. Use for checking agenda, listing upcoming events, querying free/busy time, or looking up calendar details — across work-emaps, bc-sagava, and personal accounts.
---

# Google Calendar — Read-Only Access

You have the `gws` CLI for read-only calendar access. Run `gws calendar --help` to see all Discovery methods and helpers.

## IMPORTANT: Read-only constraint

NEVER create, modify, or delete events. NEVER use `+insert` or any write method (`events insert`, `events update`, `events patch`, `events delete`). If the user asks you to create or modify a calendar event, tell them you only have read access and they must do it manually or confirm before you draft anything.

## Account

Personal Google account credentials are mounted (bc-admin uses the same account). Omit `--profile` — the default credential is used.

Work (work-emaps) and bc-sagava credentials are not currently configured.

## Helper commands

| Command | Description |
|---------|-------------|
| `gws calendar +agenda` | Show upcoming events (timezone-aware; override with `--timezone`) |
| ~~`gws calendar +insert`~~ | ~~Create an event~~ — **NEVER use** |

## Common commands

```bash
# Today's agenda
gws calendar +agenda

# Agenda for a specific timezone
gws calendar +agenda --timezone Europe/Copenhagen

# List events in a time range
gws calendar events list --calendarId primary --timeMin 2026-04-01T00:00:00Z --timeMax 2026-04-07T23:59:59Z

# Search for events by keyword
gws calendar events list --calendarId primary --q "standup"

# List all calendars on the account
gws calendar calendarList list

# Check free/busy for a time window
gws calendar freebusy query --body '{"timeMin":"2026-04-03T08:00:00Z","timeMax":"2026-04-03T18:00:00Z","items":[{"id":"primary"}]}'
```

## Output

`gws` outputs JSON. Parse the response to extract `summary`, `start.dateTime`, `end.dateTime`, `attendees`, and `htmlLink`. Present events in a clear, scannable list.

## Pagination

```bash
# Fetch all events (no page cap)
gws calendar events list --calendarId primary --timeMin ... --page-all

# Limit to 2 pages (default page size is 10 events)
gws calendar events list --calendarId primary --page-limit 2
```

## Troubleshooting

If `gws` returns an auth error, tell the user to run on the host:
```bash
gws auth login
gws auth export --unmasked > ~/.config/gws/credentials.json
```
Then restart NanoClaw so the updated file is mounted into containers.
