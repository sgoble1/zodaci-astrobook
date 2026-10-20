-- AstroComic production: one artwork image per script panel, plus the issue's built print file.
CREATE TABLE public.comic_issue_art (
  issue_id uuid NOT NULL REFERENCES public.comic_issues(id) ON DELETE CASCADE,
  page_n integer NOT NULL CHECK (page_n BETWEEN 1 AND 40),
  panel_i integer NOT NULL CHECK (panel_i BETWEEN 0 AND 8),
  path text NOT NULL CHECK (char_length(path) BETWEEN 1 AND 300),
  width integer NOT NULL CHECK (width BETWEEN 1 AND 8000),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 8000),
  scene text NOT NULL DEFAULT '' CHECK (char_length(scene) <= 2000),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (issue_id, page_n, panel_i)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comic_issue_art TO authenticated;
GRANT ALL ON public.comic_issue_art TO service_role;
ALTER TABLE public.comic_issue_art ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage comic art" ON public.comic_issue_art FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "subscribers read art of released issues" ON public.comic_issue_art FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.comic_issues i WHERE i.id = comic_issue_art.issue_id AND i.user_id = auth.uid() AND i.status IN ('approved', 'printing', 'shipped')));

ALTER TABLE public.comic_issues ADD COLUMN IF NOT EXISTS print_pdf_path text;
ALTER TABLE public.comic_issues ADD COLUMN IF NOT EXISTS print_pdf_at timestamptz;
ALTER TABLE public.comic_issues ADD COLUMN IF NOT EXISTS print_report jsonb;
COMMENT ON COLUMN public.comic_issues.print_pdf_path IS 'Private comic-art storage path of the finished print PDF (all panels illustrated, preflight passed).';

-- Comic artwork and print files are private: admins work with them directly; subscribers only receive short-lived links from the comic-art function.
CREATE POLICY "admins read comic art files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'comic-art' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins add comic art files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'comic-art' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins replace comic art files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'comic-art' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'comic-art' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins remove comic art files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'comic-art' AND public.has_role(auth.uid(), 'admin'));