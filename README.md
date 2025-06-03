# nuxt-github-pages

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![CI][ci-src]][ci-href]

Nuxt module to fix trailing slash issues when deploying to GitHub Pages. This module ensures your static Nuxt site works correctly with GitHub Pages' file resolution behavior.

## The Problem

When deploying a Nuxt 3 static site to GitHub Pages:
- Visiting `/docs/page` works fine initially
- But refreshing the page or directly visiting `/docs/page/` returns a 404 error
- This happens because Nuxt generates `/docs/page.html` but GitHub Pages expects `/docs/page/index.html`

## The Solution

This module automatically creates duplicate HTML files during the build process. For every `/path/index.html`, it creates a `/path.html` file, ensuring URLs work with or without trailing slashes.

## Features

- 🚀 Zero configuration required
- 🎯 Works with both GitHub Pages and Netlify
- 📦 Lightweight with no runtime overhead
- 🔧 Configurable output directories
- 📝 TypeScript support
- 🪵 Optional verbose logging
- 🔍 SEO-friendly with automatic canonical URLs

## Quick Setup

### Installation

```bash
# npm
npm install nuxt-github-pages

# pnpm
pnpm add nuxt-github-pages

# yarn
yarn add nuxt-github-pages

# bun
bun add nuxt-github-pages
```

### Configuration

Add `nuxt-github-pages` to the `modules` section of `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages']
})
```

That's it! The module will automatically run during `nuxt generate`.

## Options

You can configure the module by adding options:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  
  githubPages: {
    // Enable or disable the module (default: true)
    enabled: true,
    
    // Directories to check for output files (default: ['dist', '.output/public'])
    outputDirs: ['dist', '.output/public'],
    
    // Show verbose logging (default: true)
    verbose: true,
    
    // Add canonical URLs to prevent duplicate content SEO issues (default: true)
    canonicalUrls: true,
    
    // Use trailing slashes in canonical URLs (default: false)
    trailingSlash: false
  }
})
```

### Option Details

#### `enabled`
- Type: `boolean`
- Default: `true`
- Description: Enable or disable the module. Useful for conditional builds.

#### `outputDirs`
- Type: `string[]`
- Default: `['dist', '.output/public']`
- Description: Array of directories to check for generated files. The module will use the first directory that exists.

#### `verbose`
- Type: `boolean`
- Default: `true`
- Description: Show detailed logging during the build process.

#### `canonicalUrls`
- Type: `boolean`
- Default: `true`
- Description: Automatically inject canonical URLs into all HTML files to prevent duplicate content SEO issues. The canonical URL tells search engines which version of the page is preferred.

#### `trailingSlash`
- Type: `boolean`
- Default: `false`
- Description: Whether to use trailing slashes in canonical URLs. When `false`, canonical URLs will be `/path`. When `true`, they will be `/path/`. Choose based on your site's URL structure preference.

## How It Works

1. During the `nuxt generate` build process, this module hooks into the `prerender:done` event
2. It scans the output directory for all `index.html` files
3. For each `index.html` found at `/path/to/page/index.html`, it creates a duplicate at `/path/to/page.html`
4. Optionally injects canonical URLs into all HTML files to prevent SEO duplicate content issues
5. This ensures both `/path/to/page` and `/path/to/page/` resolve correctly on GitHub Pages

## Example

Given this generated structure:
```
dist/
├── index.html
├── about/
│   └── index.html
├── docs/
│   ├── index.html
│   └── getting-started/
│       └── index.html
```

The module creates these additional files:
```
dist/
├── about.html          ← Created
├── docs.html           ← Created
├── docs/
│   └── getting-started.html  ← Created
```

## Deployment

After building with `nuxt generate`, deploy the output directory to GitHub Pages as usual:

```bash
# Build your site
pnpm run generate

# Deploy to GitHub Pages (example using gh-pages)
npx gh-pages -d dist
```

## Compatibility

- ✅ Nuxt 3.0+
- ✅ GitHub Pages
- ✅ Netlify
- ✅ Any static hosting that serves `.html` files

## Why Not Use Other Solutions?

### Post-build Scripts
While you could use a custom post-build script, this module:
- Integrates seamlessly with Nuxt's build process
- Provides proper error handling and logging
- Works with any package manager without extra configuration
- Is reusable across projects

### Netlify Redirects
Netlify-specific `_redirects` only work on Netlify. This module works everywhere.

### .htaccess or nginx
These require server configuration access, which you don't have with GitHub Pages.

## Development

### Releasing New Versions

We use GitHub Actions for all production releases to ensure consistency and security.

#### Production Releases (Recommended)

```bash
# Using our convenience script
./scripts/release-prod.sh patch  # For bug fixes
./scripts/release-prod.sh minor  # For new features  
./scripts/release-prod.sh major  # For breaking changes

# Or directly with GitHub CLI
gh workflow run release.yml --field version_type=patch --field create_github_release=true
```

#### Local Development

```bash
# Test the release process without making changes
./scripts/release.sh patch --dry-run

# After a release, always sync your local repository
git pull origin main --tags
```

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## SEO Considerations

By default, this module injects canonical URLs to prevent duplicate content issues. Both `/path` and `/path/` will point to the same canonical URL, telling search engines which version is preferred.

```html
<!-- Both pages will have the same canonical URL -->
<!-- Default (trailingSlash: false): -->
<link rel="canonical" href="/about">

<!-- With trailingSlash: true: -->
<link rel="canonical" href="/about/">
```

You can customize this behavior:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  githubPages: {
    // Disable canonical URLs entirely
    canonicalUrls: false,
    
    // Or use trailing slashes in canonical URLs
    trailingSlash: true  // Results in href="/path/"
  }
})
```

### Recommended Configurations by Platform

These recommendations are based on the excellent [Trailing Slash Guide](https://github.com/slorber/trailing-slash-guide) by [Sébastien Lorber](https://github.com/slorber), which provides comprehensive testing and documentation of trailing slash behavior across all major hosting platforms. If you're dealing with trailing slash issues, his guide is an invaluable resource.

#### GitHub Pages
GitHub Pages redirects `/about` to `/about/` on refresh, indicating it prefers trailing slashes:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  githubPages: {
    canonicalUrls: true,
    trailingSlash: true  // URLs like /about/ (with trailing slash)
  }
})
```

#### Netlify
Netlify's "Pretty URLs" feature (enabled by default) prefers trailing slashes for directory-based content:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  githubPages: {
    canonicalUrls: true,
    trailingSlash: true  // URLs like /about/ (with trailing slash)
  }
})
```

#### Cloudflare Pages
Cloudflare Pages automatically adds trailing slashes and creates redirects:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  githubPages: {
    canonicalUrls: true,
    trailingSlash: true  // URLs like /about/ (with trailing slash)
  }
})
```

#### Vercel
Vercel is configurable but defaults to no trailing slashes:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  githubPages: {
    canonicalUrls: true,
    trailingSlash: false  // URLs like /about (no trailing slash)
  }
})
```

#### Disable Canonical URLs
If you're managing canonical URLs through other means (like `useHead` or SEO modules):

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  githubPages: {
    canonicalUrls: false  // Don't inject any canonical URLs
  }
})
```

## Troubleshooting

### Module doesn't seem to run
1. Ensure you're using `nuxt generate` (not `nuxt build`)
2. Check that your `nitro.preset` is set to `'static'` (this is the default for `nuxt generate`)
3. Look for log messages in your build output

### Files aren't being created
1. Verify your output directory matches one in `outputDirs`
2. Enable `verbose: true` to see detailed logging
3. Ensure your build is completing successfully

### Custom output directory
If you use a custom output directory, add it to the configuration:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-github-pages'],
  githubPages: {
    outputDirs: ['my-custom-dist', 'dist', '.output/public']
  }
})
```

## Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

See [test/README.md](./test/README.md) for detailed information about the testing approach and patterns used in this module.

See [test/TEST_MATRIX.md](./test/TEST_MATRIX.md) for current test coverage.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup and workflow
- Automated quality checks (git hooks)
- Testing guidelines
- Pull request process
- Coding standards

### Quick Start for Contributors

```bash
# Setup
pnpm install
pnpm run dev:prepare

# Before committing
pnpm run test:all
```

### CI/CD Process

This project uses GitHub Actions for continuous integration and deployment:

- **CI**: Runs on every push and PR (linting, type checking, tests, security)
- **Release**: Manual workflow for creating releases (version bump, npm publish, GitHub release)
- **Auto Release**: PRs with `release:patch`, `release:minor`, or `release:major` labels trigger automatic releases when merged

See [.github/SETUP.md](.github/SETUP.md) for workflow configuration details.

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run type checking
pnpm run test:types

# Clean build artifacts
pnpm run clean

# Run ALL checks (recommended before committing)
pnpm run test:all

# Release new version
pnpm run release
```

### Development Workflow

1. **Before starting work**: Run `pnpm install` and `pnpm run dev:prepare`
2. **During development**: Use `pnpm run dev` to test changes in the playground
3. **Before committing**: Run `pnpm run test:all` to ensure everything passes
4. **After testing**: Run `pnpm run clean` to remove build artifacts

### Automated Quality Checks

This project uses git hooks to maintain code quality:

- **Pre-commit hook**: Automatically runs ESLint on staged files and fixes issues
- **Automatic formatting**: Code style issues are fixed automatically on commit
- Files are linted and formatted using the Nuxt ESLint configuration

### Development Scripts

- `pnpm run test:all` - Complete test suite (install → prepare → test → lint → type check → clean)
- `pnpm run clean` - Remove all build artifacts (preserves node_modules)
- `./scripts/pre-release.sh` - Run all checks and build before releasing

### Development Tips

- The playground directory is for testing during development
- Test fixtures are automatically cleaned during test runs
- Build artifacts (.nuxt, .output, dist) are git-ignored
- Always run `pnpm run test:all` before pushing changes

## License

[Apache-2.0 License](./LICENSE.md)

See [NOTICE.md](./NOTICE.md) for additional copyright and license information.

## Security

For security issues, please see our [Security Policy](SECURITY.md).

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Credits

This module was created to solve the [long-standing trailing slash issue](https://github.com/nuxt/nuxt/issues/15462) when deploying Nuxt sites to GitHub Pages.

Created by [MITRE](https://github.com/mitre) for the open source community.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-github-pages/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-github-pages

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-github-pages.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-github-pages

[license-src]: https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://opensource.org/licenses/Apache-2.0

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[ci-src]: https://img.shields.io/github/actions/workflow/status/mitre/nuxt-github-pages/ci.yml?branch=main&style=flat&colorA=020420&colorB=00DC82
[ci-href]: https://github.com/mitre/nuxt-github-pages/actions/workflows/ci.yml