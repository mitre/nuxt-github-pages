import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  githubPages: {
    verbose: true,
    canonicalUrls: true,
    trailingSlash: false,
  },
})
