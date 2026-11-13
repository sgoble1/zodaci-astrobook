-- Abuse limits for the open contact form and newsletter signup, plus delivery status on saved rows.
CREATE TABLE public.public_form_hits (
  id bigserial PRIMARY KEY,
  bucket text NOT NULL,
  key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.public_form_hits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.public_form_hits_id_seq TO service_role;
ALTER TABLE public.public_form_hits ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (edge functions) reads or writes this table.
CREATE INDEX public_form_hits_lookup ON public.public_form_hits (bucket, key_hash, created_at DESC);
COMMENT ON TABLE public.public_form_hits IS 'Hashed address/IP hits for public form rate limits. Service role only; rows older than a day are pruned by form_rate_ok.';

CREATE OR REPLACE FUNCTION public.form_rate_ok(_bucket text, _key text, _limit integer, _window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF _key IS NULL OR length(_key) = 0 THEN RETURN true; END IF;
  SELECT count(*) INTO n FROM public.public_form_hits
   WHERE bucket = _bucket AND key_hash = _key AND created_at > now() - make_interval(secs => _window_seconds);
  IF n >= _limit THEN RETURN false; END IF;
  INSERT INTO public.public_form_hits (bucket, key_hash) VALUES (_bucket, _key);
  IF random() < 0.02 THEN DELETE FROM public.public_form_hits WHERE created_at < now() - interval '1 day'; END IF;
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.form_rate_ok(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.form_rate_ok(text, text, integer, integer) TO service_role;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS notify_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS notify_error text;
COMMENT ON COLUMN public.contact_messages.notify_status IS 'Owner notice / sender acknowledgement: pending, sent, partial, not_configured, no_admin_address, failed.';

ALTER TABLE public.brand_email_subscribers
  ADD COLUMN IF NOT EXISTS confirm_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS form_path text;
CREATE UNIQUE INDEX IF NOT EXISTS brand_email_subscribers_confirm_token ON public.brand_email_subscribers (confirm_token);
COMMENT ON COLUMN public.brand_email_subscribers.confirmed_at IS 'Set when the address owner opens the confirmation link (double opt-in). Campaigns go only to confirmed addresses.';