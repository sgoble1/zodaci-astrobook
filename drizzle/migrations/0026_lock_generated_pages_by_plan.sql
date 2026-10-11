CREATE OR REPLACE FUNCTION public.has_paid_plan(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_active_subscription(_user_id, 'live') OR public.has_active_subscription(_user_id, 'sandbox')
$$;
DROP POLICY IF EXISTS "own pages all" ON public.generated_pages;
CREATE POLICY "Subscribers read own pages" ON public.generated_pages FOR SELECT TO authenticated
  USING (owner_id = auth.uid() AND public.has_paid_plan(auth.uid()));
CREATE POLICY "Owners delete own pages" ON public.generated_pages FOR DELETE TO authenticated
  USING (owner_id = auth.uid());
GRANT ALL ON public.generated_pages TO service_role;