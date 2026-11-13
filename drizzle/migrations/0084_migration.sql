CREATE OR REPLACE FUNCTION public.reward_referral(_referred uuid)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.referrals;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'not allowed'; END IF;
  UPDATE public.referrals SET status = 'converted', converted_at = now() WHERE referred_id = _referred AND status = 'pending' RETURNING * INTO r;
  IF r.id IS NULL THEN RETURN false; END IF;
  -- Owner choice (Nov 13 2026): referral reward is 20 bonus credits, capped at 12 rewards per year.
  IF (SELECT count(*) FROM public.credit_ledger WHERE user_id = r.referrer_id AND reason = 'referral_reward' AND created_at > now() - interval '365 days')
   + (SELECT count(*) FROM public.plan_grants WHERE user_id = r.referrer_id AND reason = 'referral_reward' AND created_at > now() - interval '365 days') >= 12 THEN RETURN true; END IF;
  INSERT INTO public.credit_ledger (user_id, delta, reason, ref, environment)
  VALUES (r.referrer_id, 20, 'referral_reward', 'referral:' || r.id::text, 'live');
  RETURN true;
END $function$;