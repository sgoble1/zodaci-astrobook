CREATE TABLE public.dream_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  dream_date date NOT NULL DEFAULT current_date,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 8000),
  feelings text[] NOT NULL DEFAULT '{}',
  recurring boolean NOT NULL DEFAULT false,
  use_in_readings boolean NOT NULL DEFAULT false,
  use_in_book boolean NOT NULL DEFAULT false,
  use_in_comic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dream_entries TO authenticated;
GRANT ALL ON public.dream_entries TO service_role;
ALTER TABLE public.dream_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their dreams" ON public.dream_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners add their dreams" ON public.dream_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners edit their dreams" ON public.dream_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their dreams" ON public.dream_entries FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX dream_entries_user_date ON public.dream_entries (user_id, dream_date DESC);

CREATE TABLE public.context_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  topic text NOT NULL CHECK (char_length(topic) BETWEEN 1 AND 60),
  answer text CHECK (answer IS NULL OR char_length(answer) <= 200),
  status text NOT NULL DEFAULT 'answered' CHECK (status IN ('answered', 'later', 'skipped')),
  general boolean NOT NULL DEFAULT false,
  use_in_readings boolean NOT NULL DEFAULT true,
  use_in_book boolean NOT NULL DEFAULT false,
  use_in_comic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.context_flags TO authenticated;
GRANT ALL ON public.context_flags TO service_role;
ALTER TABLE public.context_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their context answers" ON public.context_flags FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners add context answers" ON public.context_flags FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners edit context answers" ON public.context_flags FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete context answers" ON public.context_flags FOR DELETE TO authenticated USING (user_id = auth.uid());