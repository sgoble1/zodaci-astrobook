CREATE TABLE public.book_costing (
  edition text PRIMARY KEY CHECK (edition IN ('standard','expanded')),
  print_cents integer NOT NULL DEFAULT 0,
  delivery_cents integer NOT NULL DEFAULT 0,
  fees_cents integer NOT NULL DEFAULT 0,
  quote_source text NOT NULL DEFAULT 'estimate',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.book_costing TO authenticated;
GRANT ALL ON public.book_costing TO service_role;
ALTER TABLE public.book_costing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read costing" ON public.book_costing FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert costing" ON public.book_costing FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update costing" ON public.book_costing FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.book_costing(edition,print_cents,delivery_cents,fees_cents) VALUES ('standard',2400,900,220),('expanded',3800,1100,310);