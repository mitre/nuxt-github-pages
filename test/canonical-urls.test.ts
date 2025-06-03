import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeAll } from 'vitest'
import { execa } from 'execa'

const fixtureDir = fileURLToPath(new URL('./fixtures/basic', import.meta.url))

describe('canonical URLs feature', () => {
  beforeAll(async () => {
    // Clean up any previous builds
    const outputDir = join(fixtureDir, '.output')
    const distDir = join(fixtureDir, 'dist')
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {})
    await fs.rm(distDir, { recursive: true, force: true }).catch(() => {})
  })

  describe('with canonical URLs enabled', () => {
    let outputDir: string

    beforeAll(async () => {
      // Run nuxt generate with canonical URLs enabled
      await execa('npx', ['nuxi', 'generate'], {
        cwd: fixtureDir,
        env: {
          NODE_ENV: 'production',
        },
      })

      // Determine output directory
      const outputPath = join(fixtureDir, '.output/public')
      const distPath = join(fixtureDir, 'dist')

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

    it('adds canonical URLs to original index.html files', async () => {
      const aboutIndexPath = join(outputDir, 'about/index.html')
      const aboutIndexContent = await fs.readFile(aboutIndexPath, 'utf-8')

      expect(aboutIndexContent).toContain('<link rel="canonical" href="/about">')
    })

    it('adds canonical URLs to duplicate HTML files', async () => {
      const aboutHtmlPath = join(outputDir, 'about.html')
      const aboutHtmlContent = await fs.readFile(aboutHtmlPath, 'utf-8')

      expect(aboutHtmlContent).toContain('<link rel="canonical" href="/about">')
    })

    it('uses same canonical URL for both versions', async () => {
      const aboutIndexPath = join(outputDir, 'about/index.html')
      const aboutHtmlPath = join(outputDir, 'about.html')

      const aboutIndexContent = await fs.readFile(aboutIndexPath, 'utf-8')
      const aboutHtmlContent = await fs.readFile(aboutHtmlPath, 'utf-8')

      const canonicalRegex = /<link rel="canonical" href="([^"]+)">/
      const indexMatch = aboutIndexContent.match(canonicalRegex)
      const htmlMatch = aboutHtmlContent.match(canonicalRegex)

      expect(indexMatch?.[1]).toBe(htmlMatch?.[1])
      expect(indexMatch?.[1]).toBe('/about')
    })

    it('handles nested routes correctly', async () => {
      const docsGettingStartedIndexPath = join(outputDir, 'docs/getting-started/index.html')
      const docsGettingStartedHtmlPath = join(outputDir, 'docs/getting-started.html')

      const indexContent = await fs.readFile(docsGettingStartedIndexPath, 'utf-8')
      const htmlContent = await fs.readFile(docsGettingStartedHtmlPath, 'utf-8')

      expect(indexContent).toContain('<link rel="canonical" href="/docs/getting-started">')
      expect(htmlContent).toContain('<link rel="canonical" href="/docs/getting-started">')
    })
  })
})
