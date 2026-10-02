CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  path text NOT NULL,
  title text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, path)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookmarks select" ON public.bookmarks FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own bookmarks insert" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own bookmarks update" ON public.bookmarks FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own bookmarks delete" ON public.bookmarks FOR DELETE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view library" ON public.library_items;
CREATE POLICY "Signed-in users view library" ON public.library_items FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Anyone can read library files" ON storage.objects;
CREATE POLICY "Signed-in users read library files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'library' AND auth.uid() IS NOT NULL);