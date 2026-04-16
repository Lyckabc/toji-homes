// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://toji.homes',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
