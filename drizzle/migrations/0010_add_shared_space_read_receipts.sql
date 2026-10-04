CREATE TABLE public.shared_conversation_reads (
  conversation_id uuid NOT NULL REFERENCES public.shared_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_conversation_reads TO authenticated;
GRANT ALL ON public.shared_conversation_reads TO service_role;
ALTER TABLE public.shared_conversation_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read receipts" ON public.shared_conversation_reads FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members create own receipts" ON public.shared_conversation_reads FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND user_id = auth.uid());
CREATE POLICY "members update own receipts" ON public.shared_conversation_reads FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND user_id = auth.uid()) WITH CHECK (public.is_shared_space_member() AND user_id = auth.uid());
CREATE POLICY "members delete own receipts" ON public.shared_conversation_reads FOR DELETE TO authenticated USING (public.is_shared_space_member() AND user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.shared_member_directory()
RETURNS TABLE(user_id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id,
    CASE lower(email)
      WHEN 'shanealecompte@gmail.com' THEN 'Shane'
      WHEN 'babybluepuppet@gmail.com' THEN 'April'
      ELSE 'Member'
    END
  FROM auth.users
  WHERE public.is_shared_space_member()
    AND lower(email) IN ('shanealecompte@gmail.com', 'babybluepuppet@gmail.com')
$$;
REVOKE ALL ON FUNCTION public.shared_member_directory() FROM public;
GRANT EXECUTE ON FUNCTION public.shared_member_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.shared_member_directory() TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_conversation_reads;