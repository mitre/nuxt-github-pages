import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    /**
     * Enable or disable the module
     * @default true
     */
    enabled?: boolean;
    /**
     * Additional directories to check for output
     * @default ['dist', '.output/public']
     */
    outputDirs?: string[];
    /**
     * Log output during processing
     * @default true
     */
    verbose?: boolean;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
