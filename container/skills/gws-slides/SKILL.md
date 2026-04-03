---
name: gws-slides
description: Create and read Google Slides presentations. Use when the user needs slides, a deck, or a visual presentation. For prose use gws-docs; for tabular data use gws-sheets.
---

# Google Slides — Create & Read

You have the `gws` CLI for Google Slides. Run `gws slides --help` to see all Discovery methods.

## When to use this skill

- Visual presentations, decks, pitch slides
- Content that needs slides with titles, bullet points, images
- Anything the user will present or share as a slide deck

For prose content → use `gws-docs`. For tabular data → use `gws-sheets`.

## Common commands

```bash
# Create a new presentation
gws slides presentations create --body '{"title": "Presentation Title"}'

# Get presentation content and structure
gws slides presentations get --presentationId PRES_ID

# Get a specific page/slide
gws slides presentations pages get --presentationId PRES_ID --pageObjectId PAGE_ID

# Apply updates: add slides, insert text, images, shapes
gws slides presentations batchUpdate --presentationId PRES_ID --body '{
  "requests": [
    {
      "createSlide": {
        "insertionIndex": 1,
        "slideLayoutReference": {"predefinedLayout": "TITLE_AND_BODY"}
      }
    }
  ]
}'
```

## Workflow

1. Create the presentation: `gws slides presentations create` → get `presentationId` from response
2. Get the structure: `presentations get` to see existing slide IDs and placeholder IDs
3. Add content via `batchUpdate` — all content changes go through this method
4. Return the presentation URL to the user

## Common batchUpdate requests

Add a slide:
```json
{"createSlide": {"insertionIndex": 1, "slideLayoutReference": {"predefinedLayout": "TITLE_AND_BODY"}}}
```

Insert text into a placeholder:
```json
{"insertText": {"objectId": "PLACEHOLDER_ID", "insertionIndex": 0, "text": "Slide title"}}
```

Delete a slide:
```json
{"deleteObject": {"objectId": "SLIDE_ID"}}
```

Available predefined layouts: `BLANK`, `CAPTION_ONLY`, `TITLE`, `TITLE_AND_BODY`, `TITLE_AND_TWO_COLUMNS`, `TITLE_ONLY`, `SECTION_HEADER`, `SECTION_TITLE_AND_DESCRIPTION`, `ONE_COLUMN_TEXT`, `MAIN_POINT`, `BIG_NUMBER`.

## Output

Always return the presentation URL after creating or writing:
```
https://docs.google.com/presentation/d/{presentationId}/edit
```

## Schema discovery

```bash
# Inspect batchUpdate request types
gws schema slides.presentations.batchUpdate

# See all presentation methods
gws slides presentations --help
```

## Troubleshooting

If `gws` returns an auth error, tell the user to run on the host:
```bash
gws auth login
gws auth export --unmasked > ~/.config/gws/credentials.json
```
Then restart NanoClaw so the updated file is mounted into containers.
