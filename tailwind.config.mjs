/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Identità "classica": Cormorant Garamond (graziato rinascimentale) per
      // marchio e titoli, Jost (bastone geometrico) per testi e interfaccia.
      // La chiave `serif` indica il ruolo "titolo". Corsivo Cormorant per i
      // testi latini e i titoli dei brani (.latino).
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Garamond"', 'Georgia', 'serif'],
        sans: ['"Jost"', '"Futura"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        accento: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        marchio: ['"Cormorant Garamond"', '"Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['clamp(4rem, 12vw, 9rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
      },
      colors: {
        // Palette dal logo: inchiostro caldo quasi nero, carta avorio,
        // bronzo (su chiaro) e oro (su scuro).
        ink: {
          DEFAULT: '#1A1814',
          soft:    '#3A352E',
          muted:   '#6F665A',
        },
        paper: {
          DEFAULT: '#FBF9F5',
          warm:    '#F3EEE6',
          dark:    '#E5DDD0',
        },
        // `klein` è il nome storico del colore d'accento: ora è il bronzo del
        // logo. Stesse regole di prima: dettagli rari, mai su testo lungo.
        klein: '#A8834F',
        bronzo: { DEFAULT: '#A8834F', scuro: '#8A6A3A' },
        oro: '#B8954E',
        accent: {
          DEFAULT: '#1A1814',
          dark:    '#6F665A',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#3A352E',
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
