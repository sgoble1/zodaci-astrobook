ALTER TABLE public.library_items
ADD COLUMN IF NOT EXISTS cover_path text,
ADD COLUMN IF NOT EXISTS shared_with_space boolean NOT NULL DEFAULT false;

REVOKE SELECT ON public.library_items FROM anon;

DROP POLICY IF EXISTS "Signed-in users view library" ON public.library_items;
CREATE POLICY "Owners admins and shared members view library"
ON public.library_items
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR (shared_with_space = true AND public.is_shared_space_member())
);

DROP POLICY IF EXISTS "Signed-in users read library files" ON storage.objects;
CREATE POLICY "Owners admins and shared members read library files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'library'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
    OR (
      public.is_shared_space_member()
      AND EXISTS (
        SELECT 1
        FROM public.library_items li
        WHERE li.shared_with_space = true
          AND (li.file_path = name OR li.cover_path = name)
      )
    )
  )
);

DROP POLICY IF EXISTS "Owners insert" ON public.library_items;
CREATE POLICY "Shared members insert owned library items"
ON public.library_items
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid() AND public.is_shared_space_member());

DROP POLICY IF EXISTS "Owners update" ON public.library_items;
CREATE POLICY "Owners update library items"
ON public.library_items
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() AND public.is_shared_space_member())
WITH CHECK (owner_id = auth.uid() AND public.is_shared_space_member());

DROP POLICY IF EXISTS "Owners delete" ON public.library_items;
CREATE POLICY "Owners delete library items"
ON public.library_items
FOR DELETE
TO authenticated
USING (owner_id = auth.uid() AND public.is_shared_space_member());

DROP POLICY IF EXISTS "Users upload own library files" ON storage.objects;
CREATE POLICY "Shared members upload own library files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'library'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.is_shared_space_member()
);

DROP POLICY IF EXISTS "Users delete own library files" ON storage.objects;
CREATE POLICY "Shared members delete own library files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'library'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.is_shared_space_member()
);

COMMENT ON COLUMN public.library_items.cover_path IS 'Private storage path for podcast or media cover artwork.';
COMMENT ON COLUMN public.library_items.shared_with_space IS 'When true, the item is readable by approved shared-space members.';