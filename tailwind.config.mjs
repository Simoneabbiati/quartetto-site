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
          DEFAULT: '#1c1410', // nero-seppia, come l'inchiostro antico
          soft: '#3a3028',
          muted: '#7a6e64',
        },
        paper: {
          DEFAULT: '#f2ece0', // pergamena ricca
          warm: '#e8dfcc',   // vellum antico
          dark: '#ddd4ba',
        },
        accent: {
          DEFAULT: '#4a6f8a', // blu polvere sacro — alba nell'abside, lapis lazuli
          dark: '#33516a',
        },
        gold: {
          DEFAULT: '#a87e18', // oro antico — manoscritti illuminati
          light: '#c9a03e',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#3a3028',
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
