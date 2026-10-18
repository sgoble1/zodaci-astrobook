CREATE OR REPLACE FUNCTION public.admin_growth_stats(_days integer DEFAULT 30)
RETURNS TABLE(signups_total bigint, signups_recent bigint, onboarded_total bigint, paid_total bigint, paid_recent bigint, books_paid_total bigint, books_paid_recent bigint, books_shipped_total bigint, book_revenue_cents bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE since timestamptz := now() - make_interval(days => greatest(1, least(_days, 3650)));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT
    (SELECT count(*) FROM profiles),
    (SELECT count(*) FROM profiles WHERE created_at >= since),
    (SELECT count(*) FROM profiles WHERE onboarded_at IS NOT NULL),
    (SELECT count(DISTINCT user_id) FROM billing_subscriptions WHERE status IN ('active','trialing') AND environment = 'live'),
    (SELECT count(DISTINCT user_id) FROM billing_subscriptions WHERE environment = 'live' AND created_at >= since),
    (SELECT count(*) FROM book_orders WHERE environment = 'live' AND status IN ('paid','printing','shipped','delivered')),
    (SELECT count(*) FROM book_orders WHERE environment = 'live' AND status IN ('paid','printing','shipped','delivered') AND updated_at >= since),
    (SELECT count(*) FROM book_orders WHERE environment = 'live' AND status IN ('shipped','delivered')),
    (SELECT coalesce(sum(payment_total_cents),0)::bigint FROM book_orders WHERE environment = 'live' AND status IN ('paid','printing','shipped','delivered'));
END $$;
REVOKE ALL ON FUNCTION public.admin_growth_stats(integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_growth_stats(integer) TO authenticated;