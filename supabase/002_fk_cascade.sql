-- ============================================================
-- Migration 002 — Contraintes FK ON DELETE pour suppression utilisateur
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- Posts : supprimés avec l'auteur
ALTER TABLE posts
  DROP CONSTRAINT posts_author_id_fkey,
  ADD CONSTRAINT posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES accounts ON DELETE CASCADE;

-- Réactions : supprimées avec l'auteur
ALTER TABLE reactions
  DROP CONSTRAINT reactions_user_id_fkey,
  ADD CONSTRAINT reactions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES accounts ON DELETE CASCADE;

-- Matchs : historique conservé, référence joueur nullifiée
ALTER TABLE matches
  DROP CONSTRAINT matches_player1_id_fkey,
  ADD CONSTRAINT matches_player1_id_fkey
    FOREIGN KEY (player1_id) REFERENCES accounts ON DELETE SET NULL;

ALTER TABLE matches
  DROP CONSTRAINT matches_player2_id_fkey,
  ADD CONSTRAINT matches_player2_id_fkey
    FOREIGN KEY (player2_id) REFERENCES accounts ON DELETE SET NULL;
