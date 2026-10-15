-- Skedari: schema.sql (brenda aplikacionit, pranë package.json)
-- Të dhëna fiktive për projektin; ekzekutohet në Neon SQL Editor,
-- në databazën telefonigati.
CREATE TABLE IF NOT EXISTS riparimet (
  id TEXT PRIMARY KEY,
  pajisja TEXT NOT NULL,
  problemi TEXT NOT NULL,
  dorezuar DATE NOT NULL,
  statusi TEXT NOT NULL
    CHECK (statusi IN ('Pranuar', 'Në riparim', 'Gati për marrje')),
  -- çmimi i vlerësuar në banak, në euro
  cmimi INTEGER NOT NULL CHECK (cmimi >= 0),
  -- kostoja shtesë që pret miratimin e klientit; bosh kur nuk ka
  shtese_arsyeja TEXT,
  shtese_cmimi INTEGER CHECK (shtese_cmimi >= 0),
  CHECK ((shtese_arsyeja IS NULL) = (shtese_cmimi IS NULL))
);

INSERT INTO riparimet
  (id, pajisja, problemi, dorezuar, statusi, cmimi, shtese_arsyeja, shtese_cmimi)
VALUES
  ('1', 'iPhone 13', 'Ekrani i thyer', '2026-09-29', 'Gati për marrje', 85, NULL, NULL),
  ('2', 'Samsung Galaxy A54', 'Bateria mbaron shpejt', '2026-09-30', 'Në riparim', 35,
   'Porta e karikimit është e dëmtuar', 15),
  ('3', 'Xiaomi Redmi Note 12', 'Nuk karikohet', '2026-10-01', 'Pranuar', 20, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

SELECT * FROM riparimet ORDER BY id;
