/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(4rem, 12vw, 9rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
      },
      colors: {
        ink: {
          DEFAULT: '#1a2535',
          soft:    '#354a65',
          muted:   '#7088a5',
        },
        paper: {
          DEFAULT: '#f3f1ee',
          warm:    '#e5ecf4',
          dark:    '#d2dde9',
        },
        accent: {
          DEFAULT: '#3d6b8a',
          dark:    '#2a4f6a',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#354a65',
          },
        },
      },
      maxWidth: {
        prose: '65ch',
      },
    },
  },
  plugins: [],
};
