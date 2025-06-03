#!/bin/bash

# Clean build artifacts from nuxt-github-pages project
# This script removes all generated files and directories

echo "🧹 Cleaning build artifacts..."

# Clean root level artifacts (but not node_modules - we need those!)
rm -rf dist .nuxt .output .data

# Clean playground artifacts
if [ -d "playground" ]; then
  echo "  Cleaning playground..."
  rm -rf playground/dist playground/.nuxt playground/.output playground/.data playground/node_modules
  # Remove any accidental nested directories
  rm -rf playground/playground
fi

# Clean test fixture artifacts
if [ -d "test/fixtures" ]; then
  echo "  Cleaning test fixtures..."
  find test/fixtures -type d -name ".nuxt" -exec rm -rf {} + 2>/dev/null || true
  find test/fixtures -type d -name ".output" -exec rm -rf {} + 2>/dev/null || true
  find test/fixtures -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
  find test/fixtures -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
  # Also remove symlinks
  find test/fixtures -type l -name "dist" -exec rm -f {} + 2>/dev/null || true
fi

# Clean temporary test directories
if [ -d "test" ]; then
  echo "  Cleaning temporary test files..."
  rm -rf test/tmp-*
fi

# Clean coverage reports
rm -rf coverage .nyc_output

# Clean logs
rm -f *.log

echo "✨ Clean complete!"