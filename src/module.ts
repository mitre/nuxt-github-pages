import { defineNuxtModule, logger } from '@nuxt/kit'
import { promises as fs } from 'fs'
import { join, dirname, resolve } from 'path'

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
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-github-pages',
    configKey: 'githubPages',
    compatibility: {
      nuxt: '>=3.0.0'
    }
  },
  defaults: {
    enabled: true,
    outputDirs: ['dist', '.output/public'],
    verbose: true
  },
  setup(options, nuxt) {
    if (!options.enabled) {
      logger.info('nuxt-github-pages module is disabled')
      return
    }

    // Only run during static generation
    if (nuxt.options.nitro.preset !== 'static' && !nuxt.options._generate) {
      return
    }

    // Add the prerender:done hook
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.hooks = nitroConfig.hooks || {}
      nitroConfig.hooks['prerender:done'] = async () => {
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
          } catch {
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
              } else if (entry.isFile() && entry.name === 'index.html') {
                // Found an index.html file
                const relativePath = fullPath.replace(publicDir! + '/', '')
                const dirPath = dirname(relativePath)

                // Skip root index.html
                if (dirPath === '.') continue

                // Create duplicate at parent level
                const duplicatePath = join(publicDir!, `${dirPath}.html`)

                try {
                  await fs.copyFile(fullPath, duplicatePath)
                  if (options.verbose) {
                    logger.success(`Created duplicate: ${dirPath}.html`)
                  }
                } catch (error) {
                  logger.error(`Failed to create duplicate for ${relativePath}:`, error)
                }
              }
            }
          } catch (error) {
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
  }
})