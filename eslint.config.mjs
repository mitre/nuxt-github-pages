// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
    ],
  },
})
  .append(
    // Disable component name rule for test fixtures and playground
    {
      files: ['test/fixtures/**/*.vue', 'playground/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  )
