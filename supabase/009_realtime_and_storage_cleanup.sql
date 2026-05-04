-- ============================================================
-- Migration 009 — Realtime sur accounts + nettoyage storage
-- ============================================================

-- 1. Active Realtime sur accounts (nécessaire pour détecter la suppression côté client)
--    REPLICA IDENTITY FULL envoie toute la ligne dans le WAL (requis pour le filtre DELETE)
ALTER TABLE public.accounts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;

-- 2. Trigger — supprime les fichiers storage quand un post est supprimé
--    Couvre la suppression manuelle ET la suppression en CASCADE (compte supprimé)
CREATE OR REPLACE FUNCTION public.handle_post_images_deleted()
RETURNS trigger AS $$
DECLARE
  url     text;
  marker  text := '/object/public/post-images/';
  path    text;
BEGIN
  IF OLD.image_urls IS NULL THEN
    RETURN OLD;
  END IF;

  FOR url IN SELECT jsonb_array_elements_text(OLD.image_urls)
  LOOP
    path := substring(url FROM (position(marker IN url) + length(marker)));
    IF path <> '' AND path <> url THEN
      DELETE FROM storage.objects
      WHERE bucket_id = 'post-images' AND name = path;
    END IF;
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_deleted ON public.posts;
CREATE TRIGGER on_post_deleted
  BEFORE DELETE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_post_images_deleted();
