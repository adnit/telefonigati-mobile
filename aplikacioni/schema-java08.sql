-- Java 8 · TelefoniGati: fotoja e telefonit në pranim (kamera e telefonit të servisit).
-- Ruhet si JPEG i zvogëluar (data URL). Kufiri ~300 KB mban databazën të vogël.
ALTER TABLE riparimet ADD COLUMN IF NOT EXISTS foto TEXT;
ALTER TABLE riparimet DROP CONSTRAINT IF EXISTS riparimet_foto_jpeg;
ALTER TABLE riparimet ADD CONSTRAINT riparimet_foto_jpeg
  CHECK (foto IS NULL OR (foto LIKE 'data:image/jpeg;base64,%' AND length(foto) <= 400000));
SELECT id, pajisja, foto IS NOT NULL AS ka_foto FROM riparimet ORDER BY id;
