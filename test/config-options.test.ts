import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeEach } from 'vitest'
import { execa } from 'execa'

// TODO: Fix test fixture build issues in CI (see TEST_MATRIX.md)
describe.skip('nuxt-github-pages configuration', () => {
  const fixtureDir = fileURLToPath(new URL('./fixtures/basic', import.meta.url))
  const configPath = join(fixtureDir, 'nuxt.config.ts')
  let originalConfig: string

  beforeEach(async () => {
    // Save original config
    originalConfig = await fs.readFile(configPath, 'utf-8')
  })

  it('respects enabled: false', async () => {
    // Update config to disable module
    await fs.writeFile(configPath, `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    enabled: false
  }
})`)

    try {
      // Run generate
      const { stdout } = await execa('pnpm', ['nuxi', 'generate'], {
        cwd: fixtureDir,
        env: { NODE_ENV: 'production' },
      })

      // Should see the "module is disabled" message
      expect(stdout).toContain('nuxt-github-pages module is disabled')

      // Check that no duplicates were created
      const outputDir = join(fixtureDir, '.output/public')
      const aboutDuplicate = join(outputDir, 'about.html')
      const exists = await fs.access(aboutDuplicate).then(() => true).catch(() => false)
      expect(exists).toBe(false)
    }
    finally {
      // Restore config
      await fs.writeFile(configPath, originalConfig)
      // Clean up
      await fs.rm(join(fixtureDir, '.output'), { recursive: true, force: true }).catch(() => {})
    }
  }, 30000)

  it('respects verbose: false', async () => {
    // Update config to disable verbose
    await fs.writeFile(configPath, `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    verbose: false
  }
})`)

    try {
      // Run generate
      const { stdout } = await execa('pnpm', ['nuxi', 'generate'], {
        cwd: fixtureDir,
        env: { NODE_ENV: 'production' },
      })

      // Should NOT see verbose messages
      expect(stdout).not.toContain('Creating duplicate HTML files')
      expect(stdout).not.toContain('Found output directory')
      expect(stdout).not.toContain('Created duplicate:')

      // But duplicates should still be created
      const outputDir = join(fixtureDir, '.output/public')
      const aboutDuplicate = join(outputDir, 'about.html')
      const exists = await fs.access(aboutDuplicate).then(() => true).catch(() => false)
      expect(exists).toBe(true)
    }
    finally {
      // Restore config
      await fs.writeFile(configPath, originalConfig)
      // Clean up
      await fs.rm(join(fixtureDir, '.output'), { recursive: true, force: true }).catch(() => {})
    }
  }, 30000)

  it('handles missing output directories gracefully', async () => {
    // Update config with non-existent directories
    await fs.writeFile(configPath, `import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    outputDirs: ['/tmp/does-not-exist', '/another/missing/dir', '.output/public']
  }
})`)

    try {
      // Should not crash, should find .output/public
      const { exitCode, stdout } = await execa('pnpm', ['nuxi', 'generate'], {
        cwd: fixtureDir,
        env: { NODE_ENV: 'production' },
        reject: false,
      })

      expect(exitCode).toBe(0)
      expect(stdout).toContain('Found output directory')
      expect(stdout).toContain('.output/public')

      // Verify it still created duplicates
      const outputDir = join(fixtureDir, '.output/public')
      const aboutDuplicate = join(outputDir, 'about.html')
      const exists = await fs.access(aboutDuplicate).then(() => true).catch(() => false)
      expect(exists).toBe(true)
    }
    finally {
      // Restore config
      await fs.writeFile(configPath, originalConfig)
      // Clean up
      await fs.rm(join(fixtureDir, '.output'), { recursive: true, force: true }).catch(() => {})
    }
  }, 30000)
})
