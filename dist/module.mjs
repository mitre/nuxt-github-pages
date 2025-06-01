import { defineNuxtModule, logger } from '@nuxt/kit';
import { promises } from 'fs';
import { resolve, join, dirname } from 'path';

const module = defineNuxtModule({
  meta: {
    name: "nuxt-github-pages",
    configKey: "githubPages",
    compatibility: {
      nuxt: ">=3.0.0"
    }
  },
  defaults: {
    enabled: true,
    outputDirs: ["dist", ".output/public"],
    verbose: true
  },
  setup(options, nuxt) {
    if (!options.enabled) {
      logger.info("nuxt-github-pages module is disabled");
      return;
    }
    if (nuxt.options.nitro.preset !== "static" && !nuxt.options._generate) {
      return;
    }
    nuxt.hook("nitro:config", (nitroConfig) => {
      nitroConfig.hooks = nitroConfig.hooks || {};
      nitroConfig.hooks["prerender:done"] = async () => {
        const possibleDirs = options.outputDirs.map((dir) => resolve(dir));
        let publicDir = null;
        for (const dir of possibleDirs) {
          try {
            await promises.access(dir);
            publicDir = dir;
            if (options.verbose) {
              logger.success(`Found output directory: ${dir}`);
            }
            break;
          } catch {
          }
        }
        if (!publicDir) {
          if (options.verbose) {
            logger.info("No output directory found, skipping duplicate file creation");
          }
          return;
        }
        async function processDirectory(dir) {
          try {
            const entries = await promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = join(dir, entry.name);
              if (entry.isDirectory()) {
                if (entry.name.startsWith("_") || entry.name.startsWith(".")) {
                  continue;
                }
                await processDirectory(fullPath);
              } else if (entry.isFile() && entry.name === "index.html") {
                const relativePath = fullPath.replace(publicDir + "/", "");
                const dirPath = dirname(relativePath);
                if (dirPath === ".") continue;
                const duplicatePath = join(publicDir, `${dirPath}.html`);
                try {
                  await promises.copyFile(fullPath, duplicatePath);
                  if (options.verbose) {
                    logger.success(`Created duplicate: ${dirPath}.html`);
                  }
                } catch (error) {
                  logger.error(`Failed to create duplicate for ${relativePath}:`, error);
                }
              }
            }
          } catch (error) {
            logger.error(`Error processing directory ${dir}:`, error);
          }
        }
        if (options.verbose) {
          logger.info("Creating duplicate HTML files for GitHub Pages...");
        }
        await processDirectory(publicDir);
        if (options.verbose) {
          logger.success("Duplicate file creation complete");
        }
      };
    });
  }
});

export { module as default };
