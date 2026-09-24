export const prerender = false;

import type { APIRoute } from 'astro';

// Errori mostrati dentro l'iframe del popup: devono essere leggibili,
// altrimenti l'utente vede solo un riquadro vuoto senza capire cosa è andato storto.
function erroreLeggibile(messaggio: string, status: number) {
  return new Response(
    `<!doctype html><meta charset="utf-8">
     <div style="font-family:system-ui,sans-serif;padding:2rem;color:#1a2535;background:#fff">
       <p style="font-size:1rem;margin:0 0 .5rem">${messaggio}</p>
       <p style="font-size:.85rem;color:#6b7684;margin:0">Segnala il problema a chi gestisce il sito.</p>
     </div>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env;
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return erroreLeggibile('Spartito non valido.', 400);
  }
  if (!env?.DB) {
    return erroreLeggibile('Database non collegato (binding DB mancante).', 500);
  }
  if (!env?.SPARTITI) {
    return erroreLeggibile('Storage non collegato (binding SPARTITI mancante).', 500);
  }

  try {
    const row = await env.DB
      .prepare('SELECT pdf_key, titolo FROM spartiti WHERE id = ?')
      .bind(id)
      .first();

    if (!row) {
      return erroreLeggibile('Spartito non trovato nel database.', 404);
    }

    const object = await env.SPARTITI.get(row.pdf_key as string);
    if (!object) {
      return erroreLeggibile(`File non trovato nello storage (${row.pdf_key}).`, 404);
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${row.titolo}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    // Senza questo, un errore inatteso restituirebbe un 500 con corpo vuoto:
    // nell'iframe si vedrebbe solo un riquadro vuoto, senza spiegazione.
    const dettaglio = err instanceof Error ? err.message : String(err);
    return erroreLeggibile(`Errore nel caricamento dello spartito: ${dettaglio}`, 500);
  }
};
