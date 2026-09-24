-- Fase 1b: calendario prove, presenze (RSVP), pezzi da preparare, stato apprendimento.

CREATE TABLE coristi (
  email TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  voce TEXT NOT NULL CHECK (voce IN ('soprano','contralto','mezzosoprano','tenore','baritono','basso')),
  creato_il TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE prove (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,  -- YYYY-MM-DD
  ora TEXT,            -- "20:00"
  luogo TEXT,
  note TEXT,
  creato_il TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE prove_spartiti (
  prova_id INTEGER NOT NULL REFERENCES prove(id),
  spartito_id INTEGER NOT NULL REFERENCES spartiti(id),
  PRIMARY KEY (prova_id, spartito_id)
);

CREATE TABLE presenze (
  prova_id INTEGER NOT NULL REFERENCES prove(id),
  utente_email TEXT NOT NULL,
  stato TEXT NOT NULL CHECK (stato IN ('si','no','forse')),
  aggiornato_il TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (prova_id, utente_email)
);

CREATE TABLE apprendimento (
  spartito_id INTEGER NOT NULL REFERENCES spartiti(id),
  utente_email TEXT NOT NULL,
  imparato INTEGER NOT NULL DEFAULT 0,
  aggiornato_il TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (spartito_id, utente_email)
);

CREATE INDEX idx_presenze_prova ON presenze(prova_id);
CREATE INDEX idx_apprendimento_spartito ON apprendimento(spartito_id);

-- I coristi NON sono elencati qui di proposito: le loro email sono dati
-- personali e questo repository è pubblico. Vivono solo nel database.
--
-- Per aggiungere un corista:
--   npx wrangler d1 execute quartetto-db --remote \
--     --command="INSERT INTO coristi (email, nome, voce) VALUES ('email', 'Nome Cognome', 'soprano')"
--
-- L'email deve coincidere con quella autorizzata nella policy di
-- Cloudflare Access, altrimenti la persona non riesce ad accedere.

INSERT INTO prove_spartiti (prova_id, spartito_id) VALUES (1, 1);
