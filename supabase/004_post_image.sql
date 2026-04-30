-- Ajoute la colonne image_url sur les posts
ALTER TABLE posts ADD COLUMN image_url text;

-- Bucket public pour les photos de posts
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- RLS storage
CREATE POLICY "post_images_read_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "post_images_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
