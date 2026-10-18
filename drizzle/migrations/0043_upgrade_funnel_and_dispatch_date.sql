ALTER TABLE public.book_orders ADD COLUMN IF NOT EXISTS shipped_at date;

CREATE OR REPLACE FUNCTION public.admin_upgrade_funnel(_days integer DEFAULT 30)
RETURNS TABLE(free_members bigint, upgrade_clickers bigint, pricing_visitors bigint, paid_converts bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE since timestamptz := now() - make_interval(days => greatest(1, least(_days, 3650)));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY
  WITH members AS (
    SELECT p.id FROM profiles p
    WHERE NOT public.has_role(p.id, 'admin') AND NOT public.is_shared_space_user_id(p.id)
      AND NOT EXISTS (SELECT 1 FROM billing_subscriptions b WHERE b.user_id = p.id AND b.environment = 'live' AND b.created_at < since)
  ), clicks AS (
    SELECT DISTINCT e.user_id FROM activity_events e JOIN members m ON m.id = e.user_id
    WHERE e.created_at >= since AND e.kind = 'click'
      AND (e.label ILIKE '%upgrade%' OR e.label ILIKE '%full access%' OR e.detail->>'href' = '/pricing')
  ), visits AS (
    SELECT DISTINCT e.user_id FROM activity_events e JOIN members m ON m.id = e.user_id
    WHERE e.created_at >= since AND e.kind = 'page_view' AND e.path LIKE '/pricing%'
  ), paid AS (
    SELECT DISTINCT b.user_id FROM billing_subscriptions b JOIN members m ON m.id = b.user_id
    WHERE b.environment = 'live' AND b.created_at >= since
  )
  SELECT (SELECT count(*) FROM members), (SELECT count(*) FROM clicks), (SELECT count(*) FROM visits), (SELECT count(*) FROM paid);
END $$;
REVOKE ALL ON FUNCTION public.admin_upgrade_funnel(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_upgrade_funnel(integer) TO authenticated;