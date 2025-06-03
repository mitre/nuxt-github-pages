# Testing Guide for nuxt-github-pages

This guide explains the testing approach and patterns used in this module's test suite.

## Quick Start

```bash
# Run complete test suite with all checks
pnpm run test:all

# Or run tests individually:
pnpm test               # Just the tests
pnpm run test:watch     # Watch mode for development
```

## Automated Testing

The project includes automated quality checks:

1. **Pre-commit hooks**: ESLint automatically runs on staged files
2. **Full test suite**: `pnpm run test:all` runs the complete workflow:
   - Installs dependencies
   - Prepares development environment
   - Runs all tests
   - Runs linting
   - Runs type checking
   - Cleans build artifacts

## Overview

Since `nuxt-github-pages` is a post-build module that hooks into Nitro's `prerender:done` event, standard `@nuxt/test-utils` setup() doesn't work well for our integration tests. Instead, we use a custom approach that runs actual `nuxi generate` commands.

## Testing Patterns

### 1. Post-Build Module Testing

For modules that run after the build process:

```typescript
// Instead of using @nuxt/test-utils setup()
await setup({
  rootDir,
  build: true,
  // This won't trigger our module!
})

// Use execa to run the actual build command
await execa('npx', ['nuxi', 'generate'], {
  cwd: fixtureDir,
  env: { NODE_ENV: 'production' }
})
```

### 2. Temporary Fixtures

To avoid test conflicts and ensure clean test runs:

```typescript
// Create a temporary fixture for each test suite
const tempFixtureDir = join(rootDir, 'test/fixtures/my-test')
await fs.mkdir(tempFixtureDir, { recursive: true })

// Copy only source files, not build artifacts
const filesToCopy = ['nuxt.config.ts', 'package.json', 'app.vue']
const dirsToCopy = ['pages']

// Clean up after tests
afterAll(async () => {
  await fs.rm(tempFixtureDir, { recursive: true, force: true })
})
```

### 3. Testing Configuration Options

When testing module configuration, focus on observable behavior rather than log messages:

```typescript
// ❌ Don't test for log messages (they may not appear in test output)
expect(stdout).toContain('module is disabled')

// ✅ Test the actual behavior
const duplicateExists = await fs.access(duplicatePath).then(() => true).catch(() => false)
expect(duplicateExists).toBe(false) // When module is disabled
```

### 4. Output Directory Detection

The module supports multiple output directories. Always check both possibilities:

```typescript
const outputPath = join(tempFixtureDir, '.output/public')
const distPath = join(tempFixtureDir, 'dist')

let outputDir: string
if (await fs.access(outputPath).then(() => true).catch(() => false)) {
  outputDir = outputPath
} else if (await fs.access(distPath).then(() => true).catch(() => false)) {
  outputDir = distPath
} else {
  throw new Error('No output directory found')
}
```

## Test Structure

### Unit Tests

- `basic.test.ts` - Basic module loading and configuration tests
- `edge-cases.test.ts` - Edge cases for file processing logic

### Integration Tests

- `canonical-urls.test.ts` - Tests canonical URL injection feature
- `canonical-trailing-slash.test.ts` - Tests trailing slash configuration
- `canonical-disabled.test.ts` - Tests with canonical URLs disabled
- `config-options.test.ts` - Tests various configuration options
- `integration.test.ts` - Full integration tests for file duplication

## Common Issues and Solutions

### Issue: Tests fail with "No context available"
**Solution**: Don't use multiple `setup()` calls in the same test file. Use separate test files or temporary fixtures.

### Issue: Module doesn't run during tests
**Solution**: Ensure the Nitro preset is set to 'static' and use actual build commands instead of test utils.

### Issue: Tests interfere with each other
**Solution**: Use temporary fixtures and clean up after each test suite.

### Issue: Log messages don't appear in test output
**Solution**: Test observable behavior (file creation/modification) instead of log messages.

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test canonical-urls.test.ts

# Run tests in watch mode
pnpm test:watch
```