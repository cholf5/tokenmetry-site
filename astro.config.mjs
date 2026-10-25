import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tokenmetry.app',
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
