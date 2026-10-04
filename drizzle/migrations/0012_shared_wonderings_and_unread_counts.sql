CREATE OR REPLACE FUNCTION public.is_shared_space_user_id(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND lower(coalesce(email, '')) IN ('shanealecompte@gmail.com', 'babybluepuppet@gmail.com')
  )
$$;
REVOKE ALL ON FUNCTION public.is_shared_space_user_id(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_shared_space_user_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_shared_space_user_id(uuid) TO service_role;

CREATE TABLE public.shared_wonderings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid(),
  target_user_id uuid NOT NULL,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 10000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'discussed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (author_id <> target_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_wonderings TO authenticated;
GRANT ALL ON public.shared_wonderings TO service_role;
ALTER TABLE public.shared_wonderings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read wonderings" ON public.shared_wonderings FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members create own wonderings" ON public.shared_wonderings FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid() AND public.is_shared_space_user_id(target_user_id));
CREATE POLICY "members update wonderings" ON public.shared_wonderings FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member() AND public.is_shared_space_user_id(target_user_id));
CREATE POLICY "authors delete wonderings" ON public.shared_wonderings FOR DELETE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid());
CREATE INDEX shared_wonderings_updated_idx ON public.shared_wonderings(updated_at DESC);
CREATE INDEX shared_wonderings_target_idx ON public.shared_wonderings(target_user_id, updated_at DESC);

CREATE TABLE public.shared_wondering_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wondering_id uuid NOT NULL REFERENCES public.shared_wonderings(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 10000),
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_wondering_comments TO authenticated;
GRANT ALL ON public.shared_wondering_comments TO service_role;
ALTER TABLE public.shared_wondering_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read wondering comments" ON public.shared_wondering_comments FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members create own wondering comments" ON public.shared_wondering_comments FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors update wondering comments" ON public.shared_wondering_comments FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid()) WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors delete wondering comments" ON public.shared_wondering_comments FOR DELETE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid());
CREATE INDEX shared_wondering_comments_parent_idx ON public.shared_wondering_comments(wondering_id, created_at);

CREATE TABLE public.shared_wondering_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wondering_id uuid NOT NULL REFERENCES public.shared_wonderings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  emoji text NOT NULL CHECK (emoji IN ('❤️', '👍', '✨', '😂')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wondering_id, user_id, emoji)
);
GRANT SELECT, INSERT, DELETE ON public.shared_wondering_reactions TO authenticated;
GRANT ALL ON public.shared_wondering_reactions TO service_role;
ALTER TABLE public.shared_wondering_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read wondering reactions" ON public.shared_wondering_reactions FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add own wondering reactions" ON public.shared_wondering_reactions FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND user_id = auth.uid());
CREATE POLICY "members remove own wondering reactions" ON public.shared_wondering_reactions FOR DELETE TO authenticated USING (public.is_shared_space_member() AND user_id = auth.uid());
CREATE INDEX shared_wondering_reactions_parent_idx ON public.shared_wondering_reactions(wondering_id);

CREATE TABLE public.shared_wondering_reads (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  last_read_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.shared_wondering_reads TO authenticated;
GRANT ALL ON public.shared_wondering_reads TO service_role;
ALTER TABLE public.shared_wondering_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read own wondering receipt" ON public.shared_wondering_reads FOR SELECT TO authenticated USING (public.is_shared_space_member() AND user_id = auth.uid());
CREATE POLICY "members create own wondering receipt" ON public.shared_wondering_reads FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND user_id = auth.uid());
CREATE POLICY "members update own wondering receipt" ON public.shared_wondering_reads FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND user_id = auth.uid()) WITH CHECK (public.is_shared_space_member() AND user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.shared_unread_counts()
RETURNS TABLE(conversation_id uuid, unread_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.conversation_id, count(*)::bigint
  FROM public.shared_messages m
  LEFT JOIN public.shared_conversation_reads r
    ON r.conversation_id = m.conversation_id AND r.user_id = auth.uid()
  WHERE public.is_shared_space_member()
    AND m.sender_id <> auth.uid()
    AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at)
  GROUP BY m.conversation_id
$$;
REVOKE ALL ON FUNCTION public.shared_unread_counts() FROM public;
GRANT EXECUTE ON FUNCTION public.shared_unread_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.shared_unread_counts() TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_wonderings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_wondering_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_wondering_reactions;