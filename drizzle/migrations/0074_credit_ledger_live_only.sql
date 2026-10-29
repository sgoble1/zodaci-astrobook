CREATE OR REPLACE FUNCTION public.credit_status(_user_id uuid)
RETURNS TABLE(tier text, allowance integer, used integer, unlimited boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; bal int; debited int;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM _user_id THEN RAISE EXCEPTION 'not allowed'; END IF;
  SELECT * INTO b FROM public.credit_base(_user_id);
  SELECT coalesce(sum(delta),0)::int INTO bal FROM public.credit_ledger WHERE user_id = _user_id AND environment = 'live';
  SELECT coalesce(-sum(delta),0)::int INTO debited FROM public.credit_ledger WHERE user_id = _user_id AND environment = 'live' AND delta < 0 AND created_at >= date_trunc('month', now());
  RETURN QUERY SELECT b.tier, b.base + greatest(bal,0) + debited,
    coalesce((SELECT sum(public.credit_cost(feature))::int FROM public.ai_usage WHERE user_id = _user_id AND created_at >= date_trunc('month', now())), 0),
    b.unlimited;
END $$;
CREATE OR REPLACE FUNCTION public.debit_purchased_credits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; used int; debited int; bal int; over int;
BEGIN
  SELECT * INTO b FROM public.credit_base(NEW.user_id);
  IF b.unlimited THEN RETURN NEW; END IF;
  SELECT coalesce(sum(public.credit_cost(feature)),0)::int INTO used FROM public.ai_usage WHERE user_id = NEW.user_id AND created_at >= date_trunc('month', now());
  SELECT coalesce(-sum(delta),0)::int INTO debited FROM public.credit_ledger WHERE user_id = NEW.user_id AND environment = 'live' AND delta < 0 AND created_at >= date_trunc('month', now());
  SELECT coalesce(sum(delta),0)::int INTO bal FROM public.credit_ledger WHERE user_id = NEW.user_id AND environment = 'live';
  over := least(public.credit_cost(NEW.feature), used - b.base - debited, bal);
  IF over > 0 THEN INSERT INTO public.credit_ledger(user_id, delta, reason, environment) VALUES (NEW.user_id, -over, 'usage:' || NEW.feature, 'live'); END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.my_credit_balance()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT greatest(coalesce(sum(delta),0),0)::int FROM public.credit_ledger WHERE user_id = auth.uid() AND environment = 'live';
$$;