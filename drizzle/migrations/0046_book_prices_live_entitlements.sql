DROP POLICY "Members create drafts" ON public.book_orders;
CREATE POLICY "Members create drafts" ON public.book_orders FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND status IN ('draft','quote_requested') AND shipping_cents IS NULL AND extras_cents IS NULL AND admin_note='' AND tracking_number='' AND base_price_cents=CASE WHEN format='digital' THEN 1999 WHEN edition='expanded' THEN 8900 ELSE 5900 END AND jsonb_typeof(extra_sections)='array' AND jsonb_array_length(extra_sections)<=2 AND (format='digital' OR shipping_address->>'country'='US'));
CREATE OR REPLACE FUNCTION public.has_paid_plan(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_active_subscription(_user_id,'live') $$;
REVOKE ALL ON FUNCTION public.has_paid_plan(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_paid_plan(uuid) TO authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.book_orders TO authenticated;
GRANT ALL ON public.book_orders TO service_role;