-- Reading tone preference (Oracle / Educational / Professional)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reading_tone text NOT NULL DEFAULT 'oracle';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_reading_tone_check CHECK (reading_tone IN ('oracle','educational','professional'));

-- Saved affirmations
CREATE TABLE public.saved_affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 400),
  source text NOT NULL DEFAULT '' CHECK (char_length(source) <= 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, text)
);
GRANT SELECT, INSERT, DELETE ON public.saved_affirmations TO authenticated;
GRANT ALL ON public.saved_affirmations TO service_role;
ALTER TABLE public.saved_affirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own affirmations read" ON public.saved_affirmations FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own affirmations add" ON public.saved_affirmations FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own affirmations remove" ON public.saved_affirmations FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Time-limited plan grants (referral rewards, admin grants, gifts)
CREATE TABLE public.plan_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL CHECK (tier IN ('full','creator')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  reason text NOT NULL CHECK (reason IN ('referral_reward','referral_welcome','admin','gift')),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 300),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > starts_at)
);
CREATE INDEX plan_grants_user_idx ON public.plan_grants (user_id, expires_at);
GRANT SELECT ON public.plan_grants TO authenticated;
GRANT ALL ON public.plan_grants TO service_role;
ALTER TABLE public.plan_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin grants read" ON public.plan_grants FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.active_grant_tier(_user_id uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN bool_or(tier = 'creator') THEN 'creator' WHEN count(*) > 0 THEN 'full' END
  FROM public.plan_grants WHERE user_id = _user_id AND now() >= starts_at AND now() < expires_at
$$;

-- Bonus credits (signup bonus, referral bonus, admin top-ups)
CREATE TABLE public.credit_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL CHECK (amount BETWEEN 1 AND 1000),
  reason text NOT NULL CHECK (reason IN ('signup_bonus','referral_bonus','admin')),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 300),
  expires_at timestamptz NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX credit_grants_one_signup_bonus ON public.credit_grants (user_id) WHERE reason = 'signup_bonus';
GRANT SELECT ON public.credit_grants TO authenticated;
GRANT ALL ON public.credit_grants TO service_role;
ALTER TABLE public.credit_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin credit grants read" ON public.credit_grants FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Only Pro/Cosmic (and legacy Full Access/Creator) prices grant plan access; AstroComic never does.
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live') RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.billing_subscriptions WHERE user_id = user_uuid AND environment = check_env
    AND price_id IN ('pro_monthly','pro_yearly','cosmic_monthly','cosmic_yearly','full_access_monthly','full_access_yearly','creator_monthly','creator_yearly')
    AND ((status IN ('active','trialing','past_due') AND (current_period_end IS NULL OR current_period_end > now()))
      OR (status = 'canceled' AND current_period_end > now())));
$$;

CREATE OR REPLACE FUNCTION public.has_paid_plan(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_active_subscription(_user_id,'live') OR public.active_grant_tier(_user_id) IS NOT NULL OR public.is_shared_space_user_id(_user_id) OR public.has_role(_user_id,'admin')
$$;

CREATE OR REPLACE FUNCTION public.credit_status(_user_id uuid)
RETURNS TABLE(tier text, allowance integer, used integer, unlimited boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE t text; g text; unl boolean; bonus int;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM _user_id THEN RAISE EXCEPTION 'not allowed'; END IF;
  SELECT CASE WHEN bool_or(price_id LIKE 'cosmic_%' OR price_id LIKE 'creator_%') THEN 'creator' ELSE 'full' END INTO t
    FROM public.billing_subscriptions WHERE user_id = _user_id AND environment = 'live'
    AND price_id IN ('pro_monthly','pro_yearly','cosmic_monthly','cosmic_yearly','full_access_monthly','full_access_yearly','creator_monthly','creator_yearly')
    AND ((status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now())) OR (status = 'canceled' AND current_period_end > now()))
    HAVING count(*) > 0;
  g := public.active_grant_tier(_user_id);
  t := CASE WHEN t = 'creator' OR g = 'creator' THEN 'creator' WHEN t = 'full' OR g = 'full' THEN 'full' ELSE 'free' END;
  unl := public.is_shared_space_user_id(_user_id) OR public.has_role(_user_id, 'admin');
  SELECT coalesce(sum(amount), 0)::int INTO bonus FROM public.credit_grants WHERE user_id = _user_id AND expires_at > now();
  RETURN QUERY SELECT t,
    (CASE t WHEN 'creator' THEN 150 WHEN 'full' THEN 60 ELSE 5 END) + bonus,
    coalesce((SELECT sum(public.credit_cost(feature))::int FROM public.ai_usage WHERE user_id = _user_id AND created_at >= date_trunc('month', now())), 0),
    unl;
END $$;

-- One-time signup bonus: 10 credits for 30 days, claimable within 14 days of joining.
CREATE OR REPLACE FUNCTION public.claim_signup_bonus() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); joined timestamptz;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;
  SELECT created_at INTO joined FROM public.profiles WHERE id = uid;
  IF joined IS NULL OR joined < now() - interval '14 days' THEN RETURN 0; END IF;
  INSERT INTO public.credit_grants (user_id, amount, reason, note, expires_at) VALUES (uid, 10, 'signup_bonus', 'Welcome bonus', now() + interval '30 days')
    ON CONFLICT (user_id) WHERE reason = 'signup_bonus' DO NOTHING;
  IF FOUND THEN RETURN 10; END IF;
  RETURN 0;
END $$;

-- Referrals
CREATE TABLE public.referral_codes (
  user_id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE CHECK (code ~ '^ZOD-[A-Z0-9]{6,10}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own referral code read" ON public.referral_codes FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL UNIQUE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','converted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz,
  CHECK (referrer_id <> referred_id)
);
CREATE INDEX referrals_referrer_idx ON public.referrals (referrer_id);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral parties read" ON public.referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR referred_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.my_referral_code() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); c text; n int := 6;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'sign in required'; END IF;
  SELECT code INTO c FROM public.referral_codes WHERE user_id = uid;
  IF c IS NOT NULL THEN RETURN c; END IF;
  LOOP
    c := 'ZOD-' || upper(substr(replace(uid::text, '-', ''), 1, n));
    BEGIN
      INSERT INTO public.referral_codes (user_id, code) VALUES (uid, c);
      RETURN c;
    EXCEPTION WHEN unique_violation THEN
      SELECT code INTO c FROM public.referral_codes WHERE user_id = uid;
      IF c IS NOT NULL THEN RETURN c; END IF;
      n := n + 1;
      IF n > 10 THEN RAISE EXCEPTION 'could not create code'; END IF;
    END;
  END LOOP;
END $$;

-- New members (joined within 7 days) can claim one friend's code: 7 days of Pro for them.
CREATE OR REPLACE FUNCTION public.claim_referral(_code text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); ref uuid; joined timestamptz; clean text := upper(trim(coalesce(_code, '')));
BEGIN
  IF uid IS NULL THEN RETURN 'sign_in'; END IF;
  IF clean !~ '^ZOD-[A-Z0-9]{6,10}$' THEN RETURN 'invalid'; END IF;
  SELECT user_id INTO ref FROM public.referral_codes WHERE code = clean;
  IF ref IS NULL THEN RETURN 'invalid'; END IF;
  IF ref = uid THEN RETURN 'own_code'; END IF;
  SELECT created_at INTO joined FROM public.profiles WHERE id = uid;
  IF joined IS NULL OR joined < now() - interval '7 days' THEN RETURN 'too_late'; END IF;
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = uid) THEN RETURN 'already'; END IF;
  IF public.has_active_subscription(uid, 'live') THEN RETURN 'already_paid'; END IF;
  INSERT INTO public.referrals (referrer_id, referred_id, code) VALUES (ref, uid, clean);
  INSERT INTO public.plan_grants (user_id, tier, expires_at, reason, note) VALUES (uid, 'full', now() + interval '7 days', 'referral_welcome', 'Invited by a friend');
  RETURN 'claimed';
END $$;

-- Called by the payment webhook when a referred member's first paid plan starts: 30 days of Pro for the referrer (max 12 per year).
CREATE OR REPLACE FUNCTION public.reward_referral(_referred uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.referrals;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'not allowed'; END IF;
  UPDATE public.referrals SET status = 'converted', converted_at = now() WHERE referred_id = _referred AND status = 'pending' RETURNING * INTO r;
  IF r.id IS NULL THEN RETURN false; END IF;
  IF (SELECT count(*) FROM public.plan_grants WHERE user_id = r.referrer_id AND reason = 'referral_reward' AND created_at > now() - interval '365 days') >= 12 THEN RETURN true; END IF;
  INSERT INTO public.plan_grants (user_id, tier, starts_at, expires_at, reason, note)
    SELECT r.referrer_id, 'full', greatest(now(), coalesce(max(expires_at), now())), greatest(now(), coalesce(max(expires_at), now())) + interval '30 days', 'referral_reward', 'A friend you invited subscribed'
    FROM public.plan_grants WHERE user_id = r.referrer_id AND reason = 'referral_reward' AND expires_at > now();
  RETURN true;
END $$;

-- Immutable admin audit log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL CHECK (char_length(action) BETWEEN 1 AND 80),
  target_table text NOT NULL DEFAULT '' CHECK (char_length(target_table) <= 80),
  target_id text NOT NULL DEFAULT '' CHECK (char_length(target_id) <= 120),
  summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 500),
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write own audit entries" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- Admin plan/credit grants (audited)
CREATE OR REPLACE FUNCTION public.admin_grant(_user_id uuid, _kind text, _tier text, _days integer, _credits integer, _note text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE gid uuid; uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(uid, 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF _days IS NULL OR _days < 1 OR _days > 366 THEN RAISE EXCEPTION 'days must be 1-366'; END IF;
  IF _kind = 'plan' THEN
    IF _tier NOT IN ('full','creator') THEN RAISE EXCEPTION 'invalid tier'; END IF;
    INSERT INTO public.plan_grants (user_id, tier, expires_at, reason, note, created_by) VALUES (_user_id, _tier, now() + make_interval(days => _days), 'admin', left(coalesce(_note,''), 300), uid) RETURNING id INTO gid;
  ELSIF _kind = 'credits' THEN
    IF _credits IS NULL OR _credits < 1 OR _credits > 1000 THEN RAISE EXCEPTION 'credits must be 1-1000'; END IF;
    INSERT INTO public.credit_grants (user_id, amount, reason, note, expires_at, created_by) VALUES (_user_id, _credits, 'admin', left(coalesce(_note,''), 300), now() + make_interval(days => _days), uid) RETURNING id INTO gid;
  ELSE RAISE EXCEPTION 'invalid kind'; END IF;
  INSERT INTO public.audit_log (admin_id, action, target_table, target_id, summary, after)
    VALUES (uid, CASE WHEN _kind = 'plan' THEN 'plan.grant' ELSE 'credits.grant' END, CASE WHEN _kind = 'plan' THEN 'plan_grants' ELSE 'credit_grants' END, gid::text,
      left(format('%s for %s days to %s', CASE WHEN _kind = 'plan' THEN _tier ELSE _credits || ' credits' END, _days, _user_id), 500),
      jsonb_build_object('user_id', _user_id, 'tier', _tier, 'credits', _credits, 'days', _days, 'note', _note));
  RETURN gid;
END $$;

-- Platform settings (public, non-secret values only; secrets stay in server configuration)
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY CHECK (key ~ '^[a-z0-9_.-]{1,64}$'),
  value jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings are public" ON public.platform_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins add settings" ON public.platform_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins change settings" ON public.platform_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.platform_settings (key, value) VALUES
  ('site.general', '{"display_name":"Zodaci","tagline":"Your sky. Your story.","support_email":""}'),
  ('site.maintenance', '{"enabled":false,"message":"Zodaci is being updated. Please check back shortly."}'),
  ('site.flags', '{"astrocomic":true,"referrals":true,"academy":true,"compatibility":true,"community":true}')
ON CONFLICT (key) DO NOTHING;

-- Newsletter campaigns (drafting and audience; sending needs an email sender domain)
CREATE TABLE public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
  subject text NOT NULL DEFAULT '' CHECK (char_length(subject) <= 150),
  preview_text text NOT NULL DEFAULT '' CHECK (char_length(preview_text) <= 200),
  body_md text NOT NULL DEFAULT '' CHECK (char_length(body_md) <= 50000),
  segment text NOT NULL DEFAULT 'all' CHECK (segment IN ('all','free','pro','cosmic','subscribers')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_campaigns TO authenticated;
GRANT ALL ON public.newsletter_campaigns TO service_role;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read campaigns" ON public.newsletter_campaigns FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins add campaigns" ON public.newsletter_campaigns FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());
CREATE POLICY "admins edit campaigns" ON public.newsletter_campaigns FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete campaigns" ON public.newsletter_campaigns FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_newsletter_audience(_segment text) RETURNS bigint
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF _segment = 'subscribers' THEN RETURN (SELECT count(*) FROM public.brand_email_subscribers); END IF;
  RETURN (SELECT count(*) FROM public.profiles p WHERE CASE _segment
    WHEN 'all' THEN true
    WHEN 'free' THEN NOT public.has_paid_plan(p.id)
    WHEN 'pro' THEN public.has_paid_plan(p.id) AND (SELECT tier FROM public.credit_status_admin(p.id)) = 'full'
    WHEN 'cosmic' THEN (SELECT tier FROM public.credit_status_admin(p.id)) = 'creator'
    ELSE false END);
END $$;

-- AstroComic
CREATE TABLE public.comic_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL CHECK (plan IN ('monthly','yearly','single')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','paused','past_due','canceled','completed')),
  environment text NOT NULL CHECK (environment IN ('sandbox','live')),
  stripe_subscription_id text UNIQUE,
  checkout_session_id text UNIQUE,
  stripe_customer_id text,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  paused_until date,
  skip_months date[] NOT NULL DEFAULT '{}',
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comic_subscriptions_user_idx ON public.comic_subscriptions (user_id);
GRANT SELECT, UPDATE ON public.comic_subscriptions TO authenticated;
GRANT ALL ON public.comic_subscriptions TO service_role;
ALTER TABLE public.comic_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin comic subscriptions read" ON public.comic_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own or admin comic subscriptions update" ON public.comic_subscriptions FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.guard_comic_subscription_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user = 'service_role' OR public.has_role(auth.uid(), 'admin') THEN NEW.updated_at := now(); RETURN NEW; END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.plan IS DISTINCT FROM OLD.plan OR NEW.status IS DISTINCT FROM OLD.status OR NEW.environment IS DISTINCT FROM OLD.environment
    OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id OR NEW.checkout_session_id IS DISTINCT FROM OLD.checkout_session_id OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.current_period_end IS DISTINCT FROM OLD.current_period_end OR NEW.cancel_at_period_end IS DISTINCT FROM OLD.cancel_at_period_end OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only delivery address, pause and skip settings can be changed here';
  END IF;
  IF jsonb_typeof(NEW.shipping_address) <> 'object' OR length(NEW.shipping_address::text) > 2000 THEN RAISE EXCEPTION 'Invalid address'; END IF;
  IF NEW.paused_until IS NOT NULL AND (NEW.paused_until < current_date OR NEW.paused_until > current_date + 92) THEN RAISE EXCEPTION 'Pause for up to three months'; END IF;
  IF cardinality(NEW.skip_months) > 6 THEN RAISE EXCEPTION 'Skip up to six months'; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER comic_subscription_guard BEFORE UPDATE ON public.comic_subscriptions FOR EACH ROW EXECUTE FUNCTION public.guard_comic_subscription_update();

CREATE TABLE public.comic_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid NOT NULL REFERENCES public.comic_subscriptions(id) ON DELETE CASCADE,
  issue_month date NOT NULL,
  issue_number integer NOT NULL DEFAULT 1 CHECK (issue_number >= 1),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','printing','shipped','skipped')),
  title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 200),
  script jsonb NOT NULL DEFAULT '{}'::jsonb,
  cover_path text,
  carrier text NOT NULL DEFAULT '' CHECK (char_length(carrier) <= 60),
  tracking_number text NOT NULL DEFAULT '' CHECK (char_length(tracking_number) <= 120),
  shipped_at date,
  admin_note text NOT NULL DEFAULT '' CHECK (char_length(admin_note) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, issue_month)
);
GRANT SELECT, INSERT, UPDATE ON public.comic_issues TO authenticated;
GRANT ALL ON public.comic_issues TO service_role;
ALTER TABLE public.comic_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribers read released issues" ON public.comic_issues FOR SELECT TO authenticated USING ((user_id = auth.uid() AND status IN ('approved','printing','shipped')) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins add issues" ON public.comic_issues FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins edit issues" ON public.comic_issues FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.comic_print_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_month date NOT NULL UNIQUE,
  printer text NOT NULL DEFAULT '' CHECK (char_length(printer) <= 120),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  quote_cents integer CHECK (quote_cents >= 0),
  actual_cents integer CHECK (actual_cents >= 0),
  order_ref text NOT NULL DEFAULT '' CHECK (char_length(order_ref) <= 120),
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','quoted','ordered','printed','shipped')),
  due_date date,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.comic_print_runs TO authenticated;
GRANT ALL ON public.comic_print_runs TO service_role;
ALTER TABLE public.comic_print_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read print runs" ON public.comic_print_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins add print runs" ON public.comic_print_runs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins edit print runs" ON public.comic_print_runs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- AstroBook five versions (legacy standard/expanded orders stay valid)
ALTER TABLE public.book_orders DROP CONSTRAINT book_orders_edition_check;
ALTER TABLE public.book_orders ADD CONSTRAINT book_orders_edition_check CHECK (edition IN ('standard','expanded','digital','pocket','classic','signature','linen'));
ALTER TABLE public.book_orders ADD CONSTRAINT book_orders_edition_format_check CHECK ((edition <> 'digital' OR format = 'digital') AND (edition NOT IN ('pocket','classic','signature','linen') OR format = 'print'));
ALTER TABLE public.book_orders ADD COLUMN IF NOT EXISTS gift boolean NOT NULL DEFAULT false;
ALTER TABLE public.book_orders ADD COLUMN IF NOT EXISTS gift_message text NOT NULL DEFAULT '';
ALTER TABLE public.book_orders ADD CONSTRAINT book_orders_gift_message_check CHECK (char_length(gift_message) <= 500);
ALTER TABLE public.book_orders ADD COLUMN IF NOT EXISTS lulu_reference text NOT NULL DEFAULT '';
ALTER TABLE public.book_orders ADD CONSTRAINT book_orders_lulu_reference_check CHECK (char_length(lulu_reference) <= 120);
ALTER TABLE public.book_costing DROP CONSTRAINT book_costing_edition_check;
ALTER TABLE public.book_costing ADD CONSTRAINT book_costing_edition_check CHECK (edition IN ('standard','expanded','digital','pocket','classic','signature','linen'));
INSERT INTO public.book_costing (edition, print_cents, delivery_cents, fees_cents, quote_source) VALUES
  ('digital', 0, 0, 102, 'Card fees only; no printing'),
  ('pocket', 650, 499, 131, 'Estimate — verify in the Lulu price calculator'),
  ('classic', 2350, 699, 204, 'Estimate — verify in the Lulu price calculator'),
  ('signature', 4100, 899, 311, 'Estimate — verify in the Lulu price calculator'),
  ('linen', 6900, 1299, 462, 'Estimate — verify in the Lulu price calculator (includes gift box, prints and certificate)')
ON CONFLICT (edition) DO NOTHING;

-- Admin search across members, orders, pages and library items
CREATE OR REPLACE FUNCTION public.admin_search(_q text) RETURNS TABLE(kind text, id text, label text, detail text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE q text := trim(coalesce(_q, ''));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF char_length(q) < 2 THEN RETURN; END IF;
  q := replace(replace(q, '%', ''), '_', '');
  RETURN QUERY
  (SELECT 'member'::text, p.id::text, coalesce(nullif(p.display_name, ''), u.email::text, 'Member'), coalesce(u.email::text, '')
     FROM public.profiles p LEFT JOIN auth.users u ON u.id = p.id
     WHERE p.display_name ILIKE '%' || q || '%' OR u.email ILIKE '%' || q || '%' LIMIT 8)
  UNION ALL
  (SELECT 'order', o.id::text, initcap(o.edition) || ' AstroBook · ' || o.status, to_char(o.created_at, 'YYYY-MM-DD')
     FROM public.book_orders o WHERE o.id::text ILIKE q || '%' OR o.tracking_number ILIKE '%' || q || '%' LIMIT 6)
  UNION ALL
  (SELECT 'page', m.id::text, m.title, '/p/' || m.slug FROM public.marketing_pages m WHERE m.title ILIKE '%' || q || '%' OR m.slug ILIKE '%' || q || '%' LIMIT 6)
  UNION ALL
  (SELECT 'library', l.id::text, l.title, l.kind FROM public.library_items l WHERE l.title ILIKE '%' || q || '%' LIMIT 6);
END $$;