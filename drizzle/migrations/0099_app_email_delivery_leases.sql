CREATE TABLE public.app_email_deliveries (delivery_key text PRIMARY KEY CHECK (length(delivery_key) BETWEEN 1 AND 240), template text NOT NULL, status text NOT NULL CHECK (status IN ('processing','sent','failed')), lease_token uuid, lease_at timestamptz, completed_at timestamptz, last_code text);
REVOKE ALL ON public.app_email_deliveries FROM anon, authenticated;
GRANT ALL ON public.app_email_deliveries TO service_role;
ALTER TABLE public.app_email_deliveries ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.claim_app_email(_key text, _template text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE token uuid := gen_random_uuid(); claimed uuid;
BEGIN
 IF _key IS NULL OR length(_key) NOT BETWEEN 1 AND 240 OR _template IS NULL OR length(_template) NOT BETWEEN 1 AND 80 THEN RAISE EXCEPTION 'Invalid delivery'; END IF;
 INSERT INTO public.app_email_deliveries(delivery_key,template,status,lease_token,lease_at) VALUES(_key,_template,'processing',token,now())
 ON CONFLICT(delivery_key) DO UPDATE SET status='processing', lease_token=EXCLUDED.lease_token, lease_at=now(), last_code=NULL
 WHERE app_email_deliveries.template=EXCLUDED.template AND (app_email_deliveries.status='failed' OR (app_email_deliveries.status='processing' AND app_email_deliveries.lease_at < now()-interval '5 minutes'))
 RETURNING lease_token INTO claimed;
 RETURN claimed;
END; $$;
REVOKE ALL ON FUNCTION public.claim_app_email(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_app_email(text,text) TO service_role;