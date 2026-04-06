---
name: notes
description: Manages topical note files in /workspace/group/notes/. One markdown file per topic — restaurants, links, findings, thoughts, snippets. The user is the audience.
---

# Notes — Topical Reference Files

Each group maintains a `notes/` folder at `/workspace/group/notes/` for things worth remembering. One file per topic, free-form markdown.

## File structure

```
notes/
  restaurants.md          ← restaurants to visit
  copenhagen-events.md    ← things to do in Copenhagen
  interesting-links.md    ← articles, tools, resources
  project-ideas.md        ← thoughts and ideas
  {any-topic}.md          ← agent creates as needed
```

File names use lowercase-hyphenated slugs: `restaurants.md`, `copenhagen-events.md`, `interesting-links.md`.

## Entry format

Each entry has a heading with title and date, followed by free-form content:

```markdown
# Restaurants to Visit

## Amass — 04.04.2026
Refshaleøen. Nordic fine dining, open-fire kitchen. Mentioned by @Anders.

## Juno the Bakery — 02.04.2026
Østerbro. Sourdough pastries. Weekend only.

## Manfreds — 01.04.2026
Jaegersborggade. Natural wine bar with set menu. Book ahead.
```

- `## Title — DD.MM.YYYY` heading (title + date added)
- Body is free-form — one line, a paragraph, a list, a quote, whatever fits
- `@Name` for people references
- New entries are appended at the bottom of the file
- Entries can be updated or extended later (add info below the original)

## Creating and organizing notes

- Create new topic files as topics emerge. Be specific: `restaurants.md` not `food.md`.
- Append to existing files when a new entry fits an existing topic.
- If a file grows past ~200 entries, split into subtopics (e.g., `restaurants-copenhagen.md`, `restaurants-travel.md`).
- The `# Title` at the top of each file should match the topic (e.g., `# Restaurants to Visit`, `# Interesting Links`).

## When to write

- User says "remember this", "save this", "note this down"
- A recommendation, tip, or interesting find comes up in conversation
- Research produces findings worth keeping
- A link, article, or resource is worth revisiting later
- A snippet from a document should be preserved
- A thought or observation is worth revisiting
- Lists of things (places to visit, books to read, tools to try)

## When NOT to write

- Tasks and todos (those go in tracker.md)
- Agent decisions and operational logs (those go in log/)
- Things only useful for the current conversational turn
- Information already in a durable document elsewhere

## Creating the notes folder

If `notes/` does not exist, create it:

```bash
mkdir -p /workspace/group/notes
```

## Search patterns

```bash
# Find all notes mentioning a person
grep -r '@Anders' /workspace/group/notes/

# List all note topics
ls /workspace/group/notes/

# Search across all notes for a keyword
grep -ri 'sourdough' /workspace/group/notes/

# Cross-group search (main group only)
grep -r 'keyword' /workspace/project/groups/*/notes/

# Find all entries added on a specific date
grep -r '04\.04\.2026' /workspace/group/notes/
```
