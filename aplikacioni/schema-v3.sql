-- TelefoniGati · versioni 3: IMEI, regjistri i veprimeve, përshtypja e klientit
-- dhe kufiri i provave me kode të gabuara. Ekzekutohet në Neon SQL Editor, databaza telefonigati.

-- IMEI i telefonit (15 shifra), i skanuar me kamerë ose i shkruar. E sheh vetëm stafi.
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS imei TEXT;
ALTER TABLE riparimet DROP CONSTRAINT IF EXISTS riparimet_imei_format;
ALTER TABLE riparimet ADD CONSTRAINT riparimet_imei_format CHECK (imei IS NULL OR imei ~ '^[0-9]{15}$');

-- Regjistri i veprimeve: kush bëri çfarë dhe kur, për çdo riparim.
CREATE TABLE IF NOT EXISTS ngjarjet (
  id BIGSERIAL PRIMARY KEY,
  riparim_id TEXT NOT NULL REFERENCES riparimet (id) ON DELETE CASCADE,
  kush TEXT NOT NULL,
  veprimi TEXT NOT NULL,
  koha TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ngjarjet_riparimi ON ngjarjet (riparim_id, koha);

-- Përshtypja e klientit pas marrjes: a i kurseu linku një telefonatë? Një përgjigje për riparim.
CREATE TABLE IF NOT EXISTS pershtypjet (
  riparim_id TEXT PRIMARY KEY REFERENCES riparimet (id) ON DELETE CASCADE,
  kurseu_telefonate BOOLEAN NOT NULL,
  koha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Provat me kode të gabuara sipas IP-së (e ruajtur si hash), për të ndalur hamendësimin e linqeve.
CREATE TABLE IF NOT EXISTS tentativat (
  id BIGSERIAL PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  koha TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tentativat_ip ON tentativat (ip_hash, koha);
