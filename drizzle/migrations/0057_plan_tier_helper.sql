CREATE OR REPLACE FUNCTION public.plan_tier(_user_id uuid) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE t text; g text;
BEGIN
  SELECT CASE WHEN bool_or(price_id LIKE 'cosmic_%' OR price_id LIKE 'creator_%') THEN 'creator' ELSE 'full' END INTO t
    FROM public.billing_subscriptions WHERE user_id = _user_id AND environment = 'live'
    AND price_id IN ('pro_monthly','pro_yearly','cosmic_monthly','cosmic_yearly','full_access_monthly','full_access_yearly','creator_monthly','creator_yearly')
    AND ((status IN ('active','trialing','past_due') AND (current_period_end IS NULL OR current_period_end > now())) OR (status = 'canceled' AND current_period_end > now()))
    HAVING count(*) > 0;
  g := public.active_grant_tier(_user_id);
  RETURN CASE WHEN t = 'creator' OR g = 'creator' THEN 'creator' WHEN t = 'full' OR g = 'full' THEN 'full' ELSE 'free' END;
END $$;
REVOKE EXECUTE ON FUNCTION public.plan_tier(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.plan_tier(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_newsletter_audience(_segment text) RETURNS bigint
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF _segment = 'subscribers' THEN RETURN (SELECT count(*) FROM public.brand_email_subscribers); END IF;
  IF _segment NOT IN ('all','free','pro','cosmic') THEN RAISE EXCEPTION 'invalid segment'; END IF;
  RETURN (SELECT count(*) FROM public.profiles p WHERE _segment = 'all'
    OR (_segment = 'free' AND public.plan_tier(p.id) = 'free')
    OR (_segment = 'pro' AND public.plan_tier(p.id) = 'full')
    OR (_segment = 'cosmic' AND public.plan_tier(p.id) = 'creator'));
END $$;

REVOKE EXECUTE ON FUNCTION public.reward_referral(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reward_referral(uuid) TO service_role;