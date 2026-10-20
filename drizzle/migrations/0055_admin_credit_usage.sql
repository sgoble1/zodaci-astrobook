CREATE OR REPLACE FUNCTION public.admin_credit_usage()
RETURNS TABLE(user_id uuid, display_name text, feature text, uses bigint, credits bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT u.user_id, coalesce(p.display_name, ''), u.feature, count(*), sum(public.credit_cost(u.feature))::bigint
    FROM public.ai_usage u LEFT JOIN public.profiles p ON p.id = u.user_id
    WHERE u.created_at >= date_trunc('month', now())
    GROUP BY u.user_id, p.display_name, u.feature ORDER BY 5 DESC LIMIT 500;
END $$;
REVOKE ALL ON FUNCTION public.admin_credit_usage() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_credit_usage() TO authenticated;