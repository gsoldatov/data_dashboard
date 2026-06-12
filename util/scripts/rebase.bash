#!/usr/bin/env bash

# Script for rebasing worktree branch onto main
# Must be called from the project root directory
set -e

REBASED_BRANCH=$1
UPSTREAM_BRANCH=${2:-main}

if [ -z "$REBASED_BRANCH" ]; then
    echo "❌ Rebased branch name is required."
    echo "Usage: $0 <rebased-branch> [base branch (defaults to main)]"
    exit 1
fi

# Project root dir
PROJECT_ROOT=$(git rev-parse --show-toplevel)

# Exit, if there are uncommitted changes in project root dir
echo "🔍 Checking for uncommitted changes in the project root directory..."
if [ -n "$(git -C "$PROJECT_ROOT" status --porcelain)" ]; then
    echo "❌ Project root directory '$PROJECT_ROOT' has uncommitted changes."
    echo "Stash or commit them before running the script."
    exit 1
fi

# Checkout upstream branch in project root dir
echo "🌿 Switching project root to upstream branch '$UPSTREAM_BRANCH'..."
if ! git -C "$PROJECT_ROOT" rev-parse --verify "refs/heads/$UPSTREAM_BRANCH" >/dev/null 2>&1; then
    echo "❌ Error: Upstream branch '$UPSTREAM_BRANCH' does not exist locally."
    exit 1
fi
git -C "$PROJECT_ROOT" checkout "$UPSTREAM_BRANCH" -q

# --------------------------------

echo "🔄 Searching '$REBASED_BRANCH' in worktrees..."
WT_INFO=$(git worktree list --porcelain | grep -B 2 "branch refs/heads/$REBASED_BRANCH" || true)

if [ -n "$WT_INFO" ]; then
    # Worktree path
    WT_PATH=$(echo "$WT_INFO" | head -n 1 | awk '{print $2}')
    echo "📍 Branch found in worktree: $WT_PATH"

    # Exit, if there are uncommitted changes
    if [ -n "$(git -C "$WT_PATH" status --porcelain)" ]; then
        echo "❌ Worktree '$WT_PATH' has uncommitted changes."
        echo "Stash or commit them before running the script."
        exit 1
    fi

    # Create a temp branch and switch to it
    echo "🌿 Checking out temp branch in worktree..."
    # Delete old temp branch
    git -C "$WT_PATH" branch -D temp 2>/dev/null || true
    git -C "$WT_PATH" checkout -b temp -q

    # Run rebase
    echo "⚡ Rebasing '$REBASED_BRANCH' to '$UPSTREAM_BRANCH'..."
    if git rebase "$UPSTREAM_BRANCH" "$REBASED_BRANCH"; then
        echo "✅ Rebase complete."
    else
        echo "❌ Rebase failed."
        echo "👉 Resolve existing conflicts, then run: git rebase --continue"
        echo "👉 After that, restore worktree branch, using:"
        echo "   git -C '$WT_PATH' checkout '$REBASED_BRANCH' && git -C '$WT_PATH' branch -D temp"
        exit 1
    fi

    # Restore worktree branch
    echo "🔄 Restoring '$REBASED_BRANCH' into its worktree..."
    git -C "$WT_PATH" checkout "$REBASED_BRANCH" -q
    git -C "$WT_PATH" branch -D temp -q

else
    # If the rebased branch is not active in any worktree
    echo "ℹ️  Branch is not used in any worktree, rebasing..."
    git rebase "$UPSTREAM_BRANCH" "$REBASED_BRANCH"
    echo "✅ Rebase complete."
fi

# Ensure CWD is project root & upstream branch is checked out
cd "$PROJECT_ROOT"
git checkout "$UPSTREAM_BRANCH" -q
echo "🏠 Switched back to project root: $PROJECT_ROOT (on branch: $UPSTREAM_BRANCH)"
