import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execa } from 'execa'

const rootDir = fileURLToPath(new URL('..', import.meta.url))

describe('createDuplicates option', () => {
  let tempFixtureDir: string
  let outputDir: string

  beforeAll(async () => {
    // Create a temporary fixture with createDuplicates disabled
    tempFixtureDir = join(rootDir, 'test/fixtures/no-duplicates-test')
    await fs.mkdir(tempFixtureDir, { recursive: true })

    // Create nuxt.config.ts with createDuplicates: false
    const config = `export default defineNuxtConfig({
  modules: ['../../../src/module'],
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  githubPages: {
    createDuplicates: false,
    canonicalUrls: true
  }
})
`
    await fs.writeFile(join(tempFixtureDir, 'nuxt.config.ts'), config)

    // Create package.json
    const packageJson = {
      name: 'no-duplicates-test',
      private: true,
      scripts: {
        generate: 'nuxi generate',
      },
    }
    await fs.writeFile(join(tempFixtureDir, 'package.json'), JSON.stringify(packageJson, null, 2))

    // Create test pages
    await fs.mkdir(join(tempFixtureDir, 'pages'), { recursive: true })
    await fs.writeFile(join(tempFixtureDir, 'pages/index.vue'), '<template><div>Home</div></template>')
    await fs.writeFile(join(tempFixtureDir, 'pages/about.vue'), '<template><div>About</div></template>')

    // Create app.vue
    await fs.writeFile(join(tempFixtureDir, 'app.vue'), '<template><NuxtPage /></template>')

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

  it('should NOT create duplicate HTML files when createDuplicates is false', async () => {
    // Check that about/index.html exists
    const indexPath = join(outputDir, 'about/index.html')
    const indexExists = await fs.access(indexPath).then(() => true).catch(() => false)
    expect(indexExists).toBe(true)

    // Check that about.html does NOT exist
    const duplicatePath = join(outputDir, 'about.html')
    const duplicateExists = await fs.access(duplicatePath).then(() => true).catch(() => false)
    expect(duplicateExists).toBe(false)
  })

  it('should still add canonical URLs when createDuplicates is false', async () => {
    // Read the index file
    const indexPath = join(outputDir, 'about/index.html')
    const content = await fs.readFile(indexPath, 'utf-8')

    // Check for canonical URL
    expect(content).toContain('<link rel="canonical" href="/about">')
  })
})
