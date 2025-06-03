import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 3 minutes for CI, 1 minute locally
    testTimeout: process.env.CI ? 180000 : 60000,
    hookTimeout: process.env.CI ? 180000 : 60000,
  },
})
