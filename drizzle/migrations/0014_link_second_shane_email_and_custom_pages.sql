CREATE OR REPLACE FUNCTION public.is_shared_space_member()
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN ('shanealecompte@gmail.com', 'shanegoble@gmail.com', 'babybluepuppet@gmail.com') $$;

CREATE OR REPLACE FUNCTION public.is_shared_space_user_id(_user_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id AND lower(coalesce(email, '')) IN ('shanealecompte@gmail.com', 'shanegoble@gmail.com', 'babybluepuppet@gmail.com')) $$;

CREATE OR REPLACE FUNCTION public.shared_member_directory()
 RETURNS TABLE(user_id uuid, display_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT id, CASE WHEN lower(email) = 'babybluepuppet@gmail.com' THEN 'April' ELSE 'Shane' END
  FROM auth.users
  WHERE public.is_shared_space_member()
    AND lower(email) IN ('shanealecompte@gmail.com', 'shanegoble@gmail.com', 'babybluepuppet@gmail.com')
$$;

CREATE OR REPLACE FUNCTION public.claim_admin()
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE u record;
BEGIN
  SELECT id, email, email_confirmed_at INTO u FROM auth.users WHERE id = auth.uid();
  IF u.id IS NULL OR u.email_confirmed_at IS NULL OR lower(u.email) NOT IN ('shanealecompte@gmail.com', 'shanegoble@gmail.com') THEN
    RETURN public.has_role(auth.uid(), 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (u.id, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END $$;

CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  brief text NOT NULL DEFAULT '',
  menu_group text NOT NULL DEFAULT 'Begin',
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT ALL ON public.custom_pages TO service_role;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read created pages" ON public.custom_pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "owners create pages" ON public.custom_pages FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owners or admin edit pages" ON public.custom_pages FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owners or admin delete pages" ON public.custom_pages FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));