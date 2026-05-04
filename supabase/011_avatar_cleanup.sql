-- ============================================================
-- Migration 011 — Suppression avatar storage à la suppression de compte
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_account_avatar_deleted()
RETURNS trigger AS $$
DECLARE
  marker  text := '/object/public/avatars/';
  path    text;
BEGIN
  IF OLD.avatar_url IS NULL OR OLD.avatar_url = '' THEN
    RETURN OLD;
  END IF;

  path := substring(OLD.avatar_url FROM (position(marker IN OLD.avatar_url) + length(marker)));
  path := split_part(path, '?', 1);
  IF path <> '' AND path <> OLD.avatar_url THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'avatars' AND name = path;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_account_avatar_deleted ON public.accounts;
CREATE TRIGGER on_account_avatar_deleted
  BEFORE DELETE ON public.accounts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_account_avatar_deleted();
