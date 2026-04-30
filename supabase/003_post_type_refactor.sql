-- Migre les types "score" et "text" vers "post"
UPDATE posts SET type = 'post' WHERE type IN ('score', 'text');
