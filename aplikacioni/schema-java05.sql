-- Java 5 · TelefoniGati: hyrja e servisit, linku privat i klientit dhe vendimi i ruajtur.
-- Ekzekutohet në Neon SQL Editor, në databazën telefonigati. Nuk fshin riparimet.

-- Kush ka hyrë (fillimisht me GitHub; nga schema-java05b.sql me Google). Çdo hyrje e re është "vizitor"; vetëm pronari e bën "servis" në SQL.
CREATE TABLE IF NOT EXISTS profilet (
  github_id TEXT PRIMARY KEY,
  emri TEXT NOT NULL,
  roli TEXT NOT NULL DEFAULT 'vizitor' CHECK (roli IN ('vizitor', 'servis'))
);

-- Numrat e riparimeve të reja (të vjetrat janë 1–3).
CREATE SEQUENCE IF NOT EXISTS riparimet_nr START 100;

-- Kodi i linkut privat të klientit: i gjatë dhe i rastësishëm, që të mos merret me mend.
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS kodi TEXT;
UPDATE riparimet SET kodi = replace(gen_random_uuid()::text, '-', '') WHERE kodi IS NULL;
ALTER TABLE riparimet ALTER COLUMN kodi SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS riparimet_kodi ON riparimet (kodi);

-- Vendimi i klientit për koston shtesë: pritje, miratuar ose refuzuar.
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS vendimi TEXT
  CHECK (vendimi IN ('pritje', 'miratuar', 'refuzuar'));
UPDATE riparimet SET vendimi = 'pritje' WHERE shtese_arsyeja IS NOT NULL AND vendimi IS NULL;
ALTER TABLE riparimet DROP CONSTRAINT IF EXISTS riparimet_vendimi_me_shtese;
ALTER TABLE riparimet ADD CONSTRAINT riparimet_vendimi_me_shtese
  CHECK ((shtese_arsyeja IS NULL) = (vendimi IS NULL));

-- Koha e ndryshimit të fundit, që klienti ta dijë sa i ri është statusi.
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS perditesuar TIMESTAMPTZ NOT NULL DEFAULT now();

SELECT id, pajisja, statusi, vendimi, left(kodi, 6) AS kodi_fillimi FROM riparimet ORDER BY id;
