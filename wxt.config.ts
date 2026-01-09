import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'SEAS',
    permissions: ['scripting', 'activeTab'],
    host_permissions: ['*://*.appsheet.com/*'],
    action: {},
  },
  alias: {
    '@app': 'src/app',
    '@pages': 'src/pages',
    '@widgets': 'src/widgets',
    '@features': 'src/features',
    '@entities': 'src/entities',
    '@shared': 'src/shared',
  },
});
