-- TelefoniGati · versioni 4: çmimorja e servisit dhe nënshkrimi i klientit në marrje.
-- Ekzekutohet me: npm run db:migrate -- schema-v4.sql

-- Çmimorja: riparimet e zakonshme me çmimin dhe sa ditë zgjasin.
-- Marka dhe modeli janë opsionale: "Bateria · Samsung" vlen për çdo Samsung, "Bateria" për çdo telefon.
CREATE TABLE IF NOT EXISTS cmimet (
  id BIGSERIAL PRIMARY KEY,
  marka TEXT CHECK (marka IS NULL OR length(marka) BETWEEN 1 AND 40),
  modeli TEXT CHECK (modeli IS NULL OR length(modeli) BETWEEN 1 AND 80),
  problemi TEXT NOT NULL CHECK (length(problemi) BETWEEN 1 AND 60),
  cmimi INTEGER NOT NULL CHECK (cmimi BETWEEN 0 AND 9999),
  dite INTEGER CHECK (dite IS NULL OR dite BETWEEN 0 AND 60),
  krijuar TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS cmimet_unike ON cmimet (coalesce(marka, ''), coalesce(modeli, ''), lower(problemi));

-- Nënshkrimi i klientit kur e merr telefonin (PNG i vogël nga ekrani i stafit).
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS nenshkrimi TEXT;
ALTER TABLE riparimet DROP CONSTRAINT IF EXISTS riparimet_nenshkrimi_format;
ALTER TABLE riparimet ADD CONSTRAINT riparimet_nenshkrimi_format
  CHECK (nenshkrimi IS NULL OR (nenshkrimi LIKE 'data:image/png;base64,%' AND length(nenshkrimi) <= 120000));

-- Disa çmime fillestare që pronari i ndryshon te Cilësimet → Çmimorja.
INSERT INTO cmimet (marka, modeli, problemi, cmimi, dite) VALUES
  ('Apple', NULL, 'Ekrani i thyer', 120, 2),
  ('Apple', NULL, 'Bateria', 60, 1),
  ('Samsung', NULL, 'Ekrani i thyer', 85, 2),
  ('Samsung', NULL, 'Bateria', 40, 1),
  ('Xiaomi', NULL, 'Ekrani i thyer', 55, 2),
  (NULL, NULL, 'Nuk karikohet', 25, 1),
  (NULL, NULL, 'Softueri', 15, 0),
  (NULL, NULL, 'Ra në ujë', 35, 3)
ON CONFLICT DO NOTHING;
