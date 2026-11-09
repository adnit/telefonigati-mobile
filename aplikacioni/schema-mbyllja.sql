-- TelefoniGati · mbyllja e riparimit: statusi i katërt "Marrë" dhe koha kur klienti e mori telefonin.
-- Ekzekuto çdo komandë veç e veç në Neon SQL Editor (databaza telefonigati).
ALTER TABLE riparimet DROP CONSTRAINT IF EXISTS riparimet_statusi_check;
ALTER TABLE riparimet ADD CONSTRAINT riparimet_statusi_check
  CHECK (statusi IN ('Pranuar', 'Në riparim', 'Gati për marrje', 'Marrë'));
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS marre TIMESTAMPTZ;
-- Një riparim i mbyllur ka kohën e marrjes; një i hapur nuk e ka.
ALTER TABLE riparimet DROP CONSTRAINT IF EXISTS riparimet_marre_me_statusin;
ALTER TABLE riparimet ADD CONSTRAINT riparimet_marre_me_statusin
  CHECK ((statusi = 'Marrë') = (marre IS NOT NULL));
