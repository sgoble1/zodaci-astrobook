-- Separate shared spaces: 'april' (April & Shane) and 'zac' (Zac & Shane).
CREATE OR REPLACE FUNCTION public.in_shared_space(_space text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND CASE _space
    WHEN 'april' THEN lower(coalesce(auth.jwt() ->> 'email','')) IN ('shanealecompte@gmail.com','shanegoble@gmail.com','babybluepuppet@gmail.com')
    WHEN 'zac' THEN lower(coalesce(auth.jwt() ->> 'email','')) IN ('shanealecompte@gmail.com','shanegoble@gmail.com') OR public.owns_official_edition('zac')
    ELSE false END
$$;

CREATE OR REPLACE FUNCTION public.my_shared_spaces()
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT coalesce(array_agg(s ORDER BY s), '{}') FROM unnest(ARRAY['april','zac']) s WHERE public.in_shared_space(s)
$$;

CREATE TABLE IF NOT EXISTS public.shared_space_prefs (
  user_id uuid PRIMARY KEY,
  active_space text NOT NULL CHECK (active_space IN ('april','zac')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shared_space_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own space pref read" ON public.shared_space_prefs FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON public.shared_space_prefs TO authenticated;

CREATE OR REPLACE FUNCTION public.current_shared_space()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT coalesce(
    (SELECT p.active_space FROM public.shared_space_prefs p WHERE p.user_id = auth.uid() AND public.in_shared_space(p.active_space)),
    CASE WHEN public.in_shared_space('april') THEN 'april' WHEN public.in_shared_space('zac') THEN 'zac' END)
$$;

CREATE OR REPLACE FUNCTION public.set_shared_space(_space text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.in_shared_space(_space) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  INSERT INTO public.shared_space_prefs (user_id, active_space, updated_at) VALUES (auth.uid(), _space, now())
  ON CONFLICT (user_id) DO UPDATE SET active_space = excluded.active_space, updated_at = now();
  RETURN _space;
END $$;

-- Add space_key to every shared table; existing rows belong to April & Shane.
DO $$
DECLARE t text; pol record; q text; c text; roles text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'shared\_%' AND table_name <> 'shared_space_prefs' AND table_type='BASE TABLE' LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS space_key text NOT NULL DEFAULT ''april'' CHECK (space_key IN (''april'',''zac''))', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN space_key SET DEFAULT public.current_shared_space()', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (space_key)', t || '_space_idx', t);
    FOR pol IN SELECT * FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      q := replace(pol.qual, 'is_shared_space_member()', '(space_key = current_shared_space())');
      c := replace(pol.with_check, 'is_shared_space_member()', '(space_key = current_shared_space())');
      roles := array_to_string(pol.roles, ',');
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
      EXECUTE format('CREATE POLICY %I ON public.%I AS %s FOR %s TO %s%s%s', pol.policyname, t, pol.permissive, pol.cmd, roles,
        CASE WHEN q IS NOT NULL THEN ' USING (' || q || ')' ELSE '' END,
        CASE WHEN c IS NOT NULL THEN ' WITH CHECK (' || c || ')' ELSE '' END);
    END LOOP;
  END LOOP;
END $$;

DROP INDEX IF EXISTS public.shared_one_main_conversation;
CREATE UNIQUE INDEX shared_one_main_conversation ON public.shared_conversations (space_key) WHERE kind = 'main';

ALTER TABLE public.shared_wondering_reads DROP CONSTRAINT IF EXISTS shared_wondering_reads_pkey;
ALTER TABLE public.shared_wondering_reads ADD PRIMARY KEY (user_id, space_key);

CREATE OR REPLACE FUNCTION public.ensure_shared_main_conversation()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE conversation_id uuid; sp text := public.current_shared_space();
BEGIN
  IF sp IS NULL THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT id INTO conversation_id FROM public.shared_conversations WHERE kind = 'main' AND space_key = sp LIMIT 1;
  IF conversation_id IS NULL THEN
    INSERT INTO public.shared_conversations (title, kind, created_by, space_key)
    VALUES (CASE sp WHEN 'zac' THEN 'Zac & Shane' ELSE 'April & Shane' END, 'main', auth.uid(), sp)
    ON CONFLICT DO NOTHING RETURNING id INTO conversation_id;
    IF conversation_id IS NULL THEN
      SELECT id INTO conversation_id FROM public.shared_conversations WHERE kind = 'main' AND space_key = sp LIMIT 1;
    END IF;
  END IF;
  RETURN conversation_id;
END $$;

CREATE OR REPLACE FUNCTION public.shared_unread_counts()
RETURNS TABLE(conversation_id uuid, unread_count bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT m.conversation_id, count(*)::bigint
  FROM public.shared_messages m
  LEFT JOIN public.shared_conversation_reads r ON r.conversation_id = m.conversation_id AND r.user_id = auth.uid()
  WHERE m.space_key = public.current_shared_space()
    AND m.sender_id <> auth.uid()
    AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at)
  GROUP BY m.conversation_id
$$;

CREATE OR REPLACE FUNCTION public.shared_member_directory()
RETURNS TABLE(user_id uuid, display_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT u.id, CASE WHEN lower(u.email) = 'babybluepuppet@gmail.com' THEN 'April'
                    WHEN lower(u.email) IN ('shanealecompte@gmail.com','shanegoble@gmail.com') THEN 'Shane'
                    ELSE 'Zac' END
  FROM auth.users u
  WHERE public.current_shared_space() IS NOT NULL AND (
    (public.current_shared_space() = 'april' AND lower(u.email) IN ('shanealecompte@gmail.com','shanegoble@gmail.com','babybluepuppet@gmail.com'))
    OR (public.current_shared_space() = 'zac' AND (lower(u.email) IN ('shanealecompte@gmail.com','shanegoble@gmail.com')
        OR lower(u.email) IN (SELECT a.email FROM public.edition_access a WHERE a.edition = 'zac'))))
$$;

-- Storage: any shared-space member uploads into their own folder; reads follow the scoped rows.
DROP POLICY IF EXISTS "shared members read stored files" ON storage.objects;
DROP POLICY IF EXISTS "shared members upload stored files" ON storage.objects;
DROP POLICY IF EXISTS "shared members delete stored files" ON storage.objects;
CREATE POLICY "shared members read stored files" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'shared-space' AND public.current_shared_space() IS NOT NULL AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.shared_media m WHERE m.file_path = objects.name)
    OR EXISTS (SELECT 1 FROM public.shared_attachments a WHERE a.file_path = objects.name)
    OR EXISTS (SELECT 1 FROM public.shared_documents d WHERE d.file_path = objects.name)));
CREATE POLICY "shared members upload stored files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'shared-space' AND public.current_shared_space() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "shared members delete stored files" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'shared-space' AND public.current_shared_space() IS NOT NULL AND owner_id = auth.uid()::text);