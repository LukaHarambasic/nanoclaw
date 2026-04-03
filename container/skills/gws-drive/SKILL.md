---
name: gws-drive
description: Browse, search, and upload files in Google Drive. Use for finding documents, listing folder contents, getting file metadata, or uploading local files to Drive.
---

# Google Drive — Browse & Upload

You have the `gws` CLI for Google Drive. Run `gws drive --help` to see all Discovery methods and helpers.

## Helper commands

| Command | Description |
|---------|-------------|
| `gws drive +upload` | Upload a local file with automatic metadata |

## Common commands

```bash
# List files (most recent first)
gws drive files list --orderBy modifiedTime desc --pageSize 20

# Search files by name
gws drive files list --q "name contains 'report'"

# List files in a specific folder
gws drive files list --q "'FOLDER_ID' in parents"

# Search by type (Google Docs, Sheets, Slides, etc.)
gws drive files list --q "mimeType='application/vnd.google-apps.document'"
gws drive files list --q "mimeType='application/vnd.google-apps.spreadsheet'"
gws drive files list --q "mimeType='application/vnd.google-apps.presentation'"

# Get file metadata
gws drive files get --fileId FILE_ID

# Get file with specific fields
gws drive files get --fileId FILE_ID --fields "id,name,mimeType,modifiedTime,webViewLink,parents"

# Upload a local file
gws drive +upload ./report.pdf --name "Q1 Report"

# Upload to a specific folder
gws drive +upload ./report.pdf --name "Q1 Report" --parent FOLDER_ID
```

## MIME types reference

| Type | MIME type |
|------|-----------|
| Google Doc | `application/vnd.google-apps.document` |
| Google Sheet | `application/vnd.google-apps.spreadsheet` |
| Google Slides | `application/vnd.google-apps.presentation` |
| Google Folder | `application/vnd.google-apps.folder` |
| PDF | `application/pdf` |

## Workflow

1. Search or list to find a file → get `fileId`
2. Use `files get` to retrieve metadata including `webViewLink` for the shareable URL
3. For uploads: `+upload` handles metadata automatically

## Output

`gws` outputs JSON. For file listings, extract `id`, `name`, `mimeType`, `modifiedTime`, and `webViewLink`. Present as a scannable list.

## Pagination

```bash
# Fetch all results
gws drive files list --q "name contains 'budget'" --page-all

# Cap at 3 pages
gws drive files list --page-limit 3
```

## Troubleshooting

If `gws` returns an auth error, tell the user to run on the host:
```bash
gws auth login
gws auth export --unmasked > ~/.config/gws/credentials.json
```
Then restart NanoClaw so the updated file is mounted into containers.
