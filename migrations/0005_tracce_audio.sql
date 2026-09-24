-- Tracce audio per parte: generate una volta sola dallo spartito (dal
-- MusicXML corretto in MuseScore) e riascoltate da tutti da lì in poi —
-- stesso principio dei PDF, nessun costo per ogni ascolto.
CREATE TABLE tracce_audio (
  spartito_id INTEGER NOT NULL REFERENCES spartiti(id),
  voce TEXT NOT NULL, -- 'tutti' oppure una voce (soprano/contralto/tenore/basso/...)
  audio_key TEXT NOT NULL, -- chiave dell'oggetto nel bucket R2 quartetto-privato
  ordine INTEGER NOT NULL DEFAULT 99, -- ordine di visualizzazione (tutti prima, poi le voci)
  PRIMARY KEY (spartito_id, voce)
);
