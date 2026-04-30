-- ============================================================
-- Tables : matches, posts, reactions
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- Matchs
CREATE TABLE matches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id  uuid REFERENCES accounts,
  player2_id  uuid REFERENCES accounts,
  sport       text NOT NULL,              -- 'tennis' | 'padel'
  score       jsonb NOT NULL,             -- { sets: [{ p1: 6, p2: 4 }, ...] }
  surface     text,                       -- 'clay' | 'hard' | 'grass' | 'indoor'
  court_id    uuid,
  validated   boolean DEFAULT false,
  played_at   timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_read_all"  ON matches FOR SELECT USING (true);
CREATE POLICY "matches_write_own" ON matches FOR ALL
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Posts du feed global
CREATE TABLE posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  uuid REFERENCES accounts,
  match_id   uuid REFERENCES matches,    -- null si non lié à un match
  type       text NOT NULL,              -- 'score' | 'text' | 'search_partner' | 'club_announcement'
  content    text,
  sport      text NOT NULL,              -- 'tennis' | 'padel' — obligatoire pour le filtre feed
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read_all"  ON posts FOR SELECT USING (true);
CREATE POLICY "posts_write_own" ON posts FOR ALL
  USING (auth.uid() = author_id);

-- Réactions
CREATE TABLE reactions (
  post_id  uuid REFERENCES posts,
  user_id  uuid REFERENCES accounts,
  type     text DEFAULT 'bravo',
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_read_all"  ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_write_own" ON reactions FOR ALL
  USING (auth.uid() = user_id);
