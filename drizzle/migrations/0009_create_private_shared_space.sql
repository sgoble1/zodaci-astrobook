CREATE OR REPLACE FUNCTION public.is_shared_space_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN ('shanealecompte@gmail.com', 'babybluepuppet@gmail.com')
$$;

REVOKE ALL ON FUNCTION public.is_shared_space_member() FROM public;
GRANT EXECUTE ON FUNCTION public.is_shared_space_member() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_shared_space_member() TO service_role;

CREATE TABLE public.shared_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'topic' CHECK (kind IN ('main', 'topic')),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_conversations TO authenticated;
GRANT ALL ON public.shared_conversations TO service_role;
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read conversations" ON public.shared_conversations FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members create conversations" ON public.shared_conversations FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND created_by = auth.uid());
CREATE POLICY "shared members update conversations" ON public.shared_conversations FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member());
CREATE POLICY "shared members delete topic conversations" ON public.shared_conversations FOR DELETE TO authenticated USING (public.is_shared_space_member() AND kind = 'topic');
CREATE UNIQUE INDEX shared_one_main_conversation ON public.shared_conversations (kind) WHERE kind = 'main';

CREATE TABLE public.shared_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.shared_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  CHECK (length(body) <= 10000)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_messages TO authenticated;
GRANT ALL ON public.shared_messages TO service_role;
ALTER TABLE public.shared_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read messages" ON public.shared_messages FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members send messages" ON public.shared_messages FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND sender_id = auth.uid());
CREATE POLICY "senders update messages" ON public.shared_messages FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND sender_id = auth.uid()) WITH CHECK (public.is_shared_space_member() AND sender_id = auth.uid());
CREATE POLICY "senders delete messages" ON public.shared_messages FOR DELETE TO authenticated USING (public.is_shared_space_member() AND sender_id = auth.uid());

CREATE TABLE public.shared_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL DEFAULT '',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(body) <= 50000)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_posts TO authenticated;
GRANT ALL ON public.shared_posts TO service_role;
ALTER TABLE public.shared_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read posts" ON public.shared_posts FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members create posts" ON public.shared_posts FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors update posts" ON public.shared_posts FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid()) WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors delete posts" ON public.shared_posts FOR DELETE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid());

CREATE TABLE public.shared_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  updated_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_notes TO authenticated;
GRANT ALL ON public.shared_notes TO service_role;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read notes" ON public.shared_notes FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members create notes" ON public.shared_notes FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND created_by = auth.uid() AND updated_by = auth.uid());
CREATE POLICY "shared members update notes" ON public.shared_notes FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member() AND updated_by = auth.uid());
CREATE POLICY "shared members delete notes" ON public.shared_notes FOR DELETE TO authenticated USING (public.is_shared_space_member());

CREATE TABLE public.shared_future_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_future_topics TO authenticated;
GRANT ALL ON public.shared_future_topics TO service_role;
ALTER TABLE public.shared_future_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read future topics" ON public.shared_future_topics FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members create future topics" ON public.shared_future_topics FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND created_by = auth.uid());
CREATE POLICY "shared members update future topics" ON public.shared_future_topics FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member());
CREATE POLICY "shared members delete future topics" ON public.shared_future_topics FOR DELETE TO authenticated USING (public.is_shared_space_member());

CREATE TABLE public.shared_account_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  url text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT '',
  account_owner text NOT NULL DEFAULT 'Shared',
  notes text NOT NULL DEFAULT '',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_account_refs TO authenticated;
GRANT ALL ON public.shared_account_refs TO service_role;
ALTER TABLE public.shared_account_refs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read account refs" ON public.shared_account_refs FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members create account refs" ON public.shared_account_refs FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND created_by = auth.uid());
CREATE POLICY "shared members update account refs" ON public.shared_account_refs FOR UPDATE TO authenticated USING (public.is_shared_space_member()) WITH CHECK (public.is_shared_space_member());
CREATE POLICY "shared members delete account refs" ON public.shared_account_refs FOR DELETE TO authenticated USING (public.is_shared_space_member());

CREATE TABLE public.shared_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.shared_messages(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.shared_posts(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  file_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((message_id IS NOT NULL)::integer + (post_id IS NOT NULL)::integer = 1)
);
GRANT SELECT, INSERT, DELETE ON public.shared_attachments TO authenticated;
GRANT ALL ON public.shared_attachments TO service_role;
ALTER TABLE public.shared_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read attachments" ON public.shared_attachments FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members create attachments" ON public.shared_attachments FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND uploaded_by = auth.uid());
CREATE POLICY "uploaders delete attachments" ON public.shared_attachments FOR DELETE TO authenticated USING (public.is_shared_space_member() AND uploaded_by = auth.uid());

CREATE POLICY "shared members read stored files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'shared-space' AND public.is_shared_space_member());
CREATE POLICY "shared members upload stored files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shared-space' AND public.is_shared_space_member() AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "shared members delete stored files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'shared-space' AND public.is_shared_space_member() AND owner_id = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.ensure_shared_main_conversation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE conversation_id uuid;
BEGIN
  IF NOT public.is_shared_space_member() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  SELECT id INTO conversation_id FROM public.shared_conversations WHERE kind = 'main' LIMIT 1;
  IF conversation_id IS NULL THEN
    INSERT INTO public.shared_conversations (title, kind, created_by)
    VALUES ('April & Shane', 'main', auth.uid())
    ON CONFLICT DO NOTHING
    RETURNING id INTO conversation_id;
    IF conversation_id IS NULL THEN
      SELECT id INTO conversation_id FROM public.shared_conversations WHERE kind = 'main' LIMIT 1;
    END IF;
  END IF;
  RETURN conversation_id;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_shared_main_conversation() FROM public;
GRANT EXECUTE ON FUNCTION public.ensure_shared_main_conversation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_shared_main_conversation() TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_future_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_account_refs;