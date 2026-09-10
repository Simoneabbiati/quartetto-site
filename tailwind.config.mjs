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
          DEFAULT: '#131c29',
          soft:    '#2b3d54',
          muted:   '#4c627d',
        },
        paper: {
          DEFAULT: '#f6f4f1',
          warm:    '#dde7f1',
          dark:    '#c9d6e4',
        },
        accent: {
          DEFAULT: '#2f5a78',
          dark:    '#213f56',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#2b3d54',
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
