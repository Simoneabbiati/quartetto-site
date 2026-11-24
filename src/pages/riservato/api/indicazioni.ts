export const prerender = false;

import type { APIRoute } from 'astro';
import { getAccessEmail, getCorista } from '../../../lib/access';

// Indicazioni di esecuzione di uno spartito (una per riga), modificabili dal
// popup dello spartito. Solo gli admin: sono istruzioni per tutto l'ensemble.
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const email = getAccessEmail(request);

  if (!env?.DB || !email) {
    return new Response(JSON.stringify({ error: 'Non autenticato' }), { status: 401 });
  }

  const io = await getCorista(env.DB, email);
  if (!io?.admin) {
    return new Response(JSON.stringify({ error: 'Non autorizzato' }), { status: 403 });
  }

  const body = await request.json().catch(() => null) as { spartito_id?: number; indicazioni?: string } | null;
  const spartito_id = Number(body?.spartito_id);
  if (!Number.isInteger(spartito_id) || typeof body?.indicazioni !== 'string' || body.indicazioni.length > 4000) {
    return new Response(JSON.stringify({ error: 'Dati non validi' }), { status: 400 });
  }

  // Righe vuote tolte; testo vuoto = nessuna indicazione.
  const testo = body.indicazioni.split('\n').map((r) => r.trim()).filter(Boolean).join('\n');
  const res = await env.DB
    .prepare('UPDATE spartiti SET indicazioni = ? WHERE id = ?')
    .bind(testo || null, spartito_id)
    .run();

  if (!res.meta?.changes) {
    return new Response(JSON.stringify({ error: 'Spartito non trovato' }), { status: 404 });
  }
  return new Response(JSON.stringify({ ok: true, indicazioni: testo }), { headers: { 'Content-Type': 'application/json' } });
};
