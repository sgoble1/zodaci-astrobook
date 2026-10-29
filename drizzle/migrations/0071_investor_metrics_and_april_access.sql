INSERT INTO public.investor_access(email, note) VALUES ('babybluepuppet@gmail.com','April — founder access') ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.investor_metrics()
RETURNS TABLE(members bigint, charts bigint, paid bigint, readings bigint, podcasts bigint, book_orders bigint, comic_subs bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_view_investors() THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT
    (SELECT count(*) FROM profiles),
    (SELECT count(*) FROM profiles WHERE chart IS NOT NULL OR birth_date IS NOT NULL),
    (SELECT count(*) FROM billing_subscriptions WHERE status IN ('active','trialing') AND environment = 'live'),
    (SELECT count(*) FROM generated_pages WHERE status = 'ready'),
    (SELECT count(*) FROM library_items WHERE kind = 'podcast'),
    (SELECT count(*) FROM book_orders WHERE payment_total_cents IS NOT NULL),
    (SELECT count(*) FROM comic_subscriptions WHERE status = 'active');
END $$;
REVOKE ALL ON FUNCTION public.investor_metrics() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.investor_metrics() TO authenticated;