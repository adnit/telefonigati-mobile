-- TelefoniGati · versioni 5: llogaritë opsionale të klientëve.
-- Klienti hyn me Google (roli "vizitor") dhe ruan riparimet e veta në "Riparimet e mia".
-- Lidhja krijohet vetëm nga faqja e riparimit, pra nga dikush që ka linkun privat.
-- Ekzekutohet me: npm run db:migrate -- schema-v5.sql

CREATE TABLE IF NOT EXISTS klientet_riparimet (
  llogaria_id TEXT NOT NULL REFERENCES profilet (llogaria_id) ON DELETE CASCADE,
  riparim_id TEXT NOT NULL REFERENCES riparimet (id) ON DELETE CASCADE,
  ruajtur TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (llogaria_id, riparim_id)
);
CREATE INDEX IF NOT EXISTS klientet_riparimet_riparimi ON klientet_riparimet (riparim_id);
