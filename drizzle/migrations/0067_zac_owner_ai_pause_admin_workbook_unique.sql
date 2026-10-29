-- Zac's own sign-in email is a canonical owner of his official edition (edition_access already grants it).
UPDATE public.official_editions
SET owner_emails = ARRAY['shanealecomptegoble@gmail.com'], updated_at = now()
WHERE edition = 'zac' AND NOT ('shanealecomptegoble@gmail.com' = ANY (owner_emails));

-- One saved answer per question in Zac's workbook, so quick edits can never create duplicate rows.
CREATE UNIQUE INDEX IF NOT EXISTS workbook_entries_zac_one_answer
  ON public.workbook_entries (owner_id, kind, prompt_key)
  WHERE kind = 'zac-workbook';

-- Admins can see and clear an automatic AI pause (set when the AI provider reports billing or rate limits).
CREATE OR REPLACE FUNCTION public.admin_ai_pauses()
RETURNS TABLE(scope text, message text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT p.scope, p.message, p.created_at FROM public.ai_access_pauses p ORDER BY p.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_clear_ai_pause(_scope text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE removed record;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;
  IF _scope IS NULL OR length(_scope) = 0 OR length(_scope) > 60 THEN
    RAISE EXCEPTION 'Choose which pause to clear' USING ERRCODE = '22023';
  END IF;
  DELETE FROM public.ai_access_pauses WHERE scope = _scope RETURNING * INTO removed;
  IF removed.scope IS NULL THEN RETURN false; END IF;
  INSERT INTO public.audit_log (admin_id, action, target_table, target_id, summary, before, after)
  VALUES (auth.uid(), 'delete', 'ai_access_pauses', _scope, 'Cleared the automatic AI pause', to_jsonb(removed), NULL);
  RETURN true;
END $$;

REVOKE ALL ON FUNCTION public.admin_ai_pauses() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_clear_ai_pause(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_ai_pauses() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_clear_ai_pause(text) TO authenticated;