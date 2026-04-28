import { defineCollection, z } from 'astro:content';

/**
 * Concerti
 * Ogni concerto è un file Markdown in src/content/concerti/
 * Naming consigliato: YYYY-MM-DD-citta.md (es. 2026-06-15-milano.md)
 */
const concerti = defineCollection({
  type: 'content',
  schema: z.object({
    titolo: z.string(),
    data: z.date(),
    ora: z.string().optional(), // es. "21:00"
    luogo: z.string(), // es. "Cattedrale di S. Maria"
    citta: z.string(),
    indirizzo: z.string().optional(),
    occasione: z.enum(['liturgia', 'concerto', 'festival']),
    programma: z
      .array(
        z.object({
          compositore: z.string(),
          opera: z.string(),
        })
      )
      .optional(),
    ingresso: z.string().optional(), // es. "Libero", "10€", "Offerta libera"
    biglietti: z.string().url().optional(),
    locandina: z.string().optional(), // path immagine in /public/images/
    note: z.string().optional(),
    lingua: z.enum(['it', 'en']).default('it'),
  }),
});

/**
 * Cantanti — le 4 schede individuali
 * Naming: 01-soprano.md, 02-contralto.md, 03-tenore.md, 04-basso.md
 * Il prefisso numerico determina l'ordine di visualizzazione
 */
const cantanti = defineCollection({
  type: 'content',
  schema: z.object({
    nome: z.string(),
    voce: z.enum(['soprano', 'contralto', 'mezzosoprano', 'tenore', 'baritono', 'basso']),
    foto: z.string().optional(), // path in /public/images/cantanti/
    bioBreve: z.string(), // 1-2 frasi, usata in elenchi
    ordine: z.number().default(99),
    lingua: z.enum(['it', 'en']).default('it'),
  }),
});

/**
 * Pagine narrative (Chi siamo, Repertorio)
 * Permettono di tenere il contenuto lungo in Markdown invece che in .astro
 */
const pagine = defineCollection({
  type: 'content',
  schema: z.object({
    titolo: z.string(),
    sottotitolo: z.string().optional(),
    lingua: z.enum(['it', 'en']).default('it'),
  }),
});

export const collections = {
  concerti,
  cantanti,
  pagine,
};
