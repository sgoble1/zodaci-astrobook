CREATE TABLE public.marketing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  subheadline text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'Create my free chart',
  cta_link text NOT NULL DEFAULT '/auth',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketing_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_pages TO authenticated;
GRANT ALL ON public.marketing_pages TO service_role;
ALTER TABLE public.marketing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published pages are public" ON public.marketing_pages FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert pages" ON public.marketing_pages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pages" ON public.marketing_pages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete pages" ON public.marketing_pages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));