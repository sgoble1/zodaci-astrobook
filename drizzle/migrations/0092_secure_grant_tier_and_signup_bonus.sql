REVOKE EXECUTE ON FUNCTION public.active_grant_tier(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.active_grant_tier(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_signup_bonus()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); joined timestamptz;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;
  SELECT u.created_at INTO joined FROM auth.users u WHERE u.id = uid;
  IF joined IS NULL OR joined < now() - interval '14 days' OR joined > now() THEN RETURN 0; END IF;
  INSERT INTO public.credit_grants (user_id, amount, reason, note, expires_at)
    VALUES (uid, 10, 'signup_bonus', 'Welcome bonus', now() + interval '30 days')
    ON CONFLICT (user_id) WHERE reason = 'signup_bonus' DO NOTHING;
  IF FOUND THEN RETURN 10; END IF;
  RETURN 0;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_signup_bonus() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_signup_bonus() TO authenticated, service_role;