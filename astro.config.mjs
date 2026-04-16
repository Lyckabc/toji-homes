// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { SITE_ORIGIN } from './src/lib/site.ts';

export default defineConfig({
  site: SITE_ORIGIN,
  output: 'static',
  /** 디렉터리 정적 호스팅·nginx와 맞추기: 링크는 `/about/` 형태 */
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
