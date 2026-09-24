export const prerender = false;

import type { APIRoute } from 'astro';
import { getAccessEmail } from '../../../lib/access';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const email = getAccessEmail(request);

  if (!env?.DB || !email) {
    return new Response(JSON.stringify({ error: 'Non autenticato' }), { status: 401 });
  }

  const body = await request.json().catch(() => null) as { prova_id?: number; stato?: string } | null;
  const prova_id = Number(body?.prova_id);
  const stato = body?.stato;

  if (!Number.isInteger(prova_id) || !['si', 'no', 'forse'].includes(stato ?? '')) {
    return new Response(JSON.stringify({ error: 'Dati non validi' }), { status: 400 });
  }

  await env.DB
    .prepare(
      `INSERT INTO presenze (prova_id, utente_email, stato, aggiornato_il)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(prova_id, utente_email) DO UPDATE SET stato = excluded.stato, aggiornato_il = excluded.aggiornato_il`
    )
    .bind(prova_id, email, stato)
    .run();

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
