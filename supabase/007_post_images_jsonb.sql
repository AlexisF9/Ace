-- Change image_urls de text[] vers jsonb pour stocker {url, width, height}
ALTER TABLE posts
  ALTER COLUMN image_urls TYPE jsonb USING '[]'::jsonb;

ALTER TABLE posts
  ALTER COLUMN image_urls SET DEFAULT '[]'::jsonb;
