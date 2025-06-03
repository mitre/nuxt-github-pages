import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execa } from 'execa'

const rootDir = fileURLToPath(new URL('..', import.meta.url))

describe('nuxt-github-pages integration', () => {
  let tempFixtureDir: string
  let outputDir: string

  beforeAll(async () => {
    // Create a temporary fixture for integration testing
    tempFixtureDir = join(rootDir, 'test/fixtures/integration-test')
    await fs.mkdir(tempFixtureDir, { recursive: true })

    // Copy basic fixture files
    const basicFixtureDir = join(rootDir, 'test/fixtures/basic')

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

    // Run nuxt generate
    try {
      await execa('npx', ['nuxi', 'generate'], {
        cwd: tempFixtureDir,
        env: {
          NODE_ENV: 'production',
        },
      })
    }
    catch (error) {
      console.error('Generate failed:', error)
      throw error
    }

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

  it('creates duplicate HTML files during generate', async () => {
    // Test structure based on what the basic fixture generates
    const testDirs = ['about', 'docs', 'docs/getting-started']

    for (const dir of testDirs) {
      const indexPath = join(outputDir, dir, 'index.html')
      const duplicatePath = join(outputDir, `${dir}.html`)

      // Check if index.html exists
      const indexExists = await fs.access(indexPath).then(() => true).catch(() => false)

      if (indexExists) {
        // Check if duplicate was created
        const duplicateExists = await fs.access(duplicatePath).then(() => true).catch(() => false)
        expect(duplicateExists).toBe(true)

        // Verify content matches (with canonical URLs, they'll have the same canonical)
        const indexContent = await fs.readFile(indexPath, 'utf-8')
        const duplicateContent = await fs.readFile(duplicatePath, 'utf-8')

        // Extract canonical URL from both files
        const canonicalRegex = /<link rel="canonical" href="([^"]+)">/
        const indexCanonical = indexContent.match(canonicalRegex)?.[1]
        const duplicateCanonical = duplicateContent.match(canonicalRegex)?.[1]

        // Both should have the same canonical URL
        expect(indexCanonical).toBe(duplicateCanonical)
      }
    }
  })

  it('handles nested directory structures correctly', async () => {
    // Test nested structure
    const nestedIndexPath = join(outputDir, 'docs/getting-started/index.html')
    const nestedDuplicatePath = join(outputDir, 'docs/getting-started.html')

    const indexExists = await fs.access(nestedIndexPath).then(() => true).catch(() => false)
    const duplicateExists = await fs.access(nestedDuplicatePath).then(() => true).catch(() => false)

    expect(indexExists).toBe(true)
    expect(duplicateExists).toBe(true)
  })

  it('does not create duplicates for root index.html', async () => {
    // Root index.html should NOT have a duplicate
    const rootIndexPath = join(outputDir, 'index.html')
    const rootDuplicatePath = join(outputDir, '.html')

    const indexExists = await fs.access(rootIndexPath).then(() => true).catch(() => false)
    const duplicateExists = await fs.access(rootDuplicatePath).then(() => true).catch(() => false)

    // If there's a root index.html, it should not have a duplicate
    if (indexExists) {
      expect(duplicateExists).toBe(false)
    }
    // Otherwise, neither should exist
    else {
      expect(duplicateExists).toBe(false)
    }
  })

  it('preserves special directories like _nuxt', async () => {
    // _nuxt directory should exist and not be processed
    const nuxtDirPath = join(outputDir, '_nuxt')
    const nuxtDirExists = await fs.access(nuxtDirPath).then(() => true).catch(() => false)

    expect(nuxtDirExists).toBe(true)

    // Should not create _nuxt.html
    const nuxtDuplicatePath = join(outputDir, '_nuxt.html')
    const nuxtDuplicateExists = await fs.access(nuxtDuplicatePath).then(() => true).catch(() => false)

    expect(nuxtDuplicateExists).toBe(false)
  })
})
