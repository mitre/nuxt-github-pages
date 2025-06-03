#!/bin/bash

# Pre-release checks for nuxt-github-pages
# Run this before creating a release

set -e  # Exit on error

echo "🚀 Running pre-release checks..."
echo ""

# Run all tests and checks
./scripts/test-all.sh

echo ""
echo "📦 Step 8: Building module..."
pnpm run prepack

echo ""
echo "📋 Step 9: Final checks..."
echo "  - Ensure version is updated in package.json"
echo "  - Ensure CHANGELOG.md is updated with release date"
echo "  - Review all changes with: git diff --staged"
echo ""
echo "✅ Pre-release checks complete!"
echo ""
echo "Next steps:"
echo "  1. Commit your changes: git commit -m 'feat: your message'"
echo "  2. Tag the release: git tag v1.1.0"
echo "  3. Run release: pnpm run release"