---
name: github-workflow
description: Make code changes in a GitHub repository. Checks API usage budget, plans, implements via Claude Code (respects repo CLAUDE.md/AGENTS.md), runs quality checks, and opens a PR. Never pushes to default branches.
---

# GitHub Code Change Workflow

Use this skill when the user asks to make code changes, fix bugs, add features, refactor, or create PRs.

---

## 0. Usage budget check — ALWAYS run first, system stability is #1

**If the system runs out of API quota, no agent in any group can work. Protecting the quota takes priority over any coding task.**

Check current usage across all time windows before doing anything else:

```bash
# Query Anthropic usage API — routed through OneCLI proxy
USAGE=$(curl -s "https://api.anthropic.com/v1/usage" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: placeholder" 2>/dev/null)
echo "${USAGE}"
```

If the endpoint is unavailable, estimate conservatively from your current context window fill level and default to **Sonnet-only** mode.

### 5-hour limit (primary — governs model selection for this task)

| Remaining | Plan with | Implement with | Notes |
|-----------|-----------|----------------|-------|
| > 80% | Opus | Opus | Full power, use subagents freely |
| 50–80% | Opus | Sonnet | Plan smart, execute lean |
| 20–50% | Sonnet | Sonnet | Conservative, no large subagent fans |
| < 20% | **STOP** | — | Do not start new coding tasks. Tell the user the budget is low and ask if this is urgent enough to proceed with Sonnet only. |

### 7-day limit (rough check)

- If > 85% of the 7d limit is used: treat this session as **< 20% on 5h** regardless of the 5h reading. Tell the user.
- If 70–85% used: treat as **20–50%** tier.

### 30-day limit (rough check)

- If > 80% of the 30d limit is used: escalate to the user before starting any task. The monthly quota affects all groups.
- If 60–80% used: note it to the user but proceed with conservative model selection.

Store your budget assessment in one line at the top of your plan:

```
Budget: 5h=67% remaining → Opus/Sonnet | 7d=42% remaining → ok | 30d=31% remaining → ok
```

---

## 1. Pre-flight

```bash
OWNER="<owner>"
REPO="<repo>"

# SSL config for proxy
git config --global http.sslCAInfo /tmp/onecli-combined-ca.pem

# Remove any stale credential helpers
git config --global --remove-section credential.https://github.com 2>/dev/null || true
git config --global --remove-section credential.https://gist.github.com 2>/dev/null || true

git ls-remote "https://github.com/${OWNER}/${REPO}.git" HEAD &>/dev/null \
  && echo "✓ git HTTPS works" || echo "✗ git HTTPS failed"
```

If git HTTPS fails, stop and tell the user that GitHub authentication is not configured for this repo.

---

## 2. Refresh the repo

```bash
REPO_DIR="/workspace/group/repos/${OWNER}/${REPO}"
cd "${REPO_DIR}"

CURRENT_URL=$(git remote get-url origin)
if [[ "$CURRENT_URL" == git@* ]]; then
  git remote set-url origin "https://github.com/${OWNER}/${REPO}.git"
fi

git fetch --all
DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | awk '{print $NF}')
git checkout "${DEFAULT_BRANCH}" && git pull
```

---

## 3. Plan — MANDATORY, never skip

Read the relevant files first. Understand what the user wants, which files are involved, what conventions the repo uses (CLAUDE.md, AGENTS.md, README), and what quality checks exist.

**Identify what can be done in parallel.** If the task has independent parts (e.g. update tests + update docs + refactor a module), note them — subagents can run them concurrently in step 4.

Write the plan:
- Budget line (from step 0)
- What changes and why
- Which files are touched
- Parallel vs. sequential breakdown
- Which quality checks to run

Present the plan and **wait for explicit user confirmation before creating a branch or writing any code.**

---

## 4. Implement via Claude Code

After confirmation, create the branch and run Claude Code from the repo root. The model used depends on the budget tier from step 0.

```bash
cd "${REPO_DIR}"   # CRITICAL — Claude Code reads CLAUDE.md, AGENTS.md, .claude/ from here

GROUP_FOLDER=$(basename /workspace/group)
BRANCH_DESC="<short-kebab-description>"
git checkout -b "agent/${GROUP_FOLDER}/${BRANCH_DESC}"
```

### Model selection

Set `IMPL_MODEL` based on your budget assessment:

```bash
# > 80% remaining on 5h: use Opus
IMPL_MODEL="claude-opus-4-6"

# 20–80% remaining on 5h: use Sonnet
IMPL_MODEL="claude-sonnet-4-6"
```

### Sequential implementation (most tasks)

```bash
claude --dangerously-skip-permissions --model "${IMPL_MODEL}" \
  "Implement the following plan. Follow all instructions in CLAUDE.md and AGENTS.md exactly.

${CONFIRMED_PLAN}"
```

### Parallel implementation (when plan identified independent parts)

Split into separate `claude` invocations for each independent part. Run them in parallel using background jobs or spawn them as subagents. Collect results and commit each part:

```bash
# Example: parallel independent changes
claude --dangerously-skip-permissions --model "${IMPL_MODEL}" \
  "Part 1: ${PART_1_DESCRIPTION}. Follow CLAUDE.md exactly." &
PID1=$!

claude --dangerously-skip-permissions --model "${IMPL_MODEL}" \
  "Part 2: ${PART_2_DESCRIPTION}. Follow CLAUDE.md exactly." &
PID2=$!

wait $PID1 $PID2
```

Only parallelize when the parts genuinely don't touch the same files. If unsure, run sequentially.

After implementation, review:

```bash
git status
git diff --stat HEAD
```

If uncommitted changes remain:

```bash
git add -A
git commit -m "<concise present-tense description>"
```

---

## 5. Quality checks

```bash
cd "${REPO_DIR}"

if [ -f package.json ]; then
  npm test 2>&1 || true
  npm run lint 2>&1 || true
  npm run typecheck 2>&1 \
    || npm run type-check 2>&1 \
    || npx tsc --noEmit 2>&1 \
    || true
fi

if [ -f Makefile ]; then
  make test lint 2>&1 || true
fi
```

If a check fails:
1. Fix it directly if small
2. Re-run Claude Code: `claude --dangerously-skip-permissions --model "${IMPL_MODEL}" "Fix these errors: <paste output>"`
3. Re-run checks until green, or report the blocker to the user

---

## 6. Push and open PR

```bash
git push origin HEAD

BRANCH=$(git rev-parse --abbrev-ref HEAD)
GROUP_FOLDER=$(basename /workspace/group)

# Create PR using git's push options (no API call needed)
# If gh CLI is available, use it; otherwise instruct user to create PR manually
if command -v gh &>/dev/null; then
  PR_URL=$(gh pr create \
    --title "<present-tense title, under 72 chars>" \
    --body "## Summary
<1-3 sentences>

## Changes
<bulleted list of files changed and why>

## Quality Checks
- Tests: <pass / fail / n/a>
- Lint: <pass / fail / n/a>
- Typecheck: <pass / fail / n/a>

---
*Created by NanoClaw agent (${GROUP_FOLDER})*" \
    --base "${DEFAULT_BRANCH}" 2>&1 | grep -o 'https://.*')
  echo "PR created: ${PR_URL}"
else
  echo "Push complete: https://github.com/${OWNER}/${REPO}/compare/${DEFAULT_BRANCH}...${BRANCH}"
  echo "Open that URL to create the PR manually."
fi
```

Send the PR URL (or compare link) to the user.

---

## 7. Safety rules — absolute, never violate

- **System quota > coding tasks.** If budget is critically low, tell the user and do not proceed.
- **NEVER** push to `main`, `master`, or the default branch — always use an `agent/*/` branch
- **NEVER** force-push
- **NEVER** merge the PR — only the human merges
- **NEVER** start implementation without explicit user confirmation of the plan
- **ALWAYS** `cd` to the repo root before running `claude`
- **ALWAYS** detect the default branch dynamically — never assume `main`
- **ALWAYS** include `--model` when running `claude` — never let it default silently

