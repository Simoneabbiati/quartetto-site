/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        // Serif elegante per titoli — adatta al mondo classico/sacro
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        // Sans pulita per il corpo del testo
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Palette sobria: avorio caldo, inchiostro profondo, accento bordeaux discreto
        ink: {
          DEFAULT: '#1a1a1a',
          soft: '#3a3a3a',
          muted: '#6b6b6b',
        },
        paper: {
          DEFAULT: '#fbf9f4', // avorio
          warm: '#f5f1e8',
          dark: '#ebe6d9',
        },
        accent: {
          DEFAULT: '#7a1c2e', // bordeaux liturgico, usato con parsimonia
          dark: '#5a1422',
        },
        gold: {
          DEFAULT: '#b8973e', // oro sacro — candele, manoscritti illuminati
          light: '#d4b86a',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#1a1a1a',
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
