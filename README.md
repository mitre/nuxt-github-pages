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
    verbose: true
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

## How It Works

1. During the `nuxt generate` build process, this module hooks into the `prerender:done` event
2. It scans the output directory for all `index.html` files
3. For each `index.html` found at `/path/to/page/index.html`, it creates a duplicate at `/path/to/page.html`
4. This ensures both `/path/to/page` and `/path/to/page/` resolve correctly on GitHub Pages

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

See [TEST_MATRIX.md](./TEST_MATRIX.md) for current test coverage and known gaps.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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

# Run Vitest
pnpm run test
pnpm run test:watch

# Release new version
pnpm run release
```

## License

[Apache-2.0 License](./LICENSE.md)

See [NOTICE.md](./NOTICE.md) for additional copyright and license information.

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