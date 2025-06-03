export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  githubPages: {
    verbose: true,
    canonicalUrls: true,
  },
})
