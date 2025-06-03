#!/bin/bash

# Production release script - uses GitHub Actions
# This is the recommended way to do releases

set -e

VERSION_TYPE=$1

if [ -z "$VERSION_TYPE" ]; then
  echo "🚀 Production Release via GitHub Actions"
  echo ""
  echo "Usage: ./scripts/release-prod.sh <version-type>"
  echo ""
  echo "Version types:"
  echo "  patch - Bug fixes (1.0.0 -> 1.0.1)"
  echo "  minor - New features (1.0.0 -> 1.1.0)"
  echo "  major - Breaking changes (1.0.0 -> 2.0.0)"
  echo ""
  echo "Example:"
  echo "  ./scripts/release-prod.sh patch"
  echo ""
  exit 1
fi

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "❌ Invalid version type: $VERSION_TYPE"
  echo "   Must be: patch, minor, or major"
  exit 1
fi

echo "🔄 Checking GitHub CLI authentication..."
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ Not authenticated with GitHub CLI"
  echo "   Run: gh auth login"
  exit 1
fi

echo "📥 Fetching latest changes..."
git fetch --all --tags

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Warning: You have uncommitted changes"
  echo "   These won't be included in the release."
  read -p "   Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
  fi
fi

# Check for unpushed commits
UNPUSHED=$(git log origin/main..HEAD --oneline)
if [ -n "$UNPUSHED" ]; then
  echo "⚠️  Warning: You have unpushed commits:"
  echo "$UNPUSHED"
  echo "   These won't be included in the release."
  read -p "   Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
  fi
fi

echo ""
echo "🚀 Triggering $VERSION_TYPE release via GitHub Actions..."
echo ""

# Trigger the workflow
if gh workflow run release.yml \
  --field version_type="$VERSION_TYPE" \
  --field create_github_release=true; then
  
  echo "✅ Release workflow triggered successfully!"
  echo ""
  echo "📊 Monitor progress at:"
  echo "   https://github.com/mitre/nuxt-github-pages/actions/workflows/release.yml"
  echo ""
  echo "Or watch with:"
  echo "   gh run watch"
  echo ""
  echo "After completion, sync your local repository:"
  echo "   git pull origin main --tags"
else
  echo "❌ Failed to trigger release workflow"
  exit 1
fi