#!/usr/bin/env bash
set -euo pipefail

# usage:
# ./deploy.sh                -> commit & push, then deploy to Vercel (preview)
# ./deploy.sh -p             -> commit & push, then deploy to Vercel production
# ./deploy.sh "message msg"  -> commit message provided, deploy to preview
# ./deploy.sh -p "release v1.2" -> production deploy with message

PROD=false
COMMIT_MSG=""
VERCEL_CMD="vercel"

# parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--prod) PROD=true; shift ;;
    -h|--help) 
      echo "Usage: $0 [-p|--prod] [commit message]"
      exit 0
      ;;
    *) 
      # remaining argument treated as commit message (join if multiple)
      if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="$*"
        break
      fi
      shift
      ;;
  esac
done

# default commit message
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="Auto commit on $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "---------------------------------------"
echo "Deploy script starting..."
echo "Production deploy: $PROD"
echo "Commit message: $COMMIT_MSG"
echo "---------------------------------------"

# sanity checks
if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is not installed or not in PATH." >&2
  exit 1
fi

if ! command -v $VERCEL_CMD >/dev/null 2>&1; then
  echo "Warning: vercel CLI not found. Skipping deployment step."
  VERCEL_AVAILABLE=false
else
  VERCEL_AVAILABLE=true
fi

# ensure .env isn't tracked
echo "Removing .env from git tracking (if tracked)..."
git rm --cached .env 2>/dev/null || true

# ensure .gitignore exists and contains .env (best-effort)
if [ -f .gitignore ]; then
  if ! grep -q "^\.env" .gitignore 2>/dev/null; then
    echo ".env" >> .gitignore
    echo "Added .env to .gitignore"
  fi
else
  echo ".env" > .gitignore
  echo "Created .gitignore with .env entry"
fi

# add, commit, push
echo "Staging changes..."
git add .

# check if there is anything to commit
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  echo "Committing changes..."
  git commit -m "$COMMIT_MSG"
fi

echo "Pushing to origin main..."
git push origin main

# deploy to Vercel (if CLI available)
if [ "$VERCEL_AVAILABLE" = true ]; then
  if [ "$PROD" = true ]; then
    echo "Deploying to Vercel (production)..."
    # production deploy
    vercel --prod
  else
    echo "Deploying to Vercel (preview)..."
    # preview deploy (no --prod)
    vercel
  fi

  echo "Vercel CLI finished. Check output above for the deployment URL."
else
  echo "Vercel CLI not available — please run 'vercel' manually to deploy."
fi

echo "Done."
