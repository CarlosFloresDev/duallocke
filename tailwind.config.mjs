/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        dark: '#0d0d0d',
        panel: '#161616',
        border: '#2a2a2a',
        red: '#E63946',
        yellow: '#FFD60A',
        blue: '#457B9D',
        green: '#2DC653',
        orange: '#FF6B35',
        muted: '#888888',
      },
    },
  },
  plugins: [],
};
