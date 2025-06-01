import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { execa } from 'execa'

describe('nuxt-github-pages integration', () => {
  it('creates duplicate HTML files during generate', async () => {
    const fixtureDir = fileURLToPath(new URL('./fixtures/basic', import.meta.url))
    
    // Run nuxt generate
    await execa('pnpm', ['nuxi', 'generate'], {
      cwd: fixtureDir,
      env: {
        NODE_ENV: 'production'
      }
    })
    
    const outputDir = join(fixtureDir, '.output/public')
    
    // Create test structure
    const testDirs = ['docs', 'docs/getting-started', 'blog', 'about']
    
    for (const dir of testDirs) {
      const indexPath = join(outputDir, dir, 'index.html')
      const duplicatePath = join(outputDir, `${dir}.html`)
      
      // Check if index.html exists
      const indexExists = await fs.access(indexPath).then(() => true).catch(() => false)
      
      if (indexExists) {
        // Check if duplicate was created
        const duplicateExists = await fs.access(duplicatePath).then(() => true).catch(() => false)
        expect(duplicateExists).toBe(true)
        
        // Verify content matches
        const indexContent = await fs.readFile(indexPath, 'utf-8')
        const duplicateContent = await fs.readFile(duplicatePath, 'utf-8')
        expect(duplicateContent).toBe(indexContent)
      }
    }
    
    // Clean up
    await fs.rm(outputDir, { recursive: true, force: true })
  }, 30000) // 30 second timeout for build
})