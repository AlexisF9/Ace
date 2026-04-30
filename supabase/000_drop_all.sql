-- ============================================================
-- Migration 000 — Suppression de toutes les tables
-- ⚠️  DESTRUCTIF — perte de toutes les données
-- À exécuter AVANT 001_initial.sql
-- ============================================================

-- Trigger & fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Tables enfants en premier (ordre inverse des FK)
DROP TABLE IF EXISTS public.reactions       CASCADE;
DROP TABLE IF EXISTS public.posts           CASCADE;
DROP TABLE IF EXISTS public.matches         CASCADE;
DROP TABLE IF EXISTS public.club_sports     CASCADE;
DROP TABLE IF EXISTS public.player_sports   CASCADE;
DROP TABLE IF EXISTS public.club_profiles   CASCADE;
DROP TABLE IF EXISTS public.club_accounts   CASCADE;
DROP TABLE IF EXISTS public.player_profiles CASCADE;
DROP TABLE IF EXISTS public.player_accounts CASCADE;
DROP TABLE IF EXISTS public.accounts        CASCADE;
DROP TABLE IF EXISTS public.profiles        CASCADE;
