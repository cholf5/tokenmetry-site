import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tokenmetry.app',
  trailingSlash: 'never',
  // 旧英文路径：默认语言 en 已上根路径，/en 生成 meta-refresh 跳页
  redirects: {
    '/en': '/',
  },
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
