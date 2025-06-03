#!/bin/bash

# Comprehensive release script for nuxt-github-pages
# This handles the complete release workflow smoothly

set -e  # Exit on error

echo "🚀 Starting release process..."
echo ""

# Step 1: Ensure we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Error: You must be on the main branch to release"
  echo "   Current branch: $BRANCH"
  exit 1
fi

# Step 2: Ensure working directory is clean
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Working directory has uncommitted changes"
  echo "   Please commit or stash your changes first"
  exit 1
fi

# Step 3: Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Step 4: Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Step 5: Prepare development environment
echo ""
echo "🔧 Preparing development environment..."
pnpm run dev:prepare

# Step 6: Run all tests
echo ""
echo "🧪 Running complete test suite..."
pnpm test

# Step 7: Run linting
echo ""
echo "📝 Running linter..."
pnpm lint

# Step 8: Run type checking
echo ""
echo "🔍 Running type checking..."
pnpm run test:types

# Step 9: Run security audit
echo ""
echo "🔒 Running security audit..."
pnpm audit

# Step 10: Build the module
echo ""
echo "📦 Building module..."
pnpm run prepack

# Step 11: Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo ""
echo "📌 Current version: $CURRENT_VERSION"

# Step 12: Ask for new version
echo ""
echo "What type of release is this?"
echo "  1) patch (bug fixes)"
echo "  2) minor (new features)"
echo "  3) major (breaking changes)"
echo "  4) custom version"
echo "  5) cancel"
read -p "Select release type (1-5): " -n 1 -r
echo ""

case $REPLY in
  1)
    NEW_VERSION=$(npm version patch --no-git-tag-version)
    ;;
  2)
    NEW_VERSION=$(npm version minor --no-git-tag-version)
    ;;
  3)
    NEW_VERSION=$(npm version major --no-git-tag-version)
    ;;
  4)
    read -p "Enter custom version: " CUSTOM_VERSION
    NEW_VERSION=$(npm version $CUSTOM_VERSION --no-git-tag-version)
    ;;
  *)
    echo "❌ Release cancelled"
    exit 1
    ;;
esac

NEW_VERSION=${NEW_VERSION#v}  # Remove 'v' prefix if present
echo "📌 New version: $NEW_VERSION"

# Step 13: Update changelog
echo ""
echo "📝 Updating CHANGELOG.md..."
npx changelogen --no-output

# Step 14: Review changes
echo ""
echo "📋 Review the changes:"
git diff package.json CHANGELOG.md

echo ""
read -p "Commit these changes? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Release cancelled"
  git checkout -- package.json CHANGELOG.md
  exit 1
fi

# Step 15: Commit version bump
echo ""
echo "💾 Committing version bump..."
git add package.json CHANGELOG.md
git commit -m "chore(release): v${NEW_VERSION}"

# Step 16: Create git tag
echo ""
echo "🏷️  Creating git tag..."
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

# Step 17: Clean before publish
echo ""
echo "🧹 Cleaning build artifacts..."
pnpm run clean

# Step 18: Prepare again for publish
echo ""
echo "🔧 Preparing for publish..."
pnpm run dev:prepare

# Step 19: Build again
echo ""
echo "📦 Building for publish..."
pnpm run prepack

# Step 20: Publish to npm
echo ""
echo "📤 Publishing to npm..."
npm publish

# Step 21: Push to git
echo ""
echo "📤 Pushing to GitHub..."
git push origin main --follow-tags

# Step 22: Create GitHub release (optional)
echo ""
echo "Would you like to create a GitHub release?"
read -p "Create GitHub release? (Y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  echo "📝 Creating GitHub release..."
  
  # Extract the latest changelog entry
  CHANGELOG_ENTRY=$(awk "/^## v${NEW_VERSION}/,/^## v[0-9]/" CHANGELOG.md | sed '$d' | tail -n +2)
  
  # Create release via GitHub CLI
  gh release create "v${NEW_VERSION}" \
    --title "v${NEW_VERSION}" \
    --notes "${CHANGELOG_ENTRY}" \
    --verify-tag
fi

# Step 23: Final cleanup
echo ""
echo "🧹 Final cleanup..."
pnpm run clean

echo ""
echo "✅ Release v${NEW_VERSION} complete!"
echo ""
echo "Published:"
echo "  📦 npm: https://www.npmjs.com/package/nuxt-github-pages"
echo "  🐙 GitHub: https://github.com/mitre/nuxt-github-pages/releases/tag/v${NEW_VERSION}"