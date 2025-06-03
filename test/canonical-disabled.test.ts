import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execa } from 'execa'

const rootDir = fileURLToPath(new URL('..', import.meta.url))

describe('disabled canonical URLs', () => {
  let tempFixtureDir: string
  let outputDir: string

  beforeAll(async () => {
    // Create a temporary fixture with canonical URLs disabled
    tempFixtureDir = join(rootDir, 'test/fixtures/canonical-disabled-test')
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

    // Update nuxt.config.ts to disable canonical URLs
    const nuxtConfig = `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    verbose: true,
    canonicalUrls: false  // Disable canonical URLs
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

  it('does not add canonical URLs when disabled', async () => {
    const aboutIndexPath = join(outputDir, 'about/index.html')
    const aboutIndexContent = await fs.readFile(aboutIndexPath, 'utf-8')

    expect(aboutIndexContent).not.toContain('rel="canonical"')
  })

  it('still creates duplicate files without canonical URLs', async () => {
    const aboutHtmlPath = join(outputDir, 'about.html')
    const aboutHtmlExists = await fs.access(aboutHtmlPath).then(() => true).catch(() => false)

    expect(aboutHtmlExists).toBe(true)

    const aboutHtmlContent = await fs.readFile(aboutHtmlPath, 'utf-8')
    expect(aboutHtmlContent).not.toContain('rel="canonical"')
  })
})
