CREATE TABLE public.brand_email_subscribers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE,
 consent_at timestamptz NOT NULL DEFAULT now(),
 consent_version text NOT NULL DEFAULT 'zodaci-updates-v1',
 source text NOT NULL DEFAULT 'zodaci-landing',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.brand_email_subscribers TO authenticated;
GRANT ALL ON public.brand_email_subscribers TO service_role;
ALTER TABLE public.brand_email_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read email list" ON public.brand_email_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins remove email subscribers" ON public.brand_email_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
COMMENT ON TABLE public.brand_email_subscribers IS 'Explicitly consented launch-update email list. Public signup uses validated edge function; no public reads or direct inserts.';