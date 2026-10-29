CREATE POLICY "Paid members save own creations" ON public.library_items FOR INSERT TO authenticated
  WITH CHECK (kind = 'creation' AND owner_id = auth.uid() AND workspace_id IS NULL AND shared_with_space = false AND public.has_paid_plan(auth.uid()));
CREATE POLICY "Paid members upload own creation files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'library' AND (storage.foldername(name))[1] = auth.uid()::text AND (storage.foldername(name))[2] = 'creation' AND public.has_paid_plan(auth.uid()));
CREATE POLICY "Members delete own creation files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'library' AND (storage.foldername(name))[1] = auth.uid()::text AND (storage.foldername(name))[2] = 'creation');