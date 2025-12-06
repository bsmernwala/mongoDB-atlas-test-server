#!/bin/bash

# Exit on error
set -e

# Remove .env from git tracking (safe even if not tracked)
git rm --cached .env 2>/dev/null || true

# Add all files (except .gitignored)
git add .

# Commit message
if [ -z "$1" ]; then
  COMMIT_MSG="Auto commit on $(date '+%Y-%m-%d %H:%M:%S')"
else
  COMMIT_MSG="$1"
fi

git commit -m "$COMMIT_MSG"

# Push to main branch
git push origin main

echo "---------------------------------------"
echo "✔ Code pushed successfully!"
echo "✔ Commit message: $COMMIT_MSG"
echo "---------------------------------------"
