CREATE OR REPLACE FUNCTION public.can_read_zac_edition()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT lower(coalesce(auth.jwt() ->> 'email','')) = 'shane@notardex.com' $$;

CREATE TABLE public.investor_access (
  email text PRIMARY KEY,
  note text NOT NULL DEFAULT '',
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.investor_access TO authenticated;
GRANT ALL ON public.investor_access TO service_role;
ALTER TABLE public.investor_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage investor access" ON public.investor_access FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.can_view_investors()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email','')) IN ('shane@notardex.com','shanegoble@gmail.com','shanealecompte@gmail.com','babybluepuppet@gmail.com')
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.investor_access a WHERE a.email = lower(coalesce(auth.jwt() ->> 'email','')))
$$;
REVOKE EXECUTE ON FUNCTION public.can_view_investors() FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_read_zac_edition() FROM anon;