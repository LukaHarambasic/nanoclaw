---
name: gws-sheets
description: Create and read Google Sheets. Use when the user needs tabular data, lists, trackers, budgets, or calculations. For prose documents use gws-docs; for presentations use gws-slides.
---

# Google Sheets — Create & Read

You have the `gws` CLI for Google Sheets. Run `gws sheets --help` to see all Discovery methods and helpers.

## When to use this skill

- Structured/tabular data: lists, budgets, trackers, invoices, schedules
- Anything with rows and columns
- Data that will be calculated, sorted, or filtered

For prose content → use `gws-docs`. For presentations → use `gws-slides`.

## Helper commands

| Command | Description |
|---------|-------------|
| `gws sheets +read` | Read values from a spreadsheet range |
| `gws sheets +append` | Append a row to a spreadsheet |

## Common commands

```bash
# Create a new spreadsheet
gws sheets spreadsheets create --body '{"properties": {"title": "Sheet Title"}}'

# Read values from a range
gws sheets +read --spreadsheet-id SHEET_ID --range "Sheet1!A1:D10"

# Append a row
gws sheets +append --spreadsheet-id SHEET_ID --values "Alice,42,2026-04-03"

# Get spreadsheet metadata and structure
gws sheets spreadsheets get --spreadsheetId SHEET_ID

# Get spreadsheet with grid data (includes cell values)
gws sheets spreadsheets get --spreadsheetId SHEET_ID --includeGridData true

# Apply bulk updates (formatting, formulas, structure)
gws sheets spreadsheets batchUpdate --spreadsheetId SHEET_ID --body '{
  "requests": [
    {
      "updateCells": {
        "range": {"sheetId": 0, "startRowIndex": 0, "endRowIndex": 1},
        "rows": [{"values": [{"userEnteredValue": {"stringValue": "Header"}}]}],
        "fields": "userEnteredValue"
      }
    }
  ]
}'

# Read values via the values sub-resource
gws sheets spreadsheets values get --spreadsheetId SHEET_ID --range "Sheet1!A:Z"
```

## Workflow

1. Create the spreadsheet: `gws sheets spreadsheets create` → get `spreadsheetId` from response
2. Write data: use `+append` for adding rows, `spreadsheets values batchUpdate` for bulk writes, or `batchUpdate` for formatting
3. Return the sheet URL to the user

## Output

Always return the spreadsheet URL after creating or writing:
```
https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit
```

## Schema discovery

```bash
# Inspect batchUpdate request types
gws schema sheets.spreadsheets.batchUpdate

# See all values methods
gws sheets spreadsheets values --help
```

## Troubleshooting

If `gws` returns an auth error, tell the user to run on the host:
```bash
gws auth login
gws auth export --unmasked > ~/.config/gws/credentials.json
```
Then restart NanoClaw so the updated file is mounted into containers.
