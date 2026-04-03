---
name: github-workflow
description: Orchestrate code changes in GitHub repositories. Plans the change, gets user confirmation, invokes OpenCode zen to implement, runs quality checks, and creates a PR. Never pushes directly to default branches.
---

# GitHub Code Change Workflow

Use this skill when the user asks to make code changes, fix bugs, add features, refactor code, or create PRs in a GitHub repository.

## 1. Pre-flight checks

### Configure gh via OneCLI proxy

Credentials are injected by the OneCLI gateway proxy — `gh` needs a token to send requests, and the proxy replaces it with the real GitHub PAT for `github.com` traffic. Extract the agent token from `HTTPS_PROXY` and use it as `GH_TOKEN`:

```bash
ONECLI_TOKEN=$(printf '%s' "${HTTPS_PROXY:-}" | sed 's|http://x:\(.*\)@.*|\1|')
if [ -n "$ONECLI_TOKEN" ]; then
  export GH_TOKEN="$ONECLI_TOKEN"
fi
```

Then verify GitHub access actually works:

```bash
gh api user -q .login
```

If this fails, stop and tell the user:
> GitHub token isn't configured for this group.
> Ask your admin to assign a GitHub secret to the OneCLI agent:
> 1. `onecli secrets create --name "GH_TOKEN" --type generic --value <fine-grained-pat> --host-pattern "github.com"`
> 2. `onecli agents set-secrets --id <AGENT_ID> --secret-ids <SECRET_ID>,<existing-secret-ids>`
> The token needs: Contents (read/write), Pull requests (read/write), Metadata (read).

### Verify other tools

```bash
opencode --version
git --version
```

If `opencode` is missing, stop and tell the user the container image needs to be rebuilt (`./container/build.sh`).

## 2. Repo setup

Clone the repo on first use, or refresh if already cloned:

```bash
OWNER="<owner>"
REPO="<repo>"
REPO_DIR="/workspace/group/repos/${OWNER}/${REPO}"

if [ -d "${REPO_DIR}/.git" ]; then
  cd "${REPO_DIR}"
  git fetch --all
  DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | awk '{print $NF}')
  git checkout "${DEFAULT_BRANCH}" && git pull
else
  mkdir -p "/workspace/group/repos/${OWNER}"
  git clone --depth 50 "https://github.com/${OWNER}/${REPO}.git" "${REPO_DIR}"
  cd "${REPO_DIR}"
  DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | awk '{print $NF}')
fi
```

## 3. Plan phase — MANDATORY, never skip

Read the relevant parts of the codebase, then write a structured plan covering:
- Which files to change and why
- What the expected outcome is
- What quality checks apply to this repo

Present the plan to the user and **wait for explicit confirmation** before proceeding. If the user asks for changes, revise and re-present. Only proceed once the user says something like "go ahead", "confirmed", "approved", or "looks good".

**Do NOT write any code or create any branch before confirmation.**

## 4. Implementation via OpenCode

After the user confirms the plan:

```bash
cd "${REPO_DIR}"   # MUST be the repo root — OpenCode reads AGENTS.md/CLAUDE.md/opencode.json from here

# Create branch
GROUP_FOLDER=$(basename /workspace/group)
BRANCH_DESC="<short-kebab-description-of-change>"
git checkout -b "agent/${GROUP_FOLDER}/${BRANCH_DESC}"

# Determine model — group default or user-requested override
MODEL=$(cat /workspace/group/opencode-model 2>/dev/null || echo "opencode/kimi-2.5")

# Invoke OpenCode headless — it reads the repo's own skill files automatically
opencode run \
  --model "${MODEL}" \
  "Implement the following confirmed plan exactly as described. Do not deviate from the plan.

${CONFIRMED_PLAN_TEXT}"
```

After OpenCode finishes, check what it did:

```bash
git status
git diff --stat HEAD
```

If OpenCode left uncommitted changes:
```bash
git add -A
git commit -m "<concise description of change>"
```

### Model selection

- **Default model:** `opencode/kimi-2.5` (Kimi 2.5 via OpenCode zen), stored in `/workspace/group/opencode-model`
- **Per-task override:** If the user explicitly requests a specific model for this task (e.g. "use claude sonnet for this"), pass `--model opencode/<model>` or `--model <provider>/<model>` for this invocation only — do NOT change the stored default
- **Change group default:** If the user says "use X as the default model for this group from now on", run:
  ```bash
  echo "opencode/<model>" > /workspace/group/opencode-model
  ```
  Confirm to the user what the new default is.

### OpenCode reads the repo's own skills

OpenCode automatically discovers and follows:
- `AGENTS.md` — repo-specific coding rules and conventions (preferred)
- `CLAUDE.md` — fallback instruction file
- `opencode.json` — model and tool configuration

**This is why the `cd` to the repo root before `opencode run` is critical.** The NanoClaw agent does not need to know repo-specific conventions — OpenCode handles them entirely.

## 5. Quality checks

After OpenCode commits, run available checks. Detect what exists and run it:

```bash
cd "${REPO_DIR}"

# TypeScript
if [ -f tsconfig.json ]; then
  npx tsc --noEmit 2>&1 && echo "✓ typecheck" || echo "✗ typecheck failed"
fi

# npm scripts
if [ -f package.json ]; then
  npm run lint 2>&1 && echo "✓ lint" || echo "✗ lint failed (or n/a)"
  npm test 2>&1 && echo "✓ tests" || echo "✗ tests failed (or n/a)"
  npm run format:check 2>&1 && echo "✓ format" || echo "✗ format failed (or n/a)"
fi

# Makefile
if [ -f Makefile ]; then
  make lint test 2>&1 || true
fi
```

If a check fails:
1. Try to fix the issue directly
2. Or re-invoke OpenCode: `opencode run --model "${MODEL}" "Fix these errors: <paste error output>"`
3. Re-run checks until green, or report the blocker to the user

## 6. Push and create PR

Once all checks pass:

```bash
git push origin HEAD
```

Then create the PR with the confirmed plan in the body:

```bash
gh pr create \
  --title "<concise present-tense title, under 72 chars>" \
  --body "## Summary
<1-3 sentences describing what this PR does>

## Plan
<The confirmed plan, verbatim as approved by the user>

## Changes
<Bulleted list of files changed and why>

## Quality Checks
- Typecheck: <pass / fail / n/a>
- Tests: <pass / fail / n/a>
- Lint: <pass / fail / n/a>

---
*Created by NanoClaw agent (${GROUP_FOLDER}) via OpenCode (${MODEL})*"
```

Send the PR URL to the user.

## 7. Safety rules — absolute, never violate

- **NEVER** push to `main`, `master`, or any default branch — always use an `agent/*/` branch
- **NEVER** force-push (`--force`)
- **NEVER** merge the PR — only the human user merges
- **NEVER** proceed to implementation without explicit user confirmation of the plan
- **ALWAYS** `cd` to the repo root before invoking `opencode run` so it discovers the repo's skill files
- **ALWAYS** detect the default branch dynamically — do not assume it is `main`
