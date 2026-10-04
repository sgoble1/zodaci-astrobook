CREATE TABLE public.shared_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid(),
  category text NOT NULL DEFAULT 'Movie',
  title text NOT NULL,
  link text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_recommendations TO authenticated;
GRANT ALL ON public.shared_recommendations TO service_role;
ALTER TABLE public.shared_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read recs" ON public.shared_recommendations FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add recs" ON public.shared_recommendations FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors edit recs" ON public.shared_recommendations FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors delete recs" ON public.shared_recommendations FOR DELETE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid());

CREATE TABLE public.shared_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  caption text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_media TO authenticated;
GRANT ALL ON public.shared_media TO service_role;
ALTER TABLE public.shared_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read media" ON public.shared_media FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add media" ON public.shared_media FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND uploaded_by = auth.uid());
CREATE POLICY "uploader edit media" ON public.shared_media FOR UPDATE TO authenticated USING (public.is_shared_space_member() AND uploaded_by = auth.uid());
CREATE POLICY "uploader delete media" ON public.shared_media FOR DELETE TO authenticated USING (public.is_shared_space_member() AND uploaded_by = auth.uid());

CREATE TABLE public.shared_item_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.shared_item_comments TO authenticated;
GRANT ALL ON public.shared_item_comments TO service_role;
ALTER TABLE public.shared_item_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read item comments" ON public.shared_item_comments FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add item comments" ON public.shared_item_comments FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND author_id = auth.uid());
CREATE POLICY "authors delete item comments" ON public.shared_item_comments FOR DELETE TO authenticated USING (public.is_shared_space_member() AND author_id = auth.uid());

CREATE TABLE public.shared_item_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_type, item_id, user_id, emoji)
);
GRANT SELECT, INSERT, DELETE ON public.shared_item_reactions TO authenticated;
GRANT ALL ON public.shared_item_reactions TO service_role;
ALTER TABLE public.shared_item_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read item reactions" ON public.shared_item_reactions FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "members add item reactions" ON public.shared_item_reactions FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND user_id = auth.uid());
CREATE POLICY "members remove own reactions" ON public.shared_item_reactions FOR DELETE TO authenticated USING (public.is_shared_space_member() AND user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_item_comments, public.shared_item_reactions, public.shared_media, public.shared_recommendations;