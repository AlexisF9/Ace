-- ============================================================
-- Migration 008 — Suppression auth.users en cascade depuis accounts
--
-- Sens déjà couvert :
--   auth.users DELETE → accounts DELETE CASCADE → tout le reste CASCADE
--
-- Sens manquant (ajouté ici) :
--   accounts DELETE → auth.users DELETE
--   (le trigger détecte la suppression d'accounts et nettoie auth)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_account_deleted()
RETURNS trigger AS $$
BEGIN
  -- Supprime l'entrée auth — no-op si déjà supprimée (évite la boucle
  -- quand la suppression vient elle-même de auth.users via CASCADE)
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_account_deleted ON public.accounts;
CREATE TRIGGER on_account_deleted
  AFTER DELETE ON public.accounts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_account_deleted();
