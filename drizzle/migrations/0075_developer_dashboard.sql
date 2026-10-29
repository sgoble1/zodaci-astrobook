CREATE OR REPLACE FUNCTION public.is_developer()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin') AND lower(coalesce(auth.jwt() ->> 'email','')) IN ('shanegoble@gmail.com','shanealecompte@gmail.com');
$$;
GRANT EXECUTE ON FUNCTION public.is_developer() TO authenticated;

CREATE TABLE public.dev_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  details text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'feature' CHECK (kind IN ('feature','bug','gap','plan')),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','blocked','done')),
  area text NOT NULL DEFAULT 'General',
  priority integer NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  blocker text NOT NULL DEFAULT '',
  cost_cents integer,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_items TO authenticated;
GRANT ALL ON public.dev_items TO service_role;
ALTER TABLE public.dev_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read dev items" ON public.dev_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Developer inserts dev items" ON public.dev_items FOR INSERT TO authenticated WITH CHECK (public.is_developer());
CREATE POLICY "Developer updates dev items" ON public.dev_items FOR UPDATE TO authenticated USING (public.is_developer()) WITH CHECK (public.is_developer());
CREATE POLICY "Developer deletes dev items" ON public.dev_items FOR DELETE TO authenticated USING (public.is_developer());
ALTER PUBLICATION supabase_realtime ADD TABLE public.dev_items;

-- Live platform numbers for the developer dashboard (admins only).
CREATE OR REPLACE FUNCTION public.dev_stats()
RETURNS TABLE(members bigint, members_7d bigint, readings bigint, readings_7d bigint, podcasts bigint, creations bigint, ai_uses_month bigint, ai_credits_month bigint, paid_live bigint, book_orders bigint, comic_subs bigint, credit_packs_cents bigint, events_24h bigint, contact_open bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT
    (SELECT count(*) FROM profiles), (SELECT count(*) FROM profiles WHERE created_at > now() - interval '7 days'),
    (SELECT count(*) FROM generated_pages WHERE status='ready'), (SELECT count(*) FROM generated_pages WHERE status='ready' AND updated_at > now() - interval '7 days'),
    (SELECT count(*) FROM library_items WHERE kind='podcast'), (SELECT count(*) FROM library_items WHERE kind='creation'),
    (SELECT count(*) FROM ai_usage WHERE created_at >= date_trunc('month', now())),
    (SELECT coalesce(sum(public.credit_cost(feature)),0) FROM ai_usage WHERE created_at >= date_trunc('month', now())),
    (SELECT count(*) FROM billing_subscriptions WHERE environment='live' AND status IN ('active','trialing')),
    (SELECT count(*) FROM book_orders WHERE payment_total_cents IS NOT NULL),
    (SELECT count(*) FROM comic_subscriptions WHERE status='active'),
    (SELECT coalesce(sum(amount_cents),0) FROM credit_ledger WHERE environment='live' AND delta > 0),
    (SELECT count(*) FROM activity_events WHERE created_at > now() - interval '24 hours'),
    (SELECT count(*) FROM contact_messages WHERE handled_at IS NULL);
END $$;
GRANT EXECUTE ON FUNCTION public.dev_stats() TO authenticated;