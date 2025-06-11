import { promises as fs } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { defineNuxtModule, logger } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Enable or disable the module
   * @default true
   */
  enabled?: boolean
  /**
   * Additional directories to check for output
   * @default ['dist', '.output/public']
   */
  outputDirs?: string[]
  /**
   * Log output during processing
   * @default true
   */
  verbose?: boolean
  /**
   * Add canonical URLs to prevent SEO duplicate content issues
   * @default true
   */
  canonicalUrls?: boolean
  /**
   * Whether to use trailing slashes in canonical URLs
   * @default false
   */
  trailingSlash?: boolean
  /**
   * Create duplicate HTML files to avoid GitHub Pages redirects
   * Set to false if you only need canonical URLs without file duplication
   * @default true
   */
  createDuplicates?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-github-pages',
    configKey: 'githubPages',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    enabled: true,
    outputDirs: ['dist', '.output/public'],
    verbose: true,
    canonicalUrls: true,
    trailingSlash: false,
    createDuplicates: true,
  },
  setup(options, nuxt) {
    if (!options.enabled) {
      logger.info('nuxt-github-pages module is disabled')
      return
    }

    // Only run during static generation
    if (nuxt.options.nitro.preset !== 'static' && !(nuxt.options as any)._generate /* TODO: remove in future */) {
      return
    }

    // Add the prerender:done hook
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.hooks = nitroConfig.hooks || {}
      // Type assertion for dynamic hook assignment
      const hooks = nitroConfig.hooks as Record<string, () => void | Promise<void>>
      hooks['prerender:done'] = async () => {
        const possibleDirs = options.outputDirs!.map(dir => resolve(dir))
        let publicDir: string | null = null

        // Find the actual output directory
        for (const dir of possibleDirs) {
          try {
            await fs.access(dir)
            publicDir = dir
            if (options.verbose) {
              logger.success(`Found output directory: ${dir}`)
            }
            break
          }
          catch {
            // Directory doesn't exist, try next
          }
        }

        if (!publicDir) {
          if (options.verbose) {
            logger.info('No output directory found, skipping duplicate file creation')
          }
          return
        }

        async function processDirectory(dir: string): Promise<void> {
          try {
            const entries = await fs.readdir(dir, { withFileTypes: true })

            for (const entry of entries) {
              const fullPath = join(dir, entry.name)

              if (entry.isDirectory()) {
                // Skip special directories
                if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
                  continue
                }
                // Recursively process subdirectories
                await processDirectory(fullPath)
              }
              else if (entry.isFile() && entry.name === 'index.html') {
                // Found an index.html file
                const relativePath = fullPath.replace(publicDir! + '/', '')
                const dirPath = dirname(relativePath)

                // Skip root index.html
                if (dirPath === '.') continue

                // Process canonical URLs
                if (options.canonicalUrls) {
                  try {
                    let htmlContent = await fs.readFile(fullPath, 'utf-8')

                    // Determine the canonical path based on preference
                    const canonicalPath = options.trailingSlash
                      ? `/${dirPath}/`
                      : `/${dirPath}`

                    // Check if canonical already exists
                    if (!htmlContent.includes('rel="canonical"')) {
                      // Find the head tag and inject canonical link
                      const headMatch = htmlContent.match(/<head[^>]*>/)
                      if (headMatch) {
                        const headTag = headMatch[0]
                        const canonicalTag = `\n  <link rel="canonical" href="${canonicalPath}">`
                        htmlContent = htmlContent.replace(headTag, headTag + canonicalTag)

                        // Write the updated content back to the original file
                        await fs.writeFile(fullPath, htmlContent, 'utf-8')

                        if (options.verbose) {
                          logger.info(`Added canonical URL to ${relativePath}: ${canonicalPath}`)
                        }
                      }
                    }

                    // Create duplicate at parent level if enabled
                    if (options.createDuplicates) {
                      const duplicatePath = join(publicDir!, `${dirPath}.html`)

                      // Write the same content (with canonical) to the duplicate
                      await fs.writeFile(duplicatePath, htmlContent, 'utf-8')

                      if (options.verbose) {
                        logger.success(`Created duplicate: ${dirPath}.html`)
                      }
                    }
                  }
                  catch (error) {
                    logger.error(`Failed to process ${relativePath}:`, error)
                  }
                }
                else if (options.createDuplicates) {
                  // No canonical URLs, just copy the file
                  const duplicatePath = join(publicDir!, `${dirPath}.html`)

                  try {
                    await fs.copyFile(fullPath, duplicatePath)
                    if (options.verbose) {
                      logger.success(`Created duplicate: ${dirPath}.html`)
                    }
                  }
                  catch (error) {
                    logger.error(`Failed to create duplicate for ${relativePath}:`, error)
                  }
                }
              }
            }
          }
          catch (error) {
            logger.error(`Error processing directory ${dir}:`, error)
          }
        }

        if (options.verbose) {
          logger.info('Creating duplicate HTML files for GitHub Pages...')
        }

        await processDirectory(publicDir)
        if (options.verbose) {
          logger.success('Duplicate file creation complete')
        }
      }
    })
  },
})
// test
