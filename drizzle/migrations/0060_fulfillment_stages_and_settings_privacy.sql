-- Platform settings: the full table is admin-only; the site reads only allowlisted public values.
DROP POLICY IF EXISTS "settings are public" ON public.platform_settings;
REVOKE SELECT ON public.platform_settings FROM anon;
CREATE POLICY "admins read settings" ON public.platform_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.platform_settings ADD CONSTRAINT platform_settings_value_shape CHECK (jsonb_typeof(value) = 'object' AND length(value::text) <= 4000) NOT VALID;

CREATE OR REPLACE FUNCTION public.public_site_settings() RETURNS TABLE(key text, value jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.key, s.value FROM public.platform_settings s WHERE s.key IN ('site.general', 'site.maintenance', 'site.flags')
$$;
REVOKE ALL ON FUNCTION public.public_site_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_site_settings() TO anon, authenticated;

-- Member-only and admin-only helpers are not callable signed out.
REVOKE EXECUTE ON FUNCTION public.admin_grant(uuid, text, text, integer, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant(uuid, text, text, integer, integer, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_search(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_search(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_newsletter_audience(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_newsletter_audience(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_referral(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.my_referral_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_referral_code() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_signup_bonus() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_signup_bonus() TO authenticated;

-- Plan tier per member for admin views (activity feed, member lists).
CREATE OR REPLACE FUNCTION public.admin_member_plans(_ids uuid[]) RETURNS TABLE(id uuid, tier text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF cardinality(_ids) > 500 THEN RAISE EXCEPTION 'too many ids'; END IF;
  RETURN QUERY SELECT u, public.plan_tier(u) FROM unnest(_ids) AS u;
END $$;
REVOKE ALL ON FUNCTION public.admin_member_plans(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_member_plans(uuid[]) TO authenticated;

-- AstroBook fulfillment stages: paid → print brief sent → printing → quality check → shipped → delivered.
ALTER TABLE public.book_orders DROP CONSTRAINT book_orders_status_check;
ALTER TABLE public.book_orders ADD CONSTRAINT book_orders_status_check CHECK (status IN ('draft','quote_requested','awaiting_payment','paid','print_brief_sent','printing','quality_check','shipped','delivered','canceled'));

CREATE OR REPLACE FUNCTION public.guard_book_delivery() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.final_pdf_path IS NOT NULL OR NEW.pdf_ready_at IS NOT NULL THEN RAISE EXCEPTION 'PDF delivery is server managed'; END IF;
    ELSE
      IF NEW.final_pdf_path IS DISTINCT FROM OLD.final_pdf_path OR NEW.pdf_ready_at IS DISTINCT FROM OLD.pdf_ready_at OR NEW.payment_total_cents IS DISTINCT FROM OLD.payment_total_cents OR NEW.checkout_session_id IS DISTINCT FROM OLD.checkout_session_id OR NEW.environment IS DISTINCT FROM OLD.environment OR NEW.base_price_cents IS DISTINCT FROM OLD.base_price_cents OR NEW.extras_cents IS DISTINCT FROM OLD.extras_cents OR NEW.shipping_cents IS DISTINCT FROM OLD.shipping_cents THEN RAISE EXCEPTION 'Payment evidence and purchased prices are server managed'; END IF;
      IF OLD.checkout_session_id IS NOT NULL AND (NEW.manuscript_path IS DISTINCT FROM OLD.manuscript_path OR NEW.manuscript_pages IS DISTINCT FROM OLD.manuscript_pages OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.edition IS DISTINCT FROM OLD.edition OR NEW.cover_path IS DISTINCT FROM OLD.cover_path OR NEW.extra_sections IS DISTINCT FROM OLD.extra_sections OR NEW.format IS DISTINCT FROM OLD.format) THEN RAISE EXCEPTION 'Submitted book contents are locked'; END IF;
      IF NEW.status = 'paid' AND OLD.status NOT IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered') THEN RAISE EXCEPTION 'Payment confirmation is server managed'; END IF;
    END IF;
  END IF;
  IF NEW.format = 'digital' AND NEW.status IN ('print_brief_sent','printing','quality_check','shipped','delivered') THEN RAISE EXCEPTION 'Digital AstroBooks are downloaded, not shipped'; END IF;
  IF NEW.status IN ('print_brief_sent','printing','quality_check','shipped','delivered') THEN
    IF TG_OP = 'INSERT' THEN RAISE EXCEPTION 'Verified payment required'; END IF;
    IF NEW.environment <> 'live' OR OLD.status NOT IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered') OR NEW.payment_total_cents IS NULL OR NEW.final_pdf_path IS NULL THEN RAISE EXCEPTION 'Live verified payment and final PDF required for production'; END IF;
  END IF;
  IF NEW.status IN ('shipped','delivered') THEN
    IF NEW.carrier NOT IN ('USPS','UPS','FedEx') OR trim(NEW.tracking_number) = '' OR NEW.shipped_at IS NULL OR NEW.shipped_at > current_date THEN RAISE EXCEPTION 'Add a carrier, tracking and valid dispatch date'; END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.guard_book_payment_evidence() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.payment_intent_id IS NOT NULL OR NEW.payment_currency IS NOT NULL OR NEW.payment_tax_cents IS NOT NULL OR NEW.payment_hold IS NOT NULL OR NEW.payment_event_at IS NOT NULL OR NEW.checkout_lease IS NOT NULL OR NEW.checkout_lease_at IS NOT NULL THEN RAISE EXCEPTION 'Payment evidence is server managed'; END IF;
    ELSE
      IF NEW.payment_intent_id IS DISTINCT FROM OLD.payment_intent_id OR NEW.payment_currency IS DISTINCT FROM OLD.payment_currency OR NEW.payment_tax_cents IS DISTINCT FROM OLD.payment_tax_cents OR NEW.payment_hold IS DISTINCT FROM OLD.payment_hold OR NEW.payment_event_at IS DISTINCT FROM OLD.payment_event_at OR NEW.checkout_lease IS DISTINCT FROM OLD.checkout_lease OR NEW.checkout_lease_at IS DISTINCT FROM OLD.checkout_lease_at THEN RAISE EXCEPTION 'Payment evidence is server managed'; END IF;
    END IF;
  END IF;
  IF NEW.payment_hold IS NOT NULL AND NEW.status IN ('print_brief_sent','printing','quality_check','shipped','delivered') AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN RAISE EXCEPTION 'Resolve payment hold before fulfillment'; END IF;
  IF TG_OP = 'UPDATE' AND NEW.status = 'delivered' AND OLD.status NOT IN ('shipped','delivered') THEN RAISE EXCEPTION 'Dispatch before marking delivered'; END IF;
  RETURN NEW;
END $$;

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
    (SELECT count(*) FROM book_orders WHERE environment = 'live' AND status IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered')),
    (SELECT count(*) FROM book_orders WHERE environment = 'live' AND status IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered') AND updated_at >= since),
    (SELECT count(*) FROM book_orders WHERE environment = 'live' AND status IN ('shipped','delivered')),
    (SELECT coalesce(sum(payment_total_cents),0)::bigint FROM book_orders WHERE environment = 'live' AND status IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered'));
END $$;

-- Stage history for each order: visible to the order owner and admins; written only by the trigger.
CREATE TABLE public.book_order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.book_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL,
  previous_status text,
  actor text NOT NULL CHECK (actor IN ('member','admin','system')),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 300),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX book_order_events_order_idx ON public.book_order_events (order_id, created_at);
GRANT SELECT ON public.book_order_events TO authenticated;
GRANT ALL ON public.book_order_events TO service_role;
ALTER TABLE public.book_order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner or admin read order events" ON public.book_order_events FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_book_order_status() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE who text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  who := CASE WHEN current_user = 'service_role' OR auth.uid() IS NULL THEN 'system' WHEN public.has_role(auth.uid(), 'admin') THEN 'admin' ELSE 'member' END;
  INSERT INTO public.book_order_events (order_id, user_id, status, previous_status, actor, note)
  VALUES (NEW.id, NEW.user_id, NEW.status, CASE WHEN TG_OP = 'UPDATE' THEN OLD.status END, who,
    left(CASE WHEN NEW.status = 'shipped' THEN concat_ws(' · ', nullif(NEW.carrier, ''), nullif(NEW.tracking_number, '')) ELSE '' END, 300));
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.log_book_order_status() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER book_order_status_history AFTER INSERT OR UPDATE OF status ON public.book_orders FOR EACH ROW EXECUTE FUNCTION public.log_book_order_status();

INSERT INTO public.book_order_events (order_id, user_id, status, actor, note, created_at)
  SELECT id, user_id, status, 'system', 'Recorded when stage history began', updated_at FROM public.book_orders;