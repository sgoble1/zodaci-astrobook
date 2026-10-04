CREATE TABLE public.social_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_sessions TO authenticated;
GRANT ALL ON public.social_sessions TO service_role;
ALTER TABLE public.social_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own social sessions select" ON public.social_sessions FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Own social sessions insert" ON public.social_sessions FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Own social sessions update" ON public.social_sessions FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Own social sessions delete" ON public.social_sessions FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.social_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.social_sessions(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  ui_id text NOT NULL DEFAULT '',
  role text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_messages TO authenticated;
GRANT ALL ON public.social_messages TO service_role;
ALTER TABLE public.social_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own social messages select" ON public.social_messages FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Own social messages insert" ON public.social_messages FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.social_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));
CREATE POLICY "Own social messages delete" ON public.social_messages FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX social_messages_session_idx ON public.social_messages (session_id, created_at);

DROP POLICY IF EXISTS "signed-in read created pages" ON public.custom_pages;
CREATE POLICY "Approved accounts read created pages" ON public.custom_pages FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_shared_space_member());