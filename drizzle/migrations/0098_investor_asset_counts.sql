CREATE OR REPLACE FUNCTION public.investor_asset_counts()
RETURNS TABLE(area text, chapters integer, words integer, checked_at text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_view_investors() THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT a->>'area', (a->>'chapters')::int, (a->>'words')::int, s.value->>'checkedAt'
    FROM platform_settings s, jsonb_array_elements(s.value->'areas') a
    WHERE s.key = 'founder_audit_snapshot';
END $$;
REVOKE ALL ON FUNCTION public.investor_asset_counts() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.investor_asset_counts() TO authenticated;