CREATE TABLE public.book_gift_claims (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL UNIQUE REFERENCES public.book_orders(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, revoked_at timestamptz,
 recipient_id uuid, claimed_at timestamptz, recipient_birth jsonb, shipping_address jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id,order_id,expires_at,revoked_at,recipient_id,claimed_at,recipient_birth,shipping_address,created_at) ON public.book_gift_claims TO authenticated;
GRANT ALL ON public.book_gift_claims TO service_role;
ALTER TABLE public.book_gift_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY gift_claim_recipient_read ON public.book_gift_claims FOR SELECT TO authenticated USING (recipient_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.claim_book_gift(_token_hash text,_birth jsonb,_shipping jsonb)
RETURNS TABLE(order_id uuid,edition text,format text,recipient_birth jsonb,shipping_address jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.book_gift_claims; o public.book_orders; verified_email text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to claim this gift'; END IF;
 SELECT lower(email) INTO verified_email FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL;
 IF verified_email IS NULL THEN RAISE EXCEPTION 'Verify your email before claiming'; END IF;
 SELECT * INTO c FROM public.book_gift_claims WHERE token_hash=_token_hash FOR UPDATE;
 IF NOT FOUND OR c.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'Gift link unavailable'; END IF;
 SELECT * INTO o FROM public.book_orders WHERE id=c.order_id FOR UPDATE;
 IF lower(o.recipient_email)<>verified_email OR NOT o.gift OR o.status NOT IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered') OR o.payment_total_cents IS NULL OR o.payment_hold IS NOT NULL OR o.environment<>'production' THEN RAISE EXCEPTION 'Gift not available to this account'; END IF;
 IF c.claimed_at IS NOT NULL THEN
   IF c.recipient_id<>auth.uid() THEN RAISE EXCEPTION 'Gift already claimed'; END IF;
   RETURN QUERY SELECT o.id,o.edition,o.format,c.recipient_birth,c.shipping_address; RETURN;
 END IF;
 IF c.expires_at<=now() THEN RAISE EXCEPTION 'Gift link expired'; END IF;
 IF jsonb_typeof(_birth)<>'object' OR coalesce(_birth->>'name','')='' OR length(_birth->>'name')>80 OR coalesce(_birth->>'date','')!~ '^\d{4}-\d{2}-\d{2}$' OR (_birth->>'date')::date>current_date OR (_birth->>'date')::date<'1800-01-01'::date OR jsonb_typeof(_birth->'lat')<>'number' OR jsonb_typeof(_birth->'lon')<>'number' OR abs((_birth->>'lat')::numeric)>90 OR abs((_birth->>'lon')::numeric)>180 OR NOT EXISTS(SELECT 1 FROM pg_timezone_names WHERE name=_birth->>'tz') THEN RAISE EXCEPTION 'Birth details are incomplete'; END IF;
 IF _birth->>'time' IS NOT NULL AND (_birth->>'time')!~ '^([01]\d|2[0-3]):[0-5]\d$' THEN RAISE EXCEPTION 'Birth time invalid'; END IF;
 IF o.format<>'digital' AND (jsonb_typeof(_shipping)<>'object' OR coalesce(_shipping->>'name','')='' OR coalesce(_shipping->>'line1','')='' OR coalesce(_shipping->>'city','')='' OR coalesce(_shipping->>'state','')='' OR coalesce(_shipping->>'postal_code','')='' OR coalesce(_shipping->>'country','')<>'US') THEN RAISE EXCEPTION 'A complete US shipping address is required'; END IF;
 UPDATE public.book_gift_claims SET recipient_id=auth.uid(),claimed_at=now(),recipient_birth=_birth,shipping_address=_shipping WHERE id=c.id;
 RETURN QUERY SELECT o.id,o.edition,o.format,_birth,_shipping;
END $$;
REVOKE ALL ON FUNCTION public.claim_book_gift(text,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.claim_book_gift(text,jsonb,jsonb) TO authenticated;
COMMENT ON TABLE public.book_gift_claims IS 'Recipient-only supplemental gift chart and shipping review; never overwrites frozen buyer manuscript or any profile. Token hashes service-only.';
CREATE TABLE public.shopify_order_sync (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), shop text NOT NULL, shopify_order_id text NOT NULL, financial_status text NOT NULL DEFAULT '', fulfillment_status text NOT NULL DEFAULT '',
 canceled boolean NOT NULL DEFAULT false, refunded boolean NOT NULL DEFAULT false, test boolean NOT NULL DEFAULT true, owner_id uuid,
 line_items jsonb NOT NULL DEFAULT '[]'::jsonb, tracking jsonb NOT NULL DEFAULT '[]'::jsonb, provider_updated_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(shop,shopify_order_id)
);
GRANT SELECT ON public.shopify_order_sync TO authenticated; GRANT ALL ON public.shopify_order_sync TO service_role;
ALTER TABLE public.shopify_order_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY shopify_orders_owner_read ON public.shopify_order_sync FOR SELECT TO authenticated USING(owner_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.shopify_webhook_events (delivery_id text PRIMARY KEY,shop text NOT NULL,topic text NOT NULL,payload_hash text NOT NULL,state text NOT NULL DEFAULT 'processing',received_at timestamptz NOT NULL DEFAULT now(),finished_at timestamptz);
GRANT ALL ON public.shopify_webhook_events TO service_role;
ALTER TABLE public.shopify_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.shopify_digital_access (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_sync_id uuid NOT NULL REFERENCES public.shopify_order_sync(id) ON DELETE CASCADE,line_id text NOT NULL,owner_id uuid NOT NULL,revoked_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(order_sync_id,line_id));
GRANT SELECT ON public.shopify_digital_access TO authenticated;GRANT ALL ON public.shopify_digital_access TO service_role;
ALTER TABLE public.shopify_digital_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY shopify_access_owner_read ON public.shopify_digital_access FOR SELECT TO authenticated USING(owner_id=auth.uid());
COMMENT ON TABLE public.shopify_digital_access IS 'Only provider-verified paid allowlisted digital variant lines with trusted signed owner linkage; never grants founder editions.';