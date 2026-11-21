-- TelefoniGati · përfundimi: historiku i statusit dhe telefoni i klientit (vetëm për stafin).
-- Ekzekutohet në Neon SQL Editor, në databazën telefonigati.

-- Çdo ndryshim statusi ruhet me kohën e vet, që klienti ta shohë kur ndodhi secili hap.
CREATE TABLE IF NOT EXISTS historiku (
  id BIGSERIAL PRIMARY KEY,
  riparim_id TEXT NOT NULL REFERENCES riparimet (id) ON DELETE CASCADE,
  statusi TEXT NOT NULL,
  koha TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS historiku_riparimi ON historiku (riparim_id, koha);

-- Databaza e shkruan historikun vetë: asnjë veprim i aplikacionit nuk mund ta harrojë.
CREATE OR REPLACE FUNCTION shkruaj_historikun() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.statusi IS DISTINCT FROM OLD.statusi THEN
    INSERT INTO historiku (riparim_id, statusi) VALUES (NEW.id, NEW.statusi);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS riparimet_historiku ON riparimet;
CREATE TRIGGER riparimet_historiku AFTER INSERT OR UPDATE OF statusi ON riparimet
  FOR EACH ROW EXECUTE FUNCTION shkruaj_historikun();

-- Riparimet ekzistuese: hapi aktual me kohën e përditësimit të fundit.
INSERT INTO historiku (riparim_id, statusi, koha)
  SELECT id, statusi, perditesuar FROM riparimet r
  WHERE NOT EXISTS (SELECT 1 FROM historiku h WHERE h.riparim_id = r.id);

-- Numri i klientit për WhatsApp. Opsional; e sheh vetëm stafi, kurrë linku i klientit.
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS telefoni TEXT
  CHECK (telefoni IS NULL OR telefoni ~ '^[+]?[0-9]{8,15}$');
