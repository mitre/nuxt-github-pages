#!/bin/bash

# Run all tests and checks for nuxt-github-pages
# This ensures the module is ready for release

set -e  # Exit on error

echo "🧹 Step 1: Cleaning build artifacts..."
pnpm run clean

echo ""
echo "🔧 Step 2: Installing dependencies..."
pnpm install

echo ""
echo "🔧 Step 3: Preparing development environment..."
pnpm run dev:prepare

echo ""
echo "🧪 Step 4: Running tests..."
pnpm test

echo ""
echo "📝 Step 5: Running linter..."
pnpm lint

echo ""
echo "🔍 Step 6: Running type checking..."
pnpm run test:types

echo ""
echo "🔒 Step 7: Running security audit..."
pnpm audit

echo ""
echo "🧹 Step 8: Cleaning build artifacts..."
pnpm run clean

echo ""
echo "✅ All checks passed! Ready for commit."