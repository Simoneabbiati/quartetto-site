export const prerender = false;

import type { APIRoute } from 'astro';
import { getAccessEmail, getCorista } from '../../../lib/access';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const email = getAccessEmail(request);

  if (!env?.DB || !email) {
    return new Response(JSON.stringify({ error: 'Non autenticato' }), { status: 401 });
  }

  const body = await request.json().catch(() => null) as { prova_id?: number; stato?: string; utente_email?: string } | null;
  const prova_id = Number(body?.prova_id);
  const stato = body?.stato;

  if (!Number.isInteger(prova_id) || !['si', 'no', 'forse'].includes(stato ?? '')) {
    return new Response(JSON.stringify({ error: 'Dati non validi' }), { status: 400 });
  }

  // Di norma si segna solo la propria presenza. Un admin può segnarla per un
  // altro corista, purché sia in anagrafica: l'identità di chi scrive viene
  // sempre da Access, mai dal corpo della richiesta.
  let destinatario = email;
  if (body?.utente_email && body.utente_email !== email) {
    const io = await getCorista(env.DB, email);
    if (!io?.admin) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), { status: 403 });
    }
    if (!(await getCorista(env.DB, body.utente_email))) {
      return new Response(JSON.stringify({ error: 'Corista non trovato' }), { status: 400 });
    }
    destinatario = body.utente_email;
  }

  await env.DB
    .prepare(
      `INSERT INTO presenze (prova_id, utente_email, stato, aggiornato_il)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(prova_id, utente_email) DO UPDATE SET stato = excluded.stato, aggiornato_il = excluded.aggiornato_il`
    )
    .bind(prova_id, destinatario, stato)
    .run();

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
