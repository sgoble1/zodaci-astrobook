-- Podcasts: Zac's episodes can be marked as his in the Zac & Shane space.
ALTER TABLE public.library_items DROP CONSTRAINT IF EXISTS library_items_belongs_to_check;
ALTER TABLE public.library_items ADD CONSTRAINT library_items_belongs_to_check CHECK (belongs_to = ANY (ARRAY[''::text, 'april'::text, 'shane'::text, 'zac'::text, 'both'::text]));

-- Observation Log: owner-only sky observations.
CREATE TABLE public.observation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  observed_at timestamptz NOT NULL,
  location text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT observation_log_location_len CHECK (char_length(location) <= 160),
  CONSTRAINT observation_log_notes_len CHECK (char_length(notes) <= 4000),
  CONSTRAINT observation_log_tags_count CHECK (cardinality(tags) <= 12)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.observation_log TO authenticated;
GRANT ALL ON public.observation_log TO service_role;
ALTER TABLE public.observation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their observations" ON public.observation_log FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners add their observations" ON public.observation_log FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners edit their observations" ON public.observation_log FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete their observations" ON public.observation_log FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX observation_log_owner_time ON public.observation_log (owner_id, observed_at DESC);

-- Reading progress: one row per reader and page, owner-only.
CREATE TABLE public.reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  path text NOT NULL,
  title text NOT NULL,
  section_id text,
  section_title text,
  progress integer NOT NULL DEFAULT 0,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reading_progress_owner_path UNIQUE (owner_id, path),
  CONSTRAINT reading_progress_range CHECK (progress BETWEEN 0 AND 100),
  CONSTRAINT reading_progress_path_len CHECK (char_length(path) BETWEEN 1 AND 300),
  CONSTRAINT reading_progress_title_len CHECK (char_length(title) BETWEEN 1 AND 300)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_progress TO service_role;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Readers read their progress" ON public.reading_progress FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Readers add their progress" ON public.reading_progress FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Readers update their progress" ON public.reading_progress FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Readers clear their progress" ON public.reading_progress FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX reading_progress_owner_recent ON public.reading_progress (owner_id, last_read_at DESC);