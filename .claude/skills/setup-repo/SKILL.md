---
name: setup-repo
description: Set up a GitHub repo for an agent group. Creates OneCLI secrets, clones the repo, updates CLAUDE.md, and verifies access. Use when adding a new repo to an existing group, or when setting up a new coding-focused group.
---

# Set Up GitHub Repo for Agent Group

This skill connects a GitHub repository to a NanoClaw agent group so the agent can make code changes, open PRs, and work on the repo via chat.

---

## Phase 0: Gather information

Ask the user for:

1. **Which group?** List registered groups:
   ```bash
   cat data/nanoclaw.db 2>/dev/null || true
   ls groups/
   ```
   The user picks one, or names a new folder.

2. **Which repo?** Format: `OWNER/REPO` (e.g. `LukaHarambasic/harambasic.de`)

3. **GitHub token?** Ask if they already have a fine-grained PAT with access to this repo.

---

## Phase 1: Token guidance (if needed)

If the user does not have a token, guide them:

> Create a fine-grained PAT at: https://github.com/settings/personal-access-tokens/new
>
> **Required permissions:**
> - **Contents** — Read and Write
> - **Pull requests** — Read and Write
> - **Metadata** — Read
>
> **Scope:** Select the specific repository, or choose the whole org if the agent needs access to multiple repos under that org.
>
> Copy the token — you'll only see it once.

Wait for the user to provide the token.

---

## Phase 2: Preflight checks

```bash
# Check OneCLI is available
onecli version 2>/dev/null || echo "OneCLI not found — run /init-onecli first"

# Check group folder exists
ls -d groups/${FOLDER}/ 2>/dev/null || echo "Group folder missing"
```

If OneCLI is missing, stop and tell the user to run `/init-onecli`.
If the group folder doesn't exist, create it: `mkdir -p groups/${FOLDER}`

---

## Phase 3: Run setup script

```bash
bash scripts/setup-repo.sh \
  --owner "${OWNER}" \
  --repo "${REPO}" \
  --folder "${FOLDER}" \
  --token "${TOKEN}"
```

Parse the `STATUS:` lines in the output:
- `AGENT_CREATED` / `AGENT_EXISTS` — OneCLI agent is ready
- `SECRET_CREATED` / `SECRET_EXISTS` — GitHub PAT registered
- `SECRETS_ASSIGNED` — Secret linked to agent
- `REPO_CLONED` / `REPO_FETCHED` — Code is on disk
- `VERIFY_OK` — Git repo is valid

If any step fails, diagnose from the output and fix it. Common issues:
- `ONECLI_MISSING` → run `/init-onecli`
- `GROUP_MISSING` → create the folder
- `SECRET_CREATE_FAILED` → check token format
- `NO_GITHUB_SECRET` → re-run with `--token`

---

## Phase 4: Update CLAUDE.md

Read `groups/${FOLDER}/CLAUDE.md`.

**If the file does not exist**, create it from this template (adapt the name and scope):

```markdown
# Agentos — ${REPO}

You are Agentos, the coding assistant for ${OWNER}/${REPO}.

## How to Talk to Me

- Be concise. No preamble, no caveats.
- Lead with the answer or recommendation, then explain if needed.
- If unsure, say so in one sentence.
- Don't ask more than one question at a time.
- If a task is done, confirm briefly. Don't summarize what was asked.

**Don't:**
- No "Great question!" or "Absolutely!"
- No excessive bullet points when a sentence works
- No restating my question back to me
- No disclaimers about being an AI

**Links:** If you reference a resource — GitHub repo, doc, PR, anything with a URL — always include the link.

## Scope

Active coding work on ${OWNER}/${REPO}:
- Bug fixes, feature work, refactoring
- Code review and PR creation
- Dependency updates and maintenance

## Repo

**Repo:** \`${OWNER}/${REPO}\`

_(Fill in stack, package manager, deployment details after first inspection)_

## Lifecycle

This is a permanent project channel. Archive only if the project is sunset.
```

**If the file exists**, check for a `**Repo:**` line or `## Repo` section:
- If it already references this repo, no changes needed.
- If it references a different repo (multi-repo group), add this repo to the list.
- If no repo section exists, add one.

For **multi-repo groups**, use this format:

```markdown
## Repos

- \`${OWNER}/${REPO1}\` — Description
- \`${OWNER}/${REPO2}\` — Description
```

---

## Phase 5: Verify end-to-end

Tell the user:

> Setup complete. To verify, send a message in the group channel:
>
> _"Run the github-workflow pre-flight check for ${OWNER}/${REPO}"_
>
> The agent will test GitHub API access and git HTTPS through the OneCLI proxy.

---

## Phase 6: Summary

Print:

```
Setup complete:
  Group:    ${FOLDER}
  Agent:    ${AGENT_IDENTIFIER}
  Secret:   ${SECRET_NAME} (id: ${SECRET_ID})
  Repo:     ${OWNER}/${REPO}
  Path:     groups/${FOLDER}/repos/${OWNER}/${REPO}/
  CLAUDE.md: updated
```

---

## Multi-repo and org tokens

**Adding a second repo to the same group:**
Run `/setup-repo` again with the new repo. The script appends secrets — existing ones are preserved.

**Org-wide token (covers multiple repos):**
Run `/setup-repo` for the first repo with `--token`. For subsequent repos under the same org, run with `--skip-onecli` (the existing token already covers them):

```bash
bash scripts/setup-repo.sh \
  --owner "${OWNER}" \
  --repo "${SECOND_REPO}" \
  --folder "${FOLDER}" \
  --skip-onecli
```

Then update CLAUDE.md to list all repos.

---

## Troubleshooting

**Clone fails (private repo, no token):** The host doesn't use OneCLI proxy. Re-run with `--token`.

**Agent can't auth inside container:** Check `onecli agents secrets --id <AGENT_ID>` — the GitHub secret must be assigned. Check `onecli secrets list` — it must have `hostPattern: "github.com"`.

**Multiple tokens for same host:** OneCLI injects whichever secret matches the host pattern. If you have multiple `github.com` secrets on one agent, the proxy picks one. For distinct repos, use one fine-grained PAT per repo, or one org-level token.
