CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  ref text UNIQUE,
  environment text NOT NULL DEFAULT 'live',
  amount_cents integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own ledger" ON public.credit_ledger FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX credit_ledger_user ON public.credit_ledger(user_id, created_at);

-- Monthly allowance (plan + admin grants), excluding purchased packs.
CREATE OR REPLACE FUNCTION public.credit_base(_user_id uuid)
RETURNS TABLE(tier text, base integer, unlimited boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE t text; g text; bonus int;
BEGIN
  SELECT CASE WHEN bool_or(price_id LIKE 'cosmic_%' OR price_id LIKE 'creator_%') THEN 'creator' ELSE 'full' END INTO t
    FROM public.billing_subscriptions WHERE user_id = _user_id AND environment = 'live'
    AND price_id IN ('pro_monthly','pro_yearly','cosmic_monthly','cosmic_yearly','full_access_monthly','full_access_yearly','creator_monthly','creator_yearly')
    AND ((status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now())) OR (status = 'canceled' AND current_period_end > now()))
    HAVING count(*) > 0;
  g := public.active_grant_tier(_user_id);
  t := CASE WHEN t = 'creator' OR g = 'creator' THEN 'creator' WHEN t = 'full' OR g = 'full' THEN 'full' ELSE 'free' END;
  SELECT coalesce(sum(amount), 0)::int INTO bonus FROM public.credit_grants WHERE user_id = _user_id AND expires_at > now();
  RETURN QUERY SELECT t, (CASE t WHEN 'creator' THEN 150 WHEN 'full' THEN 60 ELSE 5 END) + bonus,
    (public.is_shared_space_user_id(_user_id) OR public.has_role(_user_id, 'admin'));
END $$;
REVOKE ALL ON FUNCTION public.credit_base(uuid) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.credit_status(_user_id uuid)
RETURNS TABLE(tier text, allowance integer, used integer, unlimited boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; bal int; debited int;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM _user_id THEN RAISE EXCEPTION 'not allowed'; END IF;
  SELECT * INTO b FROM public.credit_base(_user_id);
  SELECT coalesce(sum(delta),0)::int INTO bal FROM public.credit_ledger WHERE user_id = _user_id;
  SELECT coalesce(-sum(delta),0)::int INTO debited FROM public.credit_ledger WHERE user_id = _user_id AND delta < 0 AND created_at >= date_trunc('month', now());
  RETURN QUERY SELECT b.tier, b.base + greatest(bal,0) + debited,
    coalesce((SELECT sum(public.credit_cost(feature))::int FROM public.ai_usage WHERE user_id = _user_id AND created_at >= date_trunc('month', now())), 0),
    b.unlimited;
END $$;

-- Purchased credits are spent once: usage beyond the monthly allowance draws down the pack balance.
CREATE OR REPLACE FUNCTION public.debit_purchased_credits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; used int; debited int; bal int; over int;
BEGIN
  SELECT * INTO b FROM public.credit_base(NEW.user_id);
  IF b.unlimited THEN RETURN NEW; END IF;
  SELECT coalesce(sum(public.credit_cost(feature)),0)::int INTO used FROM public.ai_usage WHERE user_id = NEW.user_id AND created_at >= date_trunc('month', now());
  SELECT coalesce(-sum(delta),0)::int INTO debited FROM public.credit_ledger WHERE user_id = NEW.user_id AND delta < 0 AND created_at >= date_trunc('month', now());
  SELECT coalesce(sum(delta),0)::int INTO bal FROM public.credit_ledger WHERE user_id = NEW.user_id;
  over := least(public.credit_cost(NEW.feature), used - b.base - debited, bal);
  IF over > 0 THEN INSERT INTO public.credit_ledger(user_id, delta, reason) VALUES (NEW.user_id, -over, 'usage:' || NEW.feature); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER ai_usage_debit_purchased AFTER INSERT ON public.ai_usage FOR EACH ROW EXECUTE FUNCTION public.debit_purchased_credits();

CREATE OR REPLACE FUNCTION public.my_credit_balance()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT greatest(coalesce(sum(delta),0),0)::int FROM public.credit_ledger WHERE user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.my_credit_balance() TO authenticated;