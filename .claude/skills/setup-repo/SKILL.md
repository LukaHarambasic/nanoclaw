---
name: setup-repo
description: Set up a GitHub repo for an agent group. Creates OneCLI secrets, clones the repo, updates CLAUDE.md, and verifies access. Use when adding a new repo to an existing group, or when setting up a new coding-focused group.
---

# Set Up GitHub Repo for Agent Group

This skill connects a GitHub repository to a NanoClaw agent group so the agent can make code changes, open PRs, and work on the repo via chat.

---

## Critical: OneCLI Host Pattern Matching

OneCLI uses **exact** host matching — `github.com` does NOT match `api.github.com`. Two separate secrets are required:

| Secret | hostPattern | Purpose | Auth format |
|--------|-------------|---------|-------------|
| Git HTTPS | `github.com` | git clone/fetch/push | `Basic {base64(x-access-token:PAT)}` |
| GitHub API | `api.github.com` | gh CLI, curl to API | `token {raw-PAT}` |

The OneCLI proxy operates in two modes per host:
- **MITM mode** — when a secret matches the host, the proxy intercepts TLS, decrypts, injects the `Authorization` header, re-encrypts. This is what makes git and gh work.
- **Tunnel mode** — when no secret matches, the proxy passes traffic through unchanged. Requests will fail auth.

**Order of secrets does not matter** — each matches a different host, so there's no conflict.

---

## Phase 0: Gather information

Ask the user for:

1. **Which group?** List registered groups:
   ```bash
   ls groups/
   ```
   The user picks one, or names a new folder.

2. **Which repo?** Format: `OWNER/REPO` (e.g. `LukaHarambasic/meyster`)

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

## Phase 3: Create OneCLI secrets

The `setup-repo.sh` script handles agent creation and repo cloning, but **secrets must be created manually** because the script's generic secret creation doesn't set the correct injection config.

### Step 3a: Create or find the OneCLI agent

```bash
# Derive agent identifier from folder name (underscores → hyphens)
AGENT_IDENTIFIER="${FOLDER//_/-}"

# Check if agent exists
onecli agents list | jq -r --arg id "$AGENT_IDENTIFIER" '.[] | select(.identifier == $id) | .id'

# If not, create it
onecli agents create --name "${FOLDER}" --identifier "${AGENT_IDENTIFIER}"
onecli agents set-secret-mode --id "${AGENT_ID}" --mode selective
```

### Step 3b: Create the git HTTPS secret (github.com)

The user must run this — the PAT must not be visible to Claude:

```bash
TOKEN="<user's PAT>"
BASIC=$(echo -n "x-access-token:${TOKEN}" | base64 -w0)
onecli secrets create \
  --name "GitHub git (${OWNER}/${REPO})" \
  --type generic \
  --value "${BASIC}" \
  --header-name "Authorization" \
  --value-format "Basic {value}" \
  --host-pattern "github.com"
```

### Step 3c: Create the GitHub API secret (api.github.com)

```bash
onecli secrets create \
  --name "GitHub API (${OWNER}/${REPO})" \
  --type generic \
  --value "${TOKEN}" \
  --header-name "Authorization" \
  --value-format "token {value}" \
  --host-pattern "api.github.com"
```

### Step 3d: Assign secrets to agent

```bash
# Get existing secret IDs
EXISTING=$(onecli agents secrets --id "${AGENT_ID}" | jq -r '.[]' | tr '\n' ',')

# Append the two new secret IDs
onecli agents set-secrets --id "${AGENT_ID}" \
  --secret-ids "${EXISTING}${GIT_SECRET_ID},${API_SECRET_ID}"
```

---

## Phase 4: Clone the repo

```bash
bash scripts/setup-repo.sh \
  --owner "${OWNER}" \
  --repo "${REPO}" \
  --folder "${FOLDER}" \
  --skip-onecli
```

Use `--skip-onecli` because we already handled secrets manually in Phase 3.

Parse the `STATUS:` lines in the output:
- `REPO_CLONED` / `REPO_FETCHED` — Code is on disk
- `VERIFY_OK` — Git repo is valid

---

## Phase 5: Update CLAUDE.md

Read `groups/${FOLDER}/CLAUDE.md`.

**If the file does not exist**, create it from this template (adapt the name and scope):

```markdown
# Agentos — ${REPO}

You are Agentos, the coding assistant for ${OWNER}/${REPO}.

## Project

- **Goal:** TBD
- **Stack:** TBD
- **Repo:** `${OWNER}/${REPO}`
- **Path:** `repos/${OWNER}/${REPO}/`
- **Status:** Active (since DD.MM.YYYY)

## Scope

This channel handles active development work on ${REPO}. Planning and registry stays in #projects.

## Safety

- NEVER push to main — use `agent/slack_proj-${REPO}/` branches
- NEVER force-push
- NEVER merge PRs — only Luka merges
- Present plan → wait for approval → implement → validate → push → open PR

## Lifecycle

Archive this channel if work pauses for >2 weeks. Update #projects registry.
```

**If the file exists**, check for a `**Repo:**` line or `## Repo` section:
- If it already references this repo, no changes needed.
- If it references a different repo (multi-repo group), add this repo to the list.
- If no repo section exists, add one.

---

## Phase 6: Verify end-to-end

Tell the user to send these test commands in the group's Slack channel:

```
Run these checks and report results:
1. git ls-remote https://github.com/${OWNER}/${REPO}.git HEAD
2. gh api /repos/${OWNER}/${REPO} --jq .full_name
3. gh --version
```

Expected results:
- **git ls-remote** ✓ — returns a commit hash (proves git HTTPS + OneCLI proxy MITM on `github.com`)
- **gh api** ✓ — returns `${OWNER}/${REPO}` (proves gh CLI + OneCLI proxy MITM on `api.github.com`)
- **gh --version** ✓ — shows version (proves gh is installed in container)

If git works but gh fails with "not authenticated": check that the `api.github.com` secret exists and is assigned to the agent.

If git fails with "terminal prompts disabled": check that the `github.com` secret exists, uses `Basic {value}` format with base64-encoded `x-access-token:PAT`, and is assigned to the agent.

---

## Phase 7: Summary

Print:

```
Setup complete:
  Group:      ${FOLDER}
  Agent:      ${AGENT_IDENTIFIER} (id: ${AGENT_ID})
  Secrets:    GitHub git (github.com) + GitHub API (api.github.com)
  Repo:       ${OWNER}/${REPO}
  Path:       groups/${FOLDER}/repos/${OWNER}/${REPO}/
  CLAUDE.md:  updated
  git HTTPS:  ✓
  gh CLI:     ✓
```

---

## How it all works (reference)

### Container auth flow

1. **Container startup** (`src/container-runner.ts`):
   - `onecli.applyContainerConfig()` injects proxy env vars: `HTTPS_PROXY`, `HTTP_PROXY`, `GIT_SSL_CAINFO`, `GIT_HTTP_PROXY_AUTHMETHOD=basic`
   - Also injects `GH_TOKEN=proxy-managed` — a placeholder so `gh` CLI doesn't refuse to run
   - The proxy's CA cert is mounted so TLS verification passes for MITM connections

2. **Git operations** (clone, fetch, push):
   - Git reads `HTTPS_PROXY` and routes through OneCLI proxy
   - Proxy matches `github.com` → MITM mode → injects `Authorization: Basic <base64>` header
   - GitHub authenticates the request, git succeeds

3. **gh CLI operations** (pr create, api calls):
   - `gh` sees `GH_TOKEN=proxy-managed` and uses it as auth
   - `gh` routes through `HTTPS_PROXY` to OneCLI proxy
   - Proxy matches `api.github.com` → MITM mode → **replaces** the Authorization header with `Authorization: token <real-PAT>`
   - GitHub authenticates with the real token, gh succeeds

### Why two secrets?

OneCLI host matching is **exact**:
- `github.com` matches only `github.com` (git HTTPS)
- `api.github.com` matches only `api.github.com` (REST API)

A secret with `hostPattern: "github.com"` will NOT inject for `api.github.com` requests. The proxy logs show this clearly:
```
host=github.com:443     mode="mitm"    injection_count=1  ← has matching secret
host=api.github.com:443 mode="tunnel"  injection_count=0  ← no matching secret
```

### Why different auth formats?

- **Git HTTPS**: GitHub's git server expects HTTP Basic auth: `Authorization: Basic base64(username:password)`. The username is `x-access-token` and the password is the PAT.
- **GitHub API**: GitHub's REST API expects `Authorization: token <PAT>` or `Authorization: Bearer <PAT>`.

---

## Multi-repo and org tokens

**Adding a second repo to the same group:**
Run `/setup-repo` again with the new repo. If using the same PAT (org-scoped), skip secret creation — just clone with `--skip-onecli`.

**Org-wide token (covers multiple repos):**
Create secrets once for the org token, assign to the agent. For each new repo, just clone:

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

**git works but gh fails:**
Missing `api.github.com` secret. Create it with `--host-pattern "api.github.com"` and assign to agent.

**gh says "not authenticated" despite GH_TOKEN:**
The `GH_TOKEN=proxy-managed` placeholder is set by `container-runner.ts`. If missing, the container was started before the code update — restart nanoclaw.

**git fails with "terminal prompts disabled":**
The `github.com` secret is missing or has wrong format. Must use:
- `--value-format "Basic {value}"`
- Value must be `base64(x-access-token:PAT)` (not the raw PAT)

**OneCLI proxy logs show `mode="tunnel"` for a host:**
No secret matches that host. Create a secret with the exact `--host-pattern` matching the hostname.

**Both git and gh fail:**
Check `onecli agents secrets --id <AGENT_ID>` — secrets must be assigned. Check proxy is running: `docker ps | grep onecli`.

**Clone fails (private repo, no token on host):**
Use `--token` flag with `setup-repo.sh` for initial clone. The token is stripped from the remote URL after clone.
