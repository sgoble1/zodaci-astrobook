CREATE TABLE public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'source',
  title text NOT NULL,
  description text,
  category text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.library_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO authenticated;
GRANT ALL ON public.library_items TO service_role;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view library" ON public.library_items FOR SELECT USING (true);
CREATE POLICY "Owners insert" ON public.library_items FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update" ON public.library_items FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners delete" ON public.library_items FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Anyone can read library files" ON storage.objects FOR SELECT USING (bucket_id = 'library');
CREATE POLICY "Users upload own library files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'library' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own library files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'library' AND (storage.foldername(name))[1] = auth.uid()::text);