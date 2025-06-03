import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execa } from 'execa'

const rootDir = fileURLToPath(new URL('..', import.meta.url))

describe('canonical URLs with trailing slash', () => {
  let tempFixtureDir: string
  let outputDir: string

  beforeAll(async () => {
    // Create a temporary fixture with trailing slash enabled
    tempFixtureDir = join(rootDir, 'test/fixtures/canonical-trailing-slash-test')
    await fs.mkdir(tempFixtureDir, { recursive: true })

    // Copy basic fixture files
    const basicFixtureDir = join(rootDir, 'test/fixtures/basic')

    // Copy only source files, not build artifacts
    const filesToCopy = ['nuxt.config.ts', 'package.json', 'app.vue']
    const dirsToCopy = ['pages']

    for (const file of filesToCopy) {
      const src = join(basicFixtureDir, file)
      const dest = join(tempFixtureDir, file)
      await fs.copyFile(src, dest).catch(() => {})
    }

    for (const dir of dirsToCopy) {
      const src = join(basicFixtureDir, dir)
      const dest = join(tempFixtureDir, dir)
      await fs.cp(src, dest, { recursive: true }).catch(() => {})
    }

    // Update nuxt.config.ts to enable trailing slash
    const nuxtConfig = `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    verbose: true,
    canonicalUrls: true,
    trailingSlash: true  // Enable trailing slash
  }
})
`
    await fs.writeFile(join(tempFixtureDir, 'nuxt.config.ts'), nuxtConfig)

    // Clean up any previous builds
    const cleanDirs = ['.output', 'dist', '.nuxt']
    for (const dir of cleanDirs) {
      await fs.rm(join(tempFixtureDir, dir), { recursive: true, force: true }).catch(() => {})
    }

    // Run nuxt generate
    await execa('npx', ['nuxi', 'generate'], {
      cwd: tempFixtureDir,
      env: {
        NODE_ENV: 'production',
      },
    })

    // Determine output directory
    const outputPath = join(tempFixtureDir, '.output/public')
    const distPath = join(tempFixtureDir, 'dist')

    if (await fs.access(outputPath).then(() => true).catch(() => false)) {
      outputDir = outputPath
    }
    else if (await fs.access(distPath).then(() => true).catch(() => false)) {
      outputDir = distPath
    }
    else {
      throw new Error('No output directory found')
    }
  })

  afterAll(async () => {
    // Clean up temporary fixture
    await fs.rm(tempFixtureDir, { recursive: true, force: true }).catch(() => {})
  })

  it('uses trailing slash in canonical URLs when configured', async () => {
    const aboutIndexPath = join(outputDir, 'about/index.html')
    const aboutIndexContent = await fs.readFile(aboutIndexPath, 'utf-8')

    expect(aboutIndexContent).toContain('<link rel="canonical" href="/about/">')
  })

  it('applies trailing slash to duplicate files', async () => {
    const aboutHtmlPath = join(outputDir, 'about.html')
    const aboutHtmlContent = await fs.readFile(aboutHtmlPath, 'utf-8')

    expect(aboutHtmlContent).toContain('<link rel="canonical" href="/about/">')
  })

  it('handles nested routes with trailing slash', async () => {
    const docsGettingStartedIndexPath = join(outputDir, 'docs/getting-started/index.html')
    const docsGettingStartedHtmlPath = join(outputDir, 'docs/getting-started.html')

    const indexContent = await fs.readFile(docsGettingStartedIndexPath, 'utf-8')
    const htmlContent = await fs.readFile(docsGettingStartedHtmlPath, 'utf-8')

    expect(indexContent).toContain('<link rel="canonical" href="/docs/getting-started/">')
    expect(htmlContent).toContain('<link rel="canonical" href="/docs/getting-started/">')
  })
})
