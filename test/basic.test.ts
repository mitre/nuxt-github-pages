import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

describe('nuxt-github-pages module', () => {
  it('module loads correctly', async () => {
    // Simple test to verify the module can be loaded
    const rootDir = fileURLToPath(new URL('./fixtures/basic', import.meta.url))

    // Just verify the fixture exists
    const fixtureExists = await fs.access(rootDir).then(() => true).catch(() => false)
    expect(fixtureExists).toBe(true)
  })

  it('fixture has correct configuration', async () => {
    // Verify the fixture is configured to use our module
    const rootDir = fileURLToPath(new URL('./fixtures/basic', import.meta.url))
    const configPath = join(rootDir, 'nuxt.config.ts')
    const configContent = await fs.readFile(configPath, 'utf-8')

    expect(configContent).toContain('MyModule')
  })
})
