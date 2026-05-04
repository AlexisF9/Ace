-- ============================================================
-- Migration 012 — Trigger suppression post : non-bloquant
-- Toute erreur dans le nettoyage storage est ignorée
-- Le DELETE du post réussit toujours
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_post_images_deleted()
RETURNS trigger AS $$
DECLARE
  url     text;
  marker  text := '/object/public/post-images/';
  path    text;
BEGIN
  BEGIN
    IF OLD.image_urls IS NOT NULL THEN
      FOR url IN SELECT jsonb_array_elements_text(OLD.image_urls)
      LOOP
        path := split_part(
          substring(url FROM (position(marker IN url) + length(marker))),
          '?', 1
        );
        IF path <> '' AND path <> url THEN
          DELETE FROM storage.objects
          WHERE bucket_id = 'post-images' AND name = path;
        END IF;
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
