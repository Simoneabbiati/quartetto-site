/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Un'unica famiglia, Instrument Sans: larghezza ridotta per titoli e
      // marchio, normale per il testo. La chiave `serif` resta per non toccare
      // le decine di `font-serif` nelle pagine: indica il ruolo "titolo", non
      // un carattere graziato. Instrument Serif (corsivo) solo per i testi
      // latini, con la classe .latino.
      fontFamily: {
        serif: ['"Instrument Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        sans: ['"Instrument Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        accento: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['clamp(4rem, 12vw, 9rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
      },
      colors: {
        ink: {
          DEFAULT: '#000000',
          soft:    '#1f1f1f',
          muted:   '#616161',
        },
        paper: {
          DEFAULT: '#ffffff',
          warm:    '#f5f5f5',
          dark:    '#e6e6e6',
        },
        // Blu Klein: dettagli rari, una sola cosa blu per schermata
        // (globo, forma d'onda mentre suona, segno del marchio, voce di menu
        // attiva, selezione, contorno di focus). Mai su testi, foto, avviso.
        klein: '#002FA7',
        accent: {
          DEFAULT: '#000000',
          dark:    '#616161',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#1f1f1f',
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
