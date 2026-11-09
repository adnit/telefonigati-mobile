-- TelefoniGati · njoftimet në telefon (Web Push). Një rresht për çdo telefon që klienti e lejoi.
-- Fshihet vetë kur fshihet riparimi.
CREATE TABLE IF NOT EXISTS abonimet (
  id BIGSERIAL PRIMARY KEY,
  kodi TEXT NOT NULL REFERENCES riparimet (kodi) ON DELETE CASCADE,
  endpoint TEXT NOT NULL CHECK (endpoint LIKE 'https://%'),
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  krijuar TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- i njëjti telefon mund të ndjekë disa riparime
  UNIQUE (kodi, endpoint)
);
CREATE INDEX IF NOT EXISTS abonimet_kodi ON abonimet (kodi);
