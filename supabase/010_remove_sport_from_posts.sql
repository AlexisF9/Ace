-- Migration 010 — Suppression de la colonne sport sur posts
ALTER TABLE public.posts DROP COLUMN IF EXISTS sport;
