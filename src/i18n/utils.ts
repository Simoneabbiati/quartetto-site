import it from './it.json';
import en from './en.json';

export const translations = { it, en } as const;

export type Lang = keyof typeof translations;

/**
 * Restituisce una funzione di traduzione per la lingua data.
 * Uso: const t = useTranslations('it'); t('nav.concerti')
 */
export function useTranslations(lang: Lang) {
  return function t(key: string, vars: Record<string, string | number> = {}): string {
    const parts = key.split('.');
    let value: unknown = translations[lang];
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        console.warn(`[i18n] Chiave mancante: "${key}" in lingua "${lang}"`);
        return key;
      }
    }
    if (typeof value !== 'string') {
      console.warn(`[i18n] La chiave "${key}" non punta a una stringa`);
      return key;
    }
    // Sostituzione semplice di placeholder {nome}
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      vars[name] !== undefined ? String(vars[name]) : `{${name}}`
    );
  };
}

/**
 * Base path del sito (es. '/quartetto-site' su GitHub Pages, '' in locale/root).
 * Normalizzato senza slash finale.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Antepone il base path a un percorso interno.
 * withBase('/concerti') → '/quartetto-site/concerti'
 * withBase('/')         → '/quartetto-site/'
 */
export function withBase(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}` || '/';
}

/**
 * Rimuove il base path da un pathname, restituendo il percorso "logico".
 * stripBase('/quartetto-site/en/concerti') → '/en/concerti'
 */
export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) {
    return pathname.slice(BASE.length) || '/';
  }
  return pathname;
}

/**
 * Estrae la lingua corrente dall'URL (base-aware).
 * /en/* → 'en', tutto il resto → 'it'
 */
export function getLangFromUrl(url: URL): Lang {
  const [, segment] = stripBase(url.pathname).split('/');
  if (segment === 'en') return 'en';
  return 'it';
}
