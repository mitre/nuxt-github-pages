#!/bin/bash

# Local development release script for nuxt-github-pages
# 
# IMPORTANT: For production releases, use GitHub Actions:
#   gh workflow run release.yml --field version_type=patch|minor|major
#
# This script is for:
#   - Testing release process locally (--dry-run)
#   - Emergency releases if GitHub Actions is unavailable
#   - Local development and debugging
#
# Usage:
#   ./scripts/release.sh patch --dry-run    # Test release process
#   ./scripts/release.sh minor --local      # Force local release (not recommended)

set -e  # Exit on error

# Parse arguments
VERSION_TYPE=$1
NO_GITHUB=false
DRY_RUN=false
LOCAL_RELEASE=false

# Parse flags
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-github)
      NO_GITHUB=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --local)
      LOCAL_RELEASE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Require explicit flags
if [ "$DRY_RUN" = false ] && [ "$LOCAL_RELEASE" = false ]; then
  echo "⚠️  Production releases should use GitHub Actions:"
  echo ""
  echo "   gh workflow run release.yml --field version_type=$VERSION_TYPE"
  echo ""
  echo "To test locally, use --dry-run:"
  echo "   ./scripts/release.sh $VERSION_TYPE --dry-run"
  echo ""
  echo "To force local release (not recommended), use --local:"
  echo "   ./scripts/release.sh $VERSION_TYPE --local"
  echo ""
  exit 1
fi

echo "🚀 Starting release process..."
if [ "$DRY_RUN" = true ]; then
  echo "🔍 DRY RUN MODE - No changes will be made"
fi
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

# Step 3: Sync with remote
echo "📥 Syncing with remote..."

# Always fetch latest tags and commits
git fetch --all --tags

if [ "$DRY_RUN" = false ]; then
  # Pull latest changes
  git pull origin main
  
  # Check if local version matches npm
  LOCAL_VERSION=$(node -p "require('./package.json').version")
  NPM_VERSION=$(npm view nuxt-github-pages@latest version 2>/dev/null || echo "")
  
  if [ -n "$NPM_VERSION" ] && [ "$LOCAL_VERSION" != "$NPM_VERSION" ]; then
    echo "⚠️  Warning: Local version ($LOCAL_VERSION) doesn't match npm version ($NPM_VERSION)"
    echo "   This might indicate a release was done via GitHub Actions."
    
    if [ "$LOCAL_RELEASE" = true ]; then
      read -p "   Continue with local release anyway? (y/N) " -n 1 -r
      echo ""
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Release cancelled"
        exit 1
      fi
    else
      echo "❌ Release cancelled. Please sync your local repository."
      exit 1
    fi
  fi
  
  # Check for unpushed commits
  UNPUSHED=$(git log origin/main..HEAD --oneline)
  if [ -n "$UNPUSHED" ]; then
    echo "⚠️  Warning: You have unpushed commits:"
    echo "$UNPUSHED"
    echo "   Please push or resolve these before releasing."
    exit 1
  fi
else
  echo "   [DRY RUN] Would pull from origin main"
  echo "   [DRY RUN] Would verify sync with npm and remote"
fi

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

# Step 12: Determine new version
echo ""
if [ -n "$VERSION_TYPE" ]; then
  # Non-interactive mode
  case $VERSION_TYPE in
    patch|minor|major)
      if [ "$DRY_RUN" = false ]; then
        NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
      else
        # Calculate what the new version would be
        NEW_VERSION=$(node -p "require('semver').inc('$CURRENT_VERSION', '$VERSION_TYPE')")
        echo "   [DRY RUN] Would update version to $NEW_VERSION"
      fi
      ;;
    *)
      # Assume it's a specific version
      if [ "$DRY_RUN" = false ]; then
        NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
      else
        NEW_VERSION=$VERSION_TYPE
        echo "   [DRY RUN] Would update version to $NEW_VERSION"
      fi
      ;;
  esac
else
  # Interactive mode
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
fi

NEW_VERSION=${NEW_VERSION#v}  # Remove 'v' prefix if present
echo "📌 New version: $NEW_VERSION"

# Step 13: Update changelog
echo ""
echo "📝 Updating CHANGELOG.md..."
if [ "$DRY_RUN" = false ]; then
  npx changelogen --no-output
else
  echo "   [DRY RUN] Would generate changelog for v$NEW_VERSION"
fi

# Step 14: Review changes
echo ""
echo "📋 Review the changes:"
git diff package.json CHANGELOG.md

if [ -z "$VERSION_TYPE" ]; then
  # Interactive mode - ask for confirmation
  echo ""
  read -p "Commit these changes? (y/N) " -n 1 -r
  echo ""
  
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    git checkout -- package.json CHANGELOG.md
    exit 1
  fi
else
  # Non-interactive mode - proceed automatically
  echo ""
  echo "✅ Proceeding with release (non-interactive mode)"
fi

# Step 15: Commit version bump
echo ""
echo "💾 Committing version bump..."
if [ "$DRY_RUN" = false ]; then
  git add package.json CHANGELOG.md
  git commit -m "chore(release): v${NEW_VERSION}"
else
  echo "   [DRY RUN] Would commit: chore(release): v${NEW_VERSION}"
fi

# Step 16: Create git tag
echo ""
echo "🏷️  Creating git tag..."
if [ "$DRY_RUN" = false ]; then
  git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
else
  echo "   [DRY RUN] Would create tag: v${NEW_VERSION}"
fi

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
if [ "$DRY_RUN" = false ]; then
  npm publish
else
  echo "   [DRY RUN] Would publish v${NEW_VERSION} to npm"
fi

# Step 21: Push to git
echo ""
echo "📤 Pushing to GitHub..."
if [ "$DRY_RUN" = false ]; then
  git push origin main --follow-tags
else
  echo "   [DRY RUN] Would push main branch and v${NEW_VERSION} tag to GitHub"
fi

# Step 22: Create GitHub release (optional)
if [ "$NO_GITHUB" = true ]; then
  echo ""
  echo "⏭️  Skipping GitHub release (--no-github flag)"
else
  if [ -z "$VERSION_TYPE" ]; then
    # Interactive mode
    echo ""
    echo "Would you like to create a GitHub release?"
    read -p "Create GitHub release? (Y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
      CREATE_GITHUB=true
    else
      CREATE_GITHUB=false
    fi
  else
    # Non-interactive mode - create by default
    CREATE_GITHUB=true
  fi
  
  if [ "$CREATE_GITHUB" = true ]; then
    echo ""
    echo "📝 Creating GitHub release..."
    
    # Extract the latest changelog entry
    CHANGELOG_ENTRY=$(awk "/^## v${NEW_VERSION}/,/^## v[0-9]/" CHANGELOG.md | sed '$d' | tail -n +2)
    
    # Create release via GitHub CLI
    if [ "$DRY_RUN" = false ]; then
      gh release create "v${NEW_VERSION}" \
        --title "v${NEW_VERSION}" \
        --notes "${CHANGELOG_ENTRY}" \
        --verify-tag
    else
      echo "   [DRY RUN] Would create GitHub release for v${NEW_VERSION}"
    fi
  fi
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