ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS passages jsonb;

CREATE TABLE public.workbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  kind text NOT NULL DEFAULT 'prompt',
  module text NOT NULL DEFAULT '',
  prompt_key text NOT NULL DEFAULT '',
  question text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workbook_entries TO authenticated;
GRANT ALL ON public.workbook_entries TO service_role;
ALTER TABLE public.workbook_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own workbook select" ON public.workbook_entries FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Own workbook insert" ON public.workbook_entries FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Own workbook update" ON public.workbook_entries FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Own workbook delete" ON public.workbook_entries FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX workbook_entries_owner_idx ON public.workbook_entries (owner_id, created_at DESC);

CREATE TABLE public.therapy_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL DEFAULT 'New session',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.therapy_sessions TO authenticated;
GRANT ALL ON public.therapy_sessions TO service_role;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sessions select" ON public.therapy_sessions FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Own sessions insert" ON public.therapy_sessions FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Own sessions update" ON public.therapy_sessions FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Own sessions delete" ON public.therapy_sessions FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.therapy_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  ui_id text NOT NULL DEFAULT '',
  role text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.therapy_messages TO authenticated;
GRANT ALL ON public.therapy_messages TO service_role;
ALTER TABLE public.therapy_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own therapy messages select" ON public.therapy_messages FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Own therapy messages insert" ON public.therapy_messages FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.therapy_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));
CREATE POLICY "Own therapy messages delete" ON public.therapy_messages FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX therapy_messages_session_idx ON public.therapy_messages (session_id, created_at);