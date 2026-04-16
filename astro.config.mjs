// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://toji.homes',
  output: 'static',
  /** 디렉터리 정적 호스팅·nginx와 맞추기: 링크는 `/about/` 형태 */
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
