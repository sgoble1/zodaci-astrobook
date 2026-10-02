DROP POLICY IF EXISTS "Anyone reads overrides" ON public.document_overrides;
CREATE POLICY "Admins read overrides" ON public.document_overrides FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.get_document_overrides()
RETURNS TABLE (doc_key text, title text, note text, hidden boolean, sort_order integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT doc_key, title, note, hidden, sort_order FROM public.document_overrides $$;
GRANT EXECUTE ON FUNCTION public.get_document_overrides() TO anon, authenticated;