import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://duallocke.pages.dev',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    // `npm run dev` serves the UI; run `npm run preview` in another terminal for the API on :8788.
    server: { proxy: { '/api': 'http://127.0.0.1:8788' } },
  },
});
