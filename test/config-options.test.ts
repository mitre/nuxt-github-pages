import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execa } from 'execa'

const rootDir = fileURLToPath(new URL('..', import.meta.url))

describe('nuxt-github-pages configuration', () => {
  describe('enabled: false', () => {
    let tempFixtureDir: string

    beforeAll(async () => {
      // Create a temporary fixture with module disabled
      tempFixtureDir = join(rootDir, 'test/fixtures/config-disabled-test')
      await fs.mkdir(tempFixtureDir, { recursive: true })

      // Copy basic fixture files
      const basicFixtureDir = join(rootDir, 'test/fixtures/basic')

      // Copy only source files
      const filesToCopy = ['package.json', 'app.vue']
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

      // Create config with module disabled
      const nuxtConfig = `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    enabled: false
  }
})
`
      await fs.writeFile(join(tempFixtureDir, 'nuxt.config.ts'), nuxtConfig)
    })

    afterAll(async () => {
      // Clean up temporary fixture
      await fs.rm(tempFixtureDir, { recursive: true, force: true }).catch(() => {})
    })

    it('respects enabled: false', async () => {
      // Run generate
      const { exitCode } = await execa('npx', ['nuxi', 'generate'], {
        cwd: tempFixtureDir,
        env: { NODE_ENV: 'production' },
      })

      expect(exitCode).toBe(0)

      // Check that no duplicates were created (this is the key behavior)
      const outputPath = join(tempFixtureDir, '.output/public')
      const distPath = join(tempFixtureDir, 'dist')

      let outputDir: string | null = null
      if (await fs.access(outputPath).then(() => true).catch(() => false)) {
        outputDir = outputPath
      }
      else if (await fs.access(distPath).then(() => true).catch(() => false)) {
        outputDir = distPath
      }

      if (outputDir) {
        const aboutDuplicate = join(outputDir, 'about.html')
        const exists = await fs.access(aboutDuplicate).then(() => true).catch(() => false)
        expect(exists).toBe(false)
      }
    }, 30000)
  })

  describe('verbose: false', () => {
    let tempFixtureDir: string
    let outputDir: string

    beforeAll(async () => {
      // Create a temporary fixture with verbose disabled
      tempFixtureDir = join(rootDir, 'test/fixtures/config-quiet-test')
      await fs.mkdir(tempFixtureDir, { recursive: true })

      // Copy basic fixture files
      const basicFixtureDir = join(rootDir, 'test/fixtures/basic')

      const filesToCopy = ['package.json', 'app.vue']
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

      // Create config with verbose disabled
      const nuxtConfig = `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    verbose: false
  }
})
`
      await fs.writeFile(join(tempFixtureDir, 'nuxt.config.ts'), nuxtConfig)

      // Run generate
      const { stdout, stderr } = await execa('npx', ['nuxi', 'generate'], {
        cwd: tempFixtureDir,
        env: { NODE_ENV: 'production' },
      })

      // Store output for testing
      process.env.TEST_VERBOSE_OUTPUT = stdout + stderr

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
      delete process.env.TEST_VERBOSE_OUTPUT
      await fs.rm(tempFixtureDir, { recursive: true, force: true }).catch(() => {})
    })

    it('respects verbose: false', async () => {
      const output = process.env.TEST_VERBOSE_OUTPUT || ''

      // Should NOT see verbose messages
      expect(output).not.toContain('Creating duplicate HTML files')
      expect(output).not.toContain('Created duplicate:')

      // But duplicates should still be created
      const aboutDuplicate = join(outputDir, 'about.html')
      const exists = await fs.access(aboutDuplicate).then(() => true).catch(() => false)
      expect(exists).toBe(true)
    })
  })

  describe('custom output directories', () => {
    let tempFixtureDir: string

    beforeAll(async () => {
      // Create a temporary fixture with custom output dirs
      tempFixtureDir = join(rootDir, 'test/fixtures/config-outputdirs-test')
      await fs.mkdir(tempFixtureDir, { recursive: true })

      // Copy basic fixture files
      const basicFixtureDir = join(rootDir, 'test/fixtures/basic')

      const filesToCopy = ['package.json', 'app.vue']
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

      // Create config with non-existent directories
      const nuxtConfig = `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    verbose: true,
    outputDirs: ['/tmp/does-not-exist', '/another/missing/dir', '.output/public']
  }
})
`
      await fs.writeFile(join(tempFixtureDir, 'nuxt.config.ts'), nuxtConfig)
    })

    afterAll(async () => {
      await fs.rm(tempFixtureDir, { recursive: true, force: true }).catch(() => {})
    })

    it('handles missing output directories gracefully', async () => {
      // Should not crash, should find .output/public
      const { exitCode } = await execa('npx', ['nuxi', 'generate'], {
        cwd: tempFixtureDir,
        env: { NODE_ENV: 'production' },
        reject: false,
      })

      expect(exitCode).toBe(0)

      // Verify it still created duplicates
      const outputDir = join(tempFixtureDir, '.output/public')
      const aboutDuplicate = join(outputDir, 'about.html')
      const exists = await fs.access(aboutDuplicate).then(() => true).catch(() => false)
      expect(exists).toBe(true)
    }, 30000)
  })
})
