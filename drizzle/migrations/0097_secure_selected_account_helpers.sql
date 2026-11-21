CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN _user_id IS NOT NULL AND (
    auth.role() = 'service_role' OR _user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  ) THEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id AND r.role = _role)
  ELSE false END
$$;

CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live')
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN user_uuid IS NOT NULL AND (
    auth.role() = 'service_role' OR user_uuid = auth.uid() OR public.has_role(auth.uid(), 'admin')
  ) THEN EXISTS (SELECT 1 FROM public.billing_subscriptions WHERE user_id = user_uuid AND environment = check_env
    AND price_id IN ('pro_monthly','pro_yearly','cosmic_monthly','cosmic_yearly','full_access_monthly','full_access_yearly','creator_monthly','creator_yearly')
    AND ((status IN ('active','trialing','past_due') AND (current_period_end IS NULL OR current_period_end > now()))
      OR (status = 'canceled' AND current_period_end > now())))
  ELSE false END
$$;

CREATE OR REPLACE FUNCTION public.has_paid_plan(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN _user_id IS NOT NULL AND (
    auth.role() = 'service_role' OR _user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
  ) THEN public.has_active_subscription(_user_id,'live') OR public.active_grant_tier(_user_id) IS NOT NULL
    OR public.is_shared_space_user_id(_user_id) OR public.has_role(_user_id,'admin')
  ELSE false END
$$;

CREATE OR REPLACE FUNCTION public.claim_referral(_code text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); ref uuid; joined timestamptz; clean text := upper(trim(coalesce(_code, '')));
BEGIN
  IF uid IS NULL THEN RETURN 'sign_in'; END IF;
  IF clean !~ '^ZOD-[A-Z0-9]{6,10}$' THEN RETURN 'invalid'; END IF;
  SELECT user_id INTO ref FROM public.referral_codes WHERE code = clean;
  IF ref IS NULL THEN RETURN 'invalid'; END IF;
  IF ref = uid THEN RETURN 'own_code'; END IF;
  SELECT u.created_at INTO joined FROM auth.users u WHERE u.id = uid;
  IF joined IS NULL OR joined < now() - interval '7 days' OR joined > now() THEN RETURN 'too_late'; END IF;
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = uid) THEN RETURN 'already'; END IF;
  IF public.has_active_subscription(uid, 'live') THEN RETURN 'already_paid'; END IF;
  INSERT INTO public.referrals (referrer_id, referred_id, code) VALUES (ref, uid, clean);
  INSERT INTO public.plan_grants (user_id, tier, expires_at, reason, note) VALUES (uid, 'full', now() + interval '7 days', 'referral_welcome', 'Invited by a friend');
  RETURN 'claimed';
END $$;

ALTER FUNCTION public.get_document_overrides() SECURITY INVOKER;
