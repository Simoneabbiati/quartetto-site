export const prerender = false;

import type { APIRoute } from 'astro';

function erroreLeggibile(messaggio: string, status: number) {
  return new Response(messaggio, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime?.env;
  const spartitoId = Number(params.spartitoId);
  const voce = params.voce;

  if (!Number.isInteger(spartitoId) || !voce) {
    return erroreLeggibile('Traccia non valida.', 400);
  }
  if (!env?.DB || !env?.SPARTITI) {
    return erroreLeggibile('Servizio non disponibile.', 500);
  }

  try {
    const row = await env.DB
      .prepare('SELECT audio_key FROM tracce_audio WHERE spartito_id = ? AND voce = ?')
      .bind(spartitoId, voce)
      .first();

    if (!row) {
      return erroreLeggibile('Traccia non trovata.', 404);
    }

    const object = await env.SPARTITI.get(row.audio_key as string);
    if (!object) {
      return erroreLeggibile('File audio non trovato nello storage.', 404);
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        // l'audio cambia raramente (solo se ricarico una traccia): una cache
        // privata più lunga di quella dei PDF evita di riscaricarlo a ogni ascolto.
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch (err) {
    const dettaglio = err instanceof Error ? err.message : String(err);
    return erroreLeggibile(`Errore nel caricamento della traccia: ${dettaglio}`, 500);
  }
};
