CREATE TABLE public.relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  relation text NOT NULL DEFAULT 'Partner',
  sex text NOT NULL DEFAULT 'unspecified',
  birth_date date NOT NULL,
  birth_time text,
  place_label text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lon double precision NOT NULL,
  tz text NOT NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationships TO authenticated;
GRANT ALL ON public.relationships TO service_role;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.relationships FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own insert" ON public.relationships FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own update" ON public.relationships FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own delete" ON public.relationships FOR DELETE TO authenticated USING (owner_id = auth.uid());