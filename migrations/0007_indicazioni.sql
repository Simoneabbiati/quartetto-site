-- Indicazioni di esecuzione per uno spartito (chi canta cosa, bordoni,
-- strofe a solo...): compaiono nel popup dello spartito, sotto l'audio.
-- Una indicazione per riga.
ALTER TABLE spartiti ADD COLUMN indicazioni TEXT;
