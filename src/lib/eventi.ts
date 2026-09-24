/**
 * Costruzione dei link "aggiungi al calendario" e "apri nelle mappe".
 * Stanno qui e non nelle pagine perché li usano sia la dashboard sia il
 * dettaglio prova, e devono produrre lo stesso evento.
 */

const DURATA_PREDEFINITA_ORE = 2;

/** '2026-09-27' + '18:30' → '20260927T183000' (ora locale, senza fuso:
 *  Google interpreta l'orario nel fuso di chi clicca, che è quello giusto
 *  per una prova a Milano vista da Milano). */
function formatoGoogle(data: string, ora: string): string {
  return `${data.replace(/-/g, '')}T${ora.replace(':', '')}00`;
}

function sommaOre(ora: string, ore: number): string {
  const [h, m] = ora.split(':').map(Number);
  const totale = (h + ore) % 24;
  return `${String(totale).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface DatiEvento {
  titolo: string;
  data: string;            // YYYY-MM-DD
  ora: string | null;      // HH:MM
  oraFine?: string | null; // HH:MM
  luogo?: string | null;
  indirizzo?: string | null;
  dettagli?: string;
}

export function linkGoogleCalendar(e: DatiEvento): string | null {
  // Senza orario non si può creare un evento con inizio e fine: Google li vuole entrambi.
  if (!e.ora) return null;

  const inizio = formatoGoogle(e.data, e.ora);
  const fine = formatoGoogle(e.data, e.oraFine || sommaOre(e.ora, DURATA_PREDEFINITA_ORE));

  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.titolo,
    dates: `${inizio}/${fine}`,
  });
  // L'indirizzo, se c'è, è più utile del nome del luogo: è quello che il
  // calendario passa al navigatore.
  const posizione = e.indirizzo || e.luogo;
  if (posizione) p.set('location', posizione);
  if (e.dettagli) p.set('details', e.dettagli);

  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function linkMappe(indirizzo?: string | null, luogo?: string | null): string | null {
  const query = indirizzo || luogo;
  if (!query) return null;
  // API ufficiale delle Maps URLs: su telefono apre l'app, su desktop il sito.
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
