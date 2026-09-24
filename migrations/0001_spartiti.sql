-- Fase 1: area riservata, solo consultazione spartiti.
-- pdf_key e musicxml_key sono chiavi di oggetti nel bucket R2 privato (quartetto-privato),
-- non URL pubblici: vengono risolte in URL firmati da un Worker solo per utenti autenticati.

CREATE TABLE spartiti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titolo TEXT NOT NULL,
  compositore TEXT NOT NULL,
  organico TEXT, -- es. "SATB", "SSATB"
  pdf_key TEXT NOT NULL,
  musicxml_key TEXT, -- valorizzato in Fase 2, quando disponibile
  concerto_id TEXT, -- riferimento libero allo slug del concerto in src/content/concerti, se pertinente
  note TEXT,
  creato_il TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_spartiti_compositore ON spartiti(compositore);
