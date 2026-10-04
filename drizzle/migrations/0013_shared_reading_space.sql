CREATE TABLE public.shared_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  description text NOT NULL DEFAULT '',
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_documents TO authenticated;
GRANT ALL ON public.shared_documents TO service_role;
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read shared documents" ON public.shared_documents FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add shared documents" ON public.shared_documents FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND uploaded_by = auth.uid());
CREATE POLICY "members edit shared documents" ON public.shared_documents FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member());
CREATE POLICY "uploader deletes shared documents" ON public.shared_documents FOR DELETE TO authenticated USING (public.is_shared_space_member() AND uploaded_by = auth.uid());

CREATE TABLE public.shared_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.shared_documents(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  page integer,
  quote text NOT NULL DEFAULT '',
  note text NOT NULL CHECK (char_length(note) BETWEEN 1 AND 10000),
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);
CREATE INDEX shared_annotations_document_idx ON public.shared_annotations(document_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_annotations TO authenticated;
GRANT ALL ON public.shared_annotations TO service_role;
ALTER TABLE public.shared_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read annotations" ON public.shared_annotations FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add annotations" ON public.shared_annotations FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors edit annotations" ON public.shared_annotations FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "authors delete annotations" ON public.shared_annotations FOR DELETE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_documents, public.shared_annotations;