CREATE TABLE public.member_characters (
  user_id uuid PRIMARY KEY,
  character_id text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_characters TO authenticated;
GRANT ALL ON public.member_characters TO service_role;
ALTER TABLE public.member_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own character read" ON public.member_characters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own character insert" ON public.member_characters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own character update" ON public.member_characters FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own character delete" ON public.member_characters FOR DELETE TO authenticated USING (auth.uid() = user_id);