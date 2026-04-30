ALTER TABLE reactions
  DROP CONSTRAINT reactions_post_id_fkey,
  ADD CONSTRAINT reactions_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
