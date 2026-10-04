CREATE TABLE public.shared_media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_media_folders TO authenticated;
GRANT ALL ON public.shared_media_folders TO service_role;
ALTER TABLE public.shared_media_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read folders" ON public.shared_media_folders FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add folders" ON public.shared_media_folders FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND created_by = auth.uid());
CREATE POLICY "members rename folders" ON public.shared_media_folders FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member());
CREATE POLICY "members delete folders" ON public.shared_media_folders FOR DELETE TO authenticated USING (public.is_shared_space_member());

ALTER TABLE public.shared_media ADD COLUMN folder_id uuid REFERENCES public.shared_media_folders(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "uploader edit media" ON public.shared_media;
CREATE POLICY "members organise media" ON public.shared_media FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member());