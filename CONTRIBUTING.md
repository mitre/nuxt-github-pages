# Contributing to nuxt-github-pages

Thank you for your interest in contributing to nuxt-github-pages! This guide will help you get started.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9+ (we use pnpm for package management)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nuxt-github-pages.git
   cd nuxt-github-pages
   ```

3. Install dependencies and prepare the development environment:
   ```bash
   pnpm install
   pnpm run dev:prepare
   ```

## Development Workflow

### 1. Before Starting Work

Always ensure your environment is up to date:
```bash
pnpm install
pnpm run dev:prepare
```

### 2. During Development

Use the playground to test your changes:
```bash
pnpm run dev
```

The playground is a minimal Nuxt app located in `/playground` that demonstrates the module's functionality.

### 3. Before Committing

Run the complete test suite to ensure everything works:
```bash
pnpm run test:all
```

This command will:
- Install dependencies
- Prepare the development environment
- Run all tests
- Run ESLint
- Run type checking
- Clean build artifacts

### 4. Committing Changes

We use automated git hooks to maintain code quality:

- **Pre-commit hook**: Automatically runs ESLint on staged files
- Code formatting issues are fixed automatically
- If the commit fails, review the errors and fix them

Commit message format:
```
type: description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring

Examples:
- `feat: add support for custom output directories`
- `fix: handle missing output directory gracefully`
- `docs: update README with new options`

## Available Scripts

### Essential Commands

```bash
# Run all tests and checks
pnpm run test:all

# Development
pnpm run dev          # Start playground dev server
pnpm run dev:build    # Build playground
pnpm run dev:prepare  # Prepare development environment

# Testing
pnpm test            # Run tests
pnpm run test:watch  # Run tests in watch mode
pnpm run test:types  # Run type checking

# Code Quality
pnpm run lint        # Run ESLint
pnpm run clean       # Clean build artifacts

# Quality & Security
pnpm audit           # Check for vulnerabilities

# Pre-release Checks
./scripts/pre-release.sh  # Run comprehensive pre-release checks
```

### Release Process

We use GitHub Actions for all production releases to ensure consistency and security.

#### For Maintainers: Manual Releases

```bash
# Recommended: Use the production release script
./scripts/release-prod.sh patch  # Bug fixes (1.0.0 -> 1.0.1)
./scripts/release-prod.sh minor  # New features (1.0.0 -> 1.1.0)
./scripts/release-prod.sh major  # Breaking changes (1.0.0 -> 2.0.0)

# This will:
# 1. Check your local state
# 2. Trigger GitHub Actions release workflow
# 3. Show you how to monitor progress
```

#### For Maintainers: Automated PR Releases

Add one of these labels to a PR to trigger an automatic release when merged:
- `release:patch` - For bug fixes
- `release:minor` - For new features
- `release:major` - For breaking changes

**Note**: Only PRs with explicit release labels will trigger releases. This prevents accidental releases.

#### For Contributors: Testing Releases

```bash
# Test what a release would do without making changes
./scripts/release.sh patch --dry-run
./scripts/release.sh minor --dry-run

# This will:
# 1. Run all tests and checks
# 2. Show what version would be created
# 3. Display all actions that would be taken
```

#### Post-Release

Always sync your local repository after a release:

```bash
git pull origin main --tags
```

## Testing

### Writing Tests

Tests are located in the `/test` directory. We use Vitest for testing.

Key testing patterns:
- Integration tests use actual `nuxi generate` commands
- Each test suite creates temporary fixtures
- Tests verify observable behavior (file creation, content)

See [test/README.md](./test/README.md) for detailed testing guidelines.

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test canonical-urls.test.ts

# Run tests in watch mode
pnpm run test:watch
```

## Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Run the complete test suite**:
   ```bash
   pnpm run test:all
   ```

4. **Clean build artifacts**:
   ```bash
   pnpm run clean
   ```

5. **Commit your changes** with a descriptive message

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** with:
   - Clear description of the changes
   - Reference to any related issues
   - Screenshots/examples if applicable

### Release Labels

Add one of these labels to your PR to trigger an automatic release when merged:
- `release:patch` - Bug fixes (1.0.0 → 1.0.1)
- `release:minor` - New features (1.0.0 → 1.1.0)
- `release:major` - Breaking changes (1.0.0 → 2.0.0)

If no release label is added, the PR will not trigger a release when merged.

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint)
- Add JSDoc comments for public APIs
- Keep the module lightweight (no unnecessary dependencies)
- Ensure backward compatibility

## Dependency Management

### Dependabot

We use Dependabot to keep dependencies up to date:

- **Patch and minor updates**: Automatically approved and merged
- **Major updates**: Require manual review due to potential breaking changes
- **Grouped updates**: Non-major npm updates are grouped weekly

**Note**: Dependabot PRs do NOT trigger automatic releases. To release dependency updates:
1. Wait for multiple Dependabot PRs to merge
2. Create a manual release: `./scripts/release-prod.sh patch`

## Project Structure

```
nuxt-github-pages/
├── src/
│   └── module.ts         # Main module implementation
├── test/
│   ├── fixtures/         # Test fixtures
│   └── *.test.ts        # Test files
├── playground/          # Development playground
├── scripts/            # Utility scripts
│   ├── clean.sh        # Clean build artifacts
│   ├── test-all.sh     # Run complete test suite
│   └── pre-release.sh  # Pre-release checklist
└── package.json        # Package configuration
```

## Release Process (Maintainers)

Releases are managed by maintainers using our automated release script:

```bash
pnpm run release
```

This interactive script will:
- Run all quality checks (tests, linting, types, security)
- Prompt for version bump type
- Update package.json and CHANGELOG.md
- Create git commit and tag
- Publish to npm
- Push to GitHub
- Optionally create GitHub release (no browser popup!)

The entire process is streamlined and doesn't require manual version updates or browser interactions.

## Questions?

If you have questions:
1. Check existing [issues](https://github.com/mitre/nuxt-github-pages/issues)
2. Review the [README](./README.md)
3. Open a new issue with your question

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.