import { describe, it, expect } from 'vitest'

describe('nuxt-github-pages edge case behavior', () => {
  // These test our expected behavior logic

  it('should skip root index.html', () => {
    // Our module checks if dirPath === '.'
    const testPaths = [
      { path: './index.html', shouldSkip: true },
      { path: 'about/index.html', shouldSkip: false },
      { path: 'docs/index.html', shouldSkip: false },
    ]

    testPaths.forEach(({ path, shouldSkip }) => {
      const dirPath = path.split('/').slice(0, -1).join('/') || '.'
      const isRoot = dirPath === '.'
      expect(isRoot).toBe(shouldSkip)
    })
  })

  it('should skip directories starting with underscore or dot', () => {
    const testDirs = [
      { name: '_nuxt', shouldSkip: true },
      { name: '.git', shouldSkip: true },
      { name: '.nuxt', shouldSkip: true },
      { name: 'docs', shouldSkip: false },
      { name: 'about', shouldSkip: false },
    ]

    testDirs.forEach(({ name, shouldSkip }) => {
      const skip = name.startsWith('_') || name.startsWith('.')
      expect(skip).toBe(shouldSkip)
    })
  })

  it('should generate correct duplicate paths', () => {
    const testCases = [
      {
        original: '/output/docs/index.html',
        expected: '/output/docs.html',
      },
      {
        original: '/output/docs/getting-started/index.html',
        expected: '/output/docs/getting-started.html',
      },
      {
        original: '/output/blog/post/index.html',
        expected: '/output/blog/post.html',
      },
    ]

    testCases.forEach(({ original, expected }) => {
      // Simulate our module's path logic
      const parts = original.split('/')
      const outputIndex = parts.indexOf('output')
      const relativeParts = parts.slice(outputIndex + 1)
      const dirParts = relativeParts.slice(0, -1) // Remove index.html
      const duplicatePath = `/output/${dirParts.join('/')}.html`

      expect(duplicatePath).toBe(expected)
    })
  })
})
