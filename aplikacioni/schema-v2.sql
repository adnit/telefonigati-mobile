-- TelefoniGati · versioni 2: data e pritur, shënimet e brendshme, të dhënat e servisit,
-- pronari dhe stafi i ftuar me email. Ekzekutohet në Neon SQL Editor, në databazën telefonigati.

-- Data kur servisi pret që telefoni të jetë gati. Opsionale; klienti e sheh te linku i vet.
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS gati_deri DATE;

-- Shënime të brendshme për një riparim (p.sh. "porositëm pjesën"). I sheh vetëm stafi.
CREATE TABLE IF NOT EXISTS shenimet (
  id BIGSERIAL PRIMARY KEY,
  riparim_id TEXT NOT NULL REFERENCES riparimet (id) ON DELETE CASCADE,
  autori TEXT NOT NULL,
  teksti TEXT NOT NULL CHECK (length(teksti) BETWEEN 1 AND 500),
  koha TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shenimet_riparimi ON shenimet (riparim_id, koha);

-- Të dhënat e servisit që i sheh klienti: një rresht i vetëm.
CREATE TABLE IF NOT EXISTS servisi (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  emri TEXT NOT NULL DEFAULT 'Servisi',
  telefoni TEXT CHECK (telefoni IS NULL OR telefoni ~ '^[+]?[0-9]{8,15}$'),
  orari TEXT,
  adresa TEXT
);
INSERT INTO servisi (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- Roli "pronar": stafi që menaxhon stafin dhe të dhënat e servisit.
ALTER TABLE profilet DROP CONSTRAINT IF EXISTS profilet_roli_check;
ALTER TABLE profilet ADD CONSTRAINT profilet_roli_check CHECK (roli IN ('vizitor', 'servis', 'pronar'));
-- Llogaria ekzistuese e stafit bëhet pronar (sot ka vetëm një).
UPDATE profilet SET roli = 'pronar' WHERE roli = 'servis';

-- Ftesat e stafit: kur dikush hyn me këtë email, bëhet staf automatikisht.
CREATE TABLE IF NOT EXISTS ftesat (
  email TEXT PRIMARY KEY CHECK (email = lower(email) AND email LIKE '%_@_%'),
  krijuar TIMESTAMPTZ NOT NULL DEFAULT now()
);
