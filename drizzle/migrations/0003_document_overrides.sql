CREATE TABLE public.document_overrides (
  doc_key text PRIMARY KEY,
  title text,
  note text,
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.document_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.document_overrides TO authenticated;
GRANT ALL ON public.document_overrides TO service_role;
ALTER TABLE public.document_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads overrides" ON public.document_overrides FOR SELECT USING (true);
CREATE POLICY "Admins insert overrides" ON public.document_overrides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update overrides" ON public.document_overrides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete overrides" ON public.document_overrides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage library files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'library' AND public.has_role(auth.uid(), 'admin'));