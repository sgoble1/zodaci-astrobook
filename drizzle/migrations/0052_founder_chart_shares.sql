CREATE TABLE public.chart_shares (
  owner_id uuid NOT NULL,
  viewer_email text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, viewer_email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chart_shares TO authenticated;
GRANT ALL ON public.chart_shares TO service_role;
ALTER TABLE public.chart_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their chart shares" ON public.chart_shares FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND public.is_shared_space_member());
CREATE POLICY "Viewers see shares to them" ON public.chart_shares FOR SELECT TO authenticated
  USING (lower(viewer_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

CREATE OR REPLACE FUNCTION public.can_read_shane_edition()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email','')) IN ('shanegoble@gmail.com','shanealecompte@gmail.com')
    OR EXISTS (
      SELECT 1 FROM public.chart_shares s JOIN auth.users u ON u.id = s.owner_id
      WHERE s.enabled AND lower(u.email) IN ('shanegoble@gmail.com','shanealecompte@gmail.com')
        AND lower(s.viewer_email) = lower(coalesce(auth.jwt() ->> 'email',''))
        AND public.is_shared_space_member())
$$;

CREATE OR REPLACE FUNCTION public.has_paid_plan(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_active_subscription(_user_id,'live') OR public.is_shared_space_user_id(_user_id) OR public.has_role(_user_id,'admin') $$;