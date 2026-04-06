#!/usr/bin/env bash
# setup-repo.sh — Set up a GitHub repo for a NanoClaw agent group.
# Creates OneCLI secrets, clones the repo, and verifies access.
#
# Usage:
#   scripts/setup-repo.sh --owner OWNER --repo REPO --folder GROUP_FOLDER \
#     [--token GITHUB_PAT] [--skip-onecli] [--skip-clone]

set -euo pipefail

# --- Parse arguments ---
OWNER=""
REPO=""
FOLDER=""
TOKEN=""
SKIP_ONECLI=false
SKIP_CLONE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --owner)   OWNER="$2";   shift 2 ;;
    --repo)    REPO="$2";    shift 2 ;;
    --folder)  FOLDER="$2";  shift 2 ;;
    --token)   TOKEN="$2";   shift 2 ;;
    --skip-onecli) SKIP_ONECLI=true; shift ;;
    --skip-clone)  SKIP_CLONE=true;  shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$OWNER" || -z "$REPO" || -z "$FOLDER" ]]; then
  echo "ERROR: --owner, --repo, and --folder are required" >&2
  exit 1
fi

# Resolve paths relative to the project root (one level up from scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GROUP_DIR="$PROJECT_ROOT/groups/$FOLDER"
REPO_DIR="$GROUP_DIR/repos/$OWNER/$REPO"

# --- Validate ---
if [[ ! -d "$GROUP_DIR" ]]; then
  echo "ERROR: Group folder does not exist: $GROUP_DIR" >&2
  echo "STATUS:GROUP_MISSING"
  exit 1
fi
echo "STATUS:GROUP_OK folder=$FOLDER"

# Derive OneCLI agent identifier: slack_foo -> slack-foo
AGENT_IDENTIFIER="${FOLDER//_/-}"

# --- OneCLI setup ---
if [[ "$SKIP_ONECLI" == false ]]; then
  if ! command -v onecli &>/dev/null; then
    echo "ERROR: onecli not found. Run /init-onecli first." >&2
    echo "STATUS:ONECLI_MISSING"
    exit 1
  fi

  # Find agent by identifier
  AGENT_ID=$(onecli agents list 2>/dev/null \
    | jq -r --arg id "$AGENT_IDENTIFIER" '.[] | select(.identifier == $id) | .id' 2>/dev/null || true)

  if [[ -z "$AGENT_ID" ]]; then
    echo "Creating OneCLI agent: $AGENT_IDENTIFIER"
    CREATE_OUT=$(onecli agents create --name "$FOLDER" --identifier "$AGENT_IDENTIFIER" 2>&1)
    AGENT_ID=$(echo "$CREATE_OUT" | jq -r '.id' 2>/dev/null || true)
    if [[ -z "$AGENT_ID" ]]; then
      echo "ERROR: Failed to create agent. Output: $CREATE_OUT" >&2
      echo "STATUS:AGENT_CREATE_FAILED"
      exit 1
    fi
    onecli agents set-secret-mode --id "$AGENT_ID" --mode selective 2>/dev/null
    echo "STATUS:AGENT_CREATED id=$AGENT_ID identifier=$AGENT_IDENTIFIER"
  else
    echo "STATUS:AGENT_EXISTS id=$AGENT_ID identifier=$AGENT_IDENTIFIER"
  fi

  # Get current secrets assigned to the agent
  CURRENT_SECRET_IDS=$(onecli agents secrets --id "$AGENT_ID" 2>/dev/null \
    | jq -r '.[]' 2>/dev/null || true)

  if [[ -n "$TOKEN" ]]; then
    SECRET_NAME="GitHub PAT ($OWNER/$REPO)"

    # Check for existing secret with same name to avoid duplicates
    EXISTING_SECRET_ID=$(onecli secrets list 2>/dev/null \
      | jq -r --arg name "$SECRET_NAME" '.[] | select(.name == $name) | .id' 2>/dev/null || true)

    if [[ -n "$EXISTING_SECRET_ID" ]]; then
      echo "STATUS:SECRET_EXISTS id=$EXISTING_SECRET_ID name=$SECRET_NAME"
      NEW_SECRET_ID="$EXISTING_SECRET_ID"
    else
      # Create the secret
      SECRET_OUT=$(onecli secrets create \
        --name "$SECRET_NAME" \
        --type generic \
        --value "$TOKEN" \
        --host-pattern "github.com" 2>&1)
      NEW_SECRET_ID=$(echo "$SECRET_OUT" | jq -r '.id' 2>/dev/null || true)
      if [[ -z "$NEW_SECRET_ID" ]]; then
        echo "ERROR: Failed to create secret. Output: $SECRET_OUT" >&2
        echo "STATUS:SECRET_CREATE_FAILED"
        exit 1
      fi
      echo "STATUS:SECRET_CREATED id=$NEW_SECRET_ID name=$SECRET_NAME"
    fi

    # Append new secret to agent (preserve existing secrets)
    ALL_IDS=""
    if [[ -n "$CURRENT_SECRET_IDS" ]]; then
      # Build comma-separated list from existing + new
      ALL_IDS=$(echo "$CURRENT_SECRET_IDS" | tr '\n' ',' | sed 's/,$//')
      # Only append if not already assigned
      if ! echo "$CURRENT_SECRET_IDS" | grep -q "$NEW_SECRET_ID"; then
        ALL_IDS="$ALL_IDS,$NEW_SECRET_ID"
      fi
    else
      ALL_IDS="$NEW_SECRET_ID"
    fi

    onecli agents set-secrets --id "$AGENT_ID" --secret-ids "$ALL_IDS" 2>/dev/null
    echo "STATUS:SECRETS_ASSIGNED ids=$ALL_IDS"

  else
    # No token provided — check if agent already has a GitHub secret
    HAS_GITHUB=false
    if [[ -n "$CURRENT_SECRET_IDS" ]]; then
      ALL_SECRETS=$(onecli secrets list 2>/dev/null)
      for SID in $CURRENT_SECRET_IDS; do
        HOST=$(echo "$ALL_SECRETS" | jq -r --arg id "$SID" '.[] | select(.id == $id) | .hostPattern' 2>/dev/null || true)
        if [[ "$HOST" == "github.com" ]]; then
          HAS_GITHUB=true
          break
        fi
      done
    fi
    if [[ "$HAS_GITHUB" == false ]]; then
      echo "WARNING: No --token provided and agent has no GitHub secret assigned." >&2
      echo "The agent won't be able to authenticate with GitHub." >&2
      echo "Either re-run with --token or manually add a GitHub secret via onecli." >&2
      echo "STATUS:NO_GITHUB_SECRET"
    else
      echo "STATUS:GITHUB_SECRET_OK"
    fi
  fi
fi

# --- Clone ---
if [[ "$SKIP_CLONE" == false ]]; then
  if [[ -d "$REPO_DIR/.git" ]]; then
    echo "Repo already cloned, fetching updates..."
    git -C "$REPO_DIR" fetch --all 2>&1
    echo "STATUS:REPO_FETCHED path=$REPO_DIR"
  else
    echo "Cloning $OWNER/$REPO..."
    mkdir -p "$(dirname "$REPO_DIR")"
    if [[ -n "$TOKEN" ]]; then
      # Use token for private repos (host doesn't have OneCLI proxy)
      git clone "https://x-access-token:${TOKEN}@github.com/${OWNER}/${REPO}.git" "$REPO_DIR" 2>&1
      # Strip token from remote URL immediately
      git -C "$REPO_DIR" remote set-url origin "https://github.com/${OWNER}/${REPO}.git"
    else
      git clone "https://github.com/${OWNER}/${REPO}.git" "$REPO_DIR" 2>&1
    fi
    echo "STATUS:REPO_CLONED path=$REPO_DIR"
  fi
else
  echo "STATUS:CLONE_SKIPPED"
fi

# --- Verify ---
if [[ -d "$REPO_DIR/.git" ]]; then
  BRANCH=$(git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  COMMIT=$(git -C "$REPO_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
  echo "STATUS:VERIFY_OK branch=$BRANCH commit=$COMMIT"
else
  if [[ "$SKIP_CLONE" == false ]]; then
    echo "STATUS:VERIFY_FAILED no .git directory at $REPO_DIR"
  fi
fi

echo ""
echo "=== Summary ==="
echo "Group:      $FOLDER"
echo "Agent:      $AGENT_IDENTIFIER"
echo "Repo:       $OWNER/$REPO"
echo "Path:       $REPO_DIR"
echo "==="
