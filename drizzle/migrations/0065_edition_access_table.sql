CREATE TABLE public.edition_access (
  email text NOT NULL,
  edition text NOT NULL CHECK (edition IN ('zac')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (email, edition)
);
GRANT SELECT, INSERT, DELETE ON public.edition_access TO authenticated;
GRANT ALL ON public.edition_access TO service_role;
ALTER TABLE public.edition_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage edition access" ON public.edition_access FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') AND email = lower(email));

-- The edition assigned to the signed-in account (null for everyone else).
CREATE OR REPLACE FUNCTION public.my_founder_edition()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT edition FROM public.edition_access WHERE email = lower(coalesce(auth.jwt() ->> 'email','')) LIMIT 1 $$;

-- Zac's archive: Zac's assigned account, plus the admin (Shane, who gave it).
CREATE OR REPLACE FUNCTION public.can_read_zac_edition()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.my_founder_edition() = 'zac' OR public.has_role(auth.uid(), 'admin') $$;
REVOKE EXECUTE ON FUNCTION public.my_founder_edition() FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_read_zac_edition() FROM anon;

CREATE OR REPLACE FUNCTION public.can_view_investors()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
    OR public.is_shared_space_member()
    OR public.my_founder_edition() = 'zac'
    OR EXISTS (SELECT 1 FROM public.investor_access a WHERE a.email = lower(coalesce(auth.jwt() ->> 'email','')))
$$;
REVOKE EXECUTE ON FUNCTION public.can_view_investors() FROM anon;