CREATE OR REPLACE FUNCTION public.validate_claim_birth() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NEW.recipient_birth IS NOT NULL THEN
  IF jsonb_typeof(NEW.recipient_birth)<>'object' OR NOT (NEW.recipient_birth ?& ARRAY['name','date','time','lat','lon','tz','placeLabel','houseSystem']) OR octet_length(NEW.recipient_birth::text)>5000 OR coalesce(jsonb_typeof(NEW.recipient_birth->'lat'),'')<>'number' OR coalesce(jsonb_typeof(NEW.recipient_birth->'lon'),'')<>'number' OR abs((NEW.recipient_birth->>'lat')::numeric)>90 OR abs((NEW.recipient_birth->>'lon')::numeric)>180 OR length(coalesce(NEW.recipient_birth->>'name','')) NOT BETWEEN 1 AND 80 OR length(coalesce(NEW.recipient_birth->>'placeLabel','')) NOT BETWEEN 1 AND 160 OR coalesce(NEW.recipient_birth->>'houseSystem','') NOT IN ('placidus','whole','equal','porphyry') THEN RAISE EXCEPTION 'Invalid gift chart'; END IF;
 END IF;
 IF NEW.shipping_address IS NOT NULL AND octet_length(NEW.shipping_address::text)>5000 THEN RAISE EXCEPTION 'Shipping details too large'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER validate_book_gift_claim BEFORE INSERT OR UPDATE ON public.book_gift_claims FOR EACH ROW EXECUTE FUNCTION public.validate_claim_birth();
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
 IF lower(o.recipient_email)<>verified_email OR NOT o.gift OR o.status NOT IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered') OR o.payment_total_cents IS NULL OR o.payment_hold IS NOT NULL OR o.environment<>'live' THEN RAISE EXCEPTION 'Gift not available to this account'; END IF;
 IF c.claimed_at IS NOT NULL THEN
   IF c.recipient_id<>auth.uid() THEN RAISE EXCEPTION 'Gift already claimed'; END IF;
   RETURN QUERY SELECT o.id,o.edition,o.format,c.recipient_birth,c.shipping_address; RETURN;
 END IF;
 IF c.expires_at<=now() THEN RAISE EXCEPTION 'Gift link expired'; END IF;
 IF _birth IS NULL OR jsonb_typeof(_birth)<>'object' OR NOT (_birth ?& ARRAY['name','date','time','lat','lon','tz','placeLabel','houseSystem']) OR coalesce(_birth->>'date','')!~ '^\d{4}-\d{2}-\d{2}$' OR (_birth->>'date')::date>current_date OR (_birth->>'date')::date<'1800-01-01'::date OR NOT EXISTS(SELECT 1 FROM pg_timezone_names WHERE name=_birth->>'tz') THEN RAISE EXCEPTION 'Birth details are incomplete'; END IF;
 IF _birth->>'time' IS NOT NULL AND (_birth->>'time')!~ '^([01]\d|2[0-3]):[0-5]\d$' THEN RAISE EXCEPTION 'Birth time invalid'; END IF;
 IF o.format<>'digital' AND (_shipping IS NULL OR jsonb_typeof(_shipping)<>'object' OR coalesce(_shipping->>'name','')='' OR coalesce(_shipping->>'line1','')='' OR coalesce(_shipping->>'city','')='' OR coalesce(_shipping->>'state','')='' OR coalesce(_shipping->>'postal_code','')='' OR coalesce(_shipping->>'country','')<>'US') THEN RAISE EXCEPTION 'A complete US shipping address is required'; END IF;
 UPDATE public.book_gift_claims SET recipient_id=auth.uid(),claimed_at=now(),recipient_birth=_birth,shipping_address=_shipping WHERE id=c.id;
 RETURN QUERY SELECT o.id,o.edition,o.format,_birth,_shipping;
END $$;
REVOKE ALL ON FUNCTION public.claim_book_gift(text,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.claim_book_gift(text,jsonb,jsonb) TO authenticated;