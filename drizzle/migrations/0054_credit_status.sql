CREATE OR REPLACE FUNCTION public.credit_cost(_feature text) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _feature WHEN 'book-cover-request' THEN 3 WHEN 'creator-chapter' THEN 2 WHEN 'creator-podcast' THEN 5 ELSE 1 END $$;

CREATE OR REPLACE FUNCTION public.credit_status(_user_id uuid)
RETURNS TABLE(tier text, allowance integer, used integer, unlimited boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE t text := 'free'; unl boolean;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM _user_id THEN RAISE EXCEPTION 'not allowed'; END IF;
  SELECT CASE WHEN bool_or(price_id LIKE 'cosmic_%' OR price_id LIKE 'creator_%') THEN 'creator' ELSE 'full' END INTO t
    FROM public.billing_subscriptions WHERE user_id = _user_id AND environment = 'live'
    AND ((status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now())) OR (status = 'canceled' AND current_period_end > now()))
    HAVING count(*) > 0;
  t := coalesce(t, 'free');
  unl := public.is_shared_space_user_id(_user_id) OR public.has_role(_user_id, 'admin');
  RETURN QUERY SELECT t,
    CASE t WHEN 'creator' THEN 150 WHEN 'full' THEN 60 ELSE 5 END,
    coalesce((SELECT sum(public.credit_cost(feature))::int FROM public.ai_usage WHERE user_id = _user_id AND created_at >= date_trunc('month', now())), 0),
    unl;
END $$;

REVOKE ALL ON FUNCTION public.credit_status(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.credit_status(uuid) TO authenticated, service_role;