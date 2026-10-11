CREATE TABLE public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.billing_subscriptions TO authenticated;
GRANT ALL ON public.billing_subscriptions TO service_role;
CREATE INDEX idx_billing_subs_user ON public.billing_subscriptions(user_id);
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own subscriptions readable" ON public.billing_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read subscriptions" ON public.billing_subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live')
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.billing_subscriptions WHERE user_id = user_uuid AND environment = check_env
    AND ((status IN ('active','trialing','past_due') AND (current_period_end IS NULL OR current_period_end > now()))
      OR (status = 'canceled' AND current_period_end > now())));
$$;
COMMENT ON TABLE public.subscriptions IS 'DEPRECATED: replaced by billing_subscriptions';
ALTER PUBLICATION supabase_realtime ADD TABLE public.billing_subscriptions;