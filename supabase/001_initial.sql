-- ============================================================
-- Ace — Migration initiale
-- À exécuter dans Supabase SQL Editor (ou via Supabase CLI)
-- ============================================================

-- ─── Tables ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.accounts (
  id           uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  account_type text NOT NULL DEFAULT 'player', -- 'player' | 'club'
  username     text UNIQUE NOT NULL,
  avatar_url   text,
  city         text,
  role         text NOT NULL DEFAULT 'user',   -- 'user' | 'admin' | 'moderator'
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.player_accounts (
  profile_id uuid PRIMARY KEY REFERENCES public.accounts ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name  text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.player_sports (
  profile_id uuid  REFERENCES public.accounts ON DELETE CASCADE,
  sport      text  NOT NULL, -- 'tennis' | 'padel'
  level      text,
  hidden     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (profile_id, sport)
);

CREATE TABLE IF NOT EXISTS public.club_accounts (
  profile_id    uuid PRIMARY KEY REFERENCES public.accounts ON DELETE CASCADE,
  club_name     text NOT NULL DEFAULT '',
  cover_url     text,
  address       text,
  postal_code   text,
  phone         text,
  website       text,
  description   text,
  opening_hours jsonb,
  verified      boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.club_sports (
  club_id uuid REFERENCES public.accounts ON DELETE CASCADE,
  sport   text NOT NULL, -- 'tennis' | 'padel'
  PRIMARY KEY (club_id, sport)
);

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.accounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_sports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_sports     ENABLE ROW LEVEL SECURITY;

-- accounts
CREATE POLICY "accounts_read_all"  ON public.accounts FOR SELECT USING (true);
CREATE POLICY "accounts_write_own" ON public.accounts FOR ALL   USING (auth.uid() = id);

-- player_accounts
CREATE POLICY "player_accounts_read_all"  ON public.player_accounts FOR SELECT USING (true);
CREATE POLICY "player_accounts_write_own" ON public.player_accounts FOR ALL   USING (auth.uid() = profile_id);

-- player_sports (le champ hidden est privé)
CREATE POLICY "player_sports_read_public" ON public.player_sports FOR SELECT
  USING (auth.uid() = profile_id OR hidden = false);
CREATE POLICY "player_sports_write_own" ON public.player_sports FOR ALL
  USING (auth.uid() = profile_id);

-- club_accounts
CREATE POLICY "club_accounts_read_all"  ON public.club_accounts FOR SELECT USING (true);
CREATE POLICY "club_accounts_write_own" ON public.club_accounts FOR ALL   USING (auth.uid() = profile_id);

-- club_sports
CREATE POLICY "club_sports_read_all"  ON public.club_sports FOR SELECT USING (true);
CREATE POLICY "club_sports_write_own" ON public.club_sports FOR ALL   USING (auth.uid() = club_id);

-- ─── Trigger — création automatique du profil ────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_account_type text;
BEGIN
  v_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'player');

  INSERT INTO public.accounts (id, account_type, username, avatar_url, city)
  VALUES (
    NEW.id,
    v_account_type,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'city'
  )
  ON CONFLICT (id) DO NOTHING;

  IF v_account_type = 'player' THEN
    INSERT INTO public.player_accounts (profile_id, first_name, last_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name',  '')
    )
    ON CONFLICT (profile_id) DO NOTHING;
  ELSIF v_account_type = 'club' THEN
    INSERT INTO public.club_accounts (profile_id, club_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'club_name', '')
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
