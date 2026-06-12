#!/usr/bin/env bash

# Script for rebasing worktree branch onto main
set -e

BRANCH_NAME=$1
UPSTREAM_BRANCH=${2:-main}

if [ -z "$BRANCH_NAME" ]; then
    echo "❌ Rebased branch name is required."
    echo "Usage: $0 <rebased-branch> [base branch (defaults to main)]"
    exit 1
fi

# Project root dir
START_DIR=$(git rev-parse --show-toplevel)

echo "🔄 Searching '$BRANCH_NAME' in worktrees..."
WT_INFO=$(git worktree list --porcelain | grep -B 2 "branch refs/heads/$BRANCH_NAME" || true)

if [ -n "$WT_INFO" ]; then
    # Worktree path
    WT_PATH=$(echo "$WT_INFO" | head -n 1 | awk '{print $2}')
    echo "📍 Branch found in worktree: $WT_PATH"

    # Exit, if there are uncommitted changes
    if [ -n "$(git -C "$WT_PATH" status --porcelain)" ]; then
        echo "❌ Worktree '$WT_PATH' has uncommitted cnahges."
        echo "Stash or commit then before running the script."
        exit 1
    fi

    # Create a temp branch and switch to it
    echo "🌿 Checking out temp branch..."
    # Delete old temp branch
    git -C "$WT_PATH" branch -D temp 2>/dev/null || true
    git -C "$WT_PATH" checkout -b temp -q

    # Run rebase
    echo "⚡ Rebasing '$BRANCH_NAME' to '$UPSTREAM_BRANCH'..."
    if git rebase "$UPSTREAM_BRANCH" "$BRANCH_NAME"; then
        echo "✅ Rebase complete."
    else
        echo "❌ Rebase failed."
        echo "👉 Resolve existing conflicts, then run: git rebase --continue"
        echo "👉 After that, restore worktree branch, using:"
        echo "   git -C '$WT_PATH' checkout '$BRANCH_NAME' && git -C '$WT_PATH' branch -D temp"
        exit 1
    fi

    # Restore worktree branch
    echo "🔄 Restoring '$BRANCH_NAME' into its worktree..."
    git -C "$WT_PATH" checkout "$BRANCH_NAME" -q
    git -C "$WT_PATH" branch -D temp -q

else
    # If the rebased branch is not active in any worktree
    echo "ℹ️  Branch is not used in any worktree, rebasing..."
    git rebase "$UPSTREAM_BRANCH" "$BRANCH_NAME"
    echo "✅ Rebase complete."
fi

# Шаг 4: Гарантированно возвращаемся в корень проекта, откуда был запущен скрипт
cd "$START_DIR"
echo "🏠 Swithced back to project root: $START_DIR"