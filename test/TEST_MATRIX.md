# Test Matrix for nuxt-github-pages

This document tracks our test coverage as of v1.1.0.

## Current Test Coverage

### ✅ Unit Tests (All Passing)

| Test | Status | Description |
|------|--------|-------------|
| Module loads correctly | ✅ Pass | Verifies the module can be imported |
| Fixture configuration | ✅ Pass | Verifies test fixtures are configured properly |
| Root index.html logic | ✅ Pass | Verifies root index.html is skipped |
| Special directories logic | ✅ Pass | Verifies _nuxt and .hidden directories are skipped |
| Path generation logic | ✅ Pass | Verifies correct duplicate paths are generated |

### ✅ Integration Tests (All Passing)

| Test | Status | Description |
|------|--------|-------------|
| Full generate with module | ✅ Pass | Tests complete build process with file duplication |
| Nested directory structures | ✅ Pass | Verifies nested routes work correctly |
| Special directory preservation | ✅ Pass | Ensures _nuxt directories are not processed |

### ✅ Configuration Tests (All Passing)

| Test | Status | Description |
|------|--------|-------------|
| enabled: false option | ✅ Pass | Verifies module can be disabled |
| verbose: false option | ✅ Pass | Tests silent operation mode |
| Custom outputDirs | ✅ Pass | Tests custom output directory configuration |

### ✅ Canonical URL Tests (All Passing)

| Test | Status | Description |
|------|--------|-------------|
| Canonical URL injection | ✅ Pass | Verifies canonical URLs are added to HTML files |
| Trailing slash configuration | ✅ Pass | Tests trailingSlash option |
| Disabled canonical URLs | ✅ Pass | Tests with canonicalUrls: false |
| Same canonical for duplicates | ✅ Pass | Ensures both files have identical canonical URLs |

## Test Infrastructure

The test suite uses a custom approach for testing post-build modules:
- Creates temporary fixtures for each test suite to avoid conflicts
- Runs actual `nuxi generate` commands to trigger the module
- Tests observable behavior rather than log messages
- See [test/README.md](./README.md) for detailed testing patterns

## Coverage Summary

**Total Tests: 21**
- ✅ All 21 tests passing
- ❌ 0 tests failing
- ⏭️ 0 tests skipped

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test canonical-urls.test.ts

# Run tests in watch mode
pnpm test:watch

# Run linting
pnpm lint

# Run type checking (main module only)
pnpm exec vue-tsc --noEmit --project tsconfig.json
```

## Production Status

The module is **production-ready** and battle-tested:
- ✅ Successfully deployed on multiple production sites including https://act.mitre.org/
- ✅ All features fully tested with comprehensive test coverage
- ✅ Proper error handling with try-catch blocks
- ✅ Safe defaults that cover common use cases
- ✅ SEO-friendly with canonical URL support

## Notes

- All tests use temporary fixtures to ensure isolation
- Tests run actual `nuxi generate` commands to test the module in a real build environment
- The module maintains its lightweight footprint (5.67 kB) while providing comprehensive functionality