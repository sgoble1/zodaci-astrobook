-- Public version foundation: personal birth profiles, generated readings, invite-based shared spaces, subscriptions.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  birth_date date,
  birth_time text,
  place_label text NOT NULL DEFAULT '',
  lat double precision,
  lon double precision,
  tz text NOT NULL DEFAULT 'UTC',
  house_system text NOT NULL DEFAULT 'placidus',
  chart jsonb,
  onboarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());

CREATE TABLE IF NOT EXISTS public.generated_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  page_key text NOT NULL,
  section text NOT NULL DEFAULT 'Chart',
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_path text,
  status text NOT NULL DEFAULT 'queued',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, page_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_pages TO authenticated;
GRANT ALL ON public.generated_pages TO service_role;
ALTER TABLE public.generated_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pages all" ON public.generated_pages FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.space_members (
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (space_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.space_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_space_member(_space_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT EXISTS (SELECT 1 FROM public.space_members WHERE space_id = _space_id AND user_id = auth.uid()) $$;

CREATE OR REPLACE FUNCTION public.is_space_owner(_space_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT EXISTS (SELECT 1 FROM public.spaces WHERE id = _space_id AND owner_id = auth.uid()) $$;

-- Creates a space and makes the caller its owner-member in one step.
CREATE OR REPLACE FUNCTION public.create_space(_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  INSERT INTO public.spaces (name, owner_id) VALUES (coalesce(nullif(trim(_name), ''), 'Shared space'), auth.uid()) RETURNING id INTO sid;
  INSERT INTO public.space_members (space_id, user_id, role) VALUES (sid, auth.uid(), 'owner');
  RETURN sid;
END $$;

-- Accepts an invite only when the signed-in verified email matches it.
CREATE OR REPLACE FUNCTION public.accept_space_invite(_token uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv record;
BEGIN
  SELECT * INTO inv FROM public.space_invites WHERE token = _token AND accepted_at IS NULL;
  IF inv.id IS NULL OR lower(inv.email) <> lower(coalesce(auth.jwt() ->> 'email', '')) THEN RAISE EXCEPTION 'Invite not valid for this account'; END IF;
  INSERT INTO public.space_members (space_id, user_id) VALUES (inv.space_id, auth.uid()) ON CONFLICT DO NOTHING;
  UPDATE public.space_invites SET accepted_at = now() WHERE id = inv.id;
  RETURN inv.space_id;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.spaces, public.space_members, public.space_invites TO authenticated;
GRANT ALL ON public.spaces, public.space_members, public.space_invites TO service_role;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read space" ON public.spaces FOR SELECT TO authenticated USING (public.is_space_member(id));
CREATE POLICY "owner updates space" ON public.spaces FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "owner deletes space" ON public.spaces FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "members read members" ON public.space_members FOR SELECT TO authenticated USING (public.is_space_member(space_id));
CREATE POLICY "owner or self removes member" ON public.space_members FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_space_owner(space_id));
CREATE POLICY "members read invites" ON public.space_invites FOR SELECT TO authenticated USING (public.is_space_member(space_id));
CREATE POLICY "members invite" ON public.space_invites FOR INSERT TO authenticated WITH CHECK (invited_by = auth.uid() AND public.is_space_member(space_id));
CREATE POLICY "owner cancels invite" ON public.space_invites FOR DELETE TO authenticated USING (public.is_space_owner(space_id) OR invited_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id uuid PRIMARY KEY,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription read" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage read" ON public.ai_usage FOR SELECT TO authenticated USING (user_id = auth.uid());
