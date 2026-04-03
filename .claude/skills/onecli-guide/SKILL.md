---
name: onecli-guide
description: Quick reference for OneCLI — managing agents, secrets, and rules. Use when you need to create agents, add secrets, assign secrets to agents, or troubleshoot OneCLI configuration.
---

# OneCLI Reference

OneCLI manages the Agent Vault gateway — credentials are injected into containers at request time, so agents never see raw API keys.

**Docs / dashboard:** http://127.0.0.1:10254 (local gateway UI)
**CLI reference:** `onecli --help` (outputs full JSON command list)
**Version:** `onecli version`

---

## Agents

Agents map to NanoClaw groups. Each group that needs secrets (GitHub, OpenAI, etc.) should have a matching OneCLI agent with `secretMode: selective`.

Identifier convention: `slack-<folder-suffix>` (e.g. `slack_harambasicde` → `slack-harambasicde`)

```bash
# List all agents
onecli agents list

# Create agent (--secret-mode is NOT a create flag — set it separately)
onecli agents create --name "My Group" --identifier "slack-my-group"

# Set secret mode: 'selective' (only assigned secrets) or 'all' (every secret)
onecli agents set-secret-mode --id <AGENT_ID> --mode selective

# List secrets assigned to an agent
onecli agents secrets --id <AGENT_ID>

# Assign secrets to an agent (comma-separated secret IDs)
onecli agents set-secrets --id <AGENT_ID> --secret-ids <SECRET_ID1>,<SECRET_ID2>

# Rename an agent
onecli agents rename --id <AGENT_ID> --name "New Name"

# Regenerate access token
onecli agents regenerate-token --id <AGENT_ID>

# Delete an agent
onecli agents delete --id <AGENT_ID>
```

---

## Secrets

Secrets are credentials injected into container HTTP requests when the outbound host matches `--host-pattern`.

| Use case | `--type` | `--host-pattern` |
|---|---|---|
| Anthropic API key / OAuth token | `anthropic` | `api.anthropic.com` |
| GitHub fine-grained PAT | `generic` | `github.com` |
| OpenAI API key | `generic` | `api.openai.com` |
| Any other API key | `generic` | `api.example.com` |

```bash
# List all secrets
onecli secrets list

# Create a secret
onecli secrets create \
  --name "GitHub PAT (harambasicde)" \
  --type generic \
  --value <TOKEN> \
  --host-pattern "github.com"

# Create Anthropic secret (API key or OAuth token)
onecli secrets create \
  --name Anthropic \
  --type anthropic \
  --value <KEY_OR_TOKEN> \
  --host-pattern api.anthropic.com

# Delete a secret
onecli secrets delete --id <SECRET_ID>
```

---

## Full workflow: add a GitHub token to an agent

```bash
# 1. Create the agent
onecli agents create --name "My Group" --identifier "slack-my-group"

# 2. Set selective mode (only assigned secrets injected)
AGENT_ID=$(onecli agents list --fields id,identifier --quiet id | ...)
onecli agents set-secret-mode --id <AGENT_ID> --mode selective

# 3. Create the secret
onecli secrets create \
  --name "GH_TOKEN (my-group)" \
  --type generic \
  --value <FINE_GRAINED_PAT> \
  --host-pattern "github.com"

# 4. Assign the secret to the agent
onecli agents set-secrets --id <AGENT_ID> --secret-ids <SECRET_ID>
```

GitHub PAT needs: **Contents** (read/write), **Pull requests** (read/write), **Metadata** (read).

---

## Rules (rate limits / blocks)

```bash
# List rules
onecli rules list

# Block a host
onecli rules create --name "Block example" --host-pattern "example.com" --action block

# Rate limit a host
onecli rules create --name "Limit OpenAI" --host-pattern "api.openai.com" --action rate_limit

# Delete a rule
onecli rules delete --id <RULE_ID>
```

---

## Auth & config

```bash
onecli auth status          # check login status
onecli auth login           # store API key
onecli auth api-key         # show current API key
onecli config set api-host http://127.0.0.1:10254   # point CLI at local gateway
```

---

## Troubleshooting

**Gateway not reachable:**
```bash
curl -sf http://127.0.0.1:10254/health
onecli start   # start gateway if down
```

**Agent not getting credentials:** Check `secretMode` is `selective` and the right secret IDs are assigned (`onecli agents secrets --id <ID>`).

**"unknown flag" error on create:** `--secret-mode` doesn't exist on `agents create`. Use `agents set-secret-mode` after creation.
