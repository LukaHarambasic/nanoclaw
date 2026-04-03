---
name: gws-docs
description: Create and read Google Docs. Use when the user needs a document written in prose — reports, briefs, memos, letters, write-ups. For tabular data use gws-sheets; for slides use gws-slides.
---

# Google Docs — Create & Read

You have the `gws` CLI for Google Docs. Run `gws docs --help` to see all Discovery methods and helpers.

## When to use this skill

- Unstructured prose: reports, memos, letters, summaries, write-ups
- Documents meant to be shared, printed, or exported as PDF
- Long-form content with paragraphs and headings

For tabular data → use `gws-sheets`. For presentations → use `gws-slides`.

## Helper commands

| Command | Description |
|---------|-------------|
| `gws docs +write` | Append text to an existing document |

## Common commands

```bash
# Create a new blank document
gws docs documents create --body '{"title": "Document Title"}'

# Get document content and structure
gws docs documents get --documentId DOC_ID

# Append text to a document (simplest write path)
gws docs +write --document-id DOC_ID --text "Text to append"

# Apply structured updates (formatting, insertions, deletions)
gws docs documents batchUpdate --documentId DOC_ID --body '{
  "requests": [
    {
      "insertText": {
        "location": {"index": 1},
        "text": "Content here\n"
      }
    }
  ]
}'
```

## Workflow

1. Create the document: `gws docs documents create` → get `documentId` from response
2. Write content: use `+write` for simple text appending, or `batchUpdate` for structured content with formatting
3. Return the document URL to the user

## Output

Always return the document URL after creating or writing:
```
https://docs.google.com/document/d/{documentId}/edit
```

## Schema discovery

```bash
# Inspect available batchUpdate request types
gws schema docs.documents.batchUpdate

# See all document methods
gws docs documents --help
```

## Troubleshooting

If `gws` returns an auth error, tell the user to run on the host:
```bash
gws auth login
gws auth export --unmasked > ~/.config/gws/credentials.json
```
Then restart NanoClaw so the updated file is mounted into containers.
