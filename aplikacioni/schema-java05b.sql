-- Hyrja me Google në vend të GitHub: profili identifikohet me ID-në e llogarisë dhe ka email,
-- që pronari ta aktivizojë stafin sipas email-it.
ALTER TABLE profilet RENAME COLUMN github_id TO llogaria_id;
ALTER TABLE profilet ADD COLUMN IF NOT EXISTS email TEXT;
SELECT llogaria_id, email, roli FROM profilet
