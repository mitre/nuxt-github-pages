# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.1.1

[compare changes](https://github.com/mitre/nuxt-github-pages/compare/v1.1.0...v1.1.1)

## [1.1.0] - 2025-02-03

### Added
- Canonical URL injection feature to prevent SEO duplicate content issues (#15462)
  - New `canonicalUrls` option (default: `true`) - automatically adds canonical URLs to both original and duplicate HTML files
  - New `trailingSlash` option (default: `false`) - controls whether canonical URLs use trailing slashes
  - Both original and duplicate files receive the same canonical URL to prevent duplicate content penalties
- Comprehensive test suite improvements
  - All integration tests rewritten to use real build environments
  - Added canonical URL feature tests
  - Added test isolation with temporary fixtures
  - Created test/README.md with testing patterns and guidelines

### Changed
- Default values updated:
  - `verbose` now defaults to `true` (was `false`)
  - `canonicalUrls` defaults to `true` (new option)
- Improved error handling and logging throughout the module

### Fixed
- All previously skipped tests are now passing
- Test infrastructure issues that prevented proper module testing

### Documentation
- Added SEO considerations section to README
- Added platform-specific configuration examples
- Created comprehensive testing documentation
- Added references to slorber's trailing-slash-guide

### Development
- Added comprehensive developer tooling:
  - `pnpm run clean` script to remove build artifacts
  - `pnpm run test:all` script for complete test suite
  - `./scripts/pre-release.sh` for pre-release checklist
- Implemented git hooks with Husky and lint-staged:
  - Pre-commit hook automatically runs ESLint on staged files
  - Code formatting issues are fixed automatically
- Enhanced .gitignore to exclude AI assistant files (CLAUDE.md, recovery-prompt.md)
- Improved contributing guidelines with automated quality checks
- Added development workflow documentation
- Implemented security tooling:
  - Added `pnpm audit` to test scripts
  - Created SECURITY.md policy
  - Added Dependabot configuration for automatic updates
  - Integrated security checks into CI/CD workflow

## [1.0.0] - 2025-01-28

### Added
- Initial release of nuxt-github-pages module
- Automatic creation of duplicate HTML files for GitHub Pages compatibility
- Configurable output directories
- Verbose logging option
- TypeScript support
- Zero-configuration setup for most use cases

### Features
- Creates `/path.html` for every `/path/index.html` during build
- Handles nested directory structures
- Skips special directories (starting with `_` or `.`)
- Preserves root index.html without duplication
- Works with both `dist` and `.output/public` directories

### Production Ready
- Successfully deployed and tested on production sites including https://act.mitre.org/
- Comprehensive error handling
- Lightweight with no runtime overhead (5.67 kB total)