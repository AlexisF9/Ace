-- Remplace image_url (scalaire) par image_urls (tableau)
ALTER TABLE posts DROP COLUMN IF EXISTS image_url;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
