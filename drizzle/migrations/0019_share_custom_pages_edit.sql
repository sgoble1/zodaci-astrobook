DROP POLICY IF EXISTS "owners or admin edit pages" ON public.custom_pages;
CREATE POLICY "owners, admin or shared members edit pages" ON public.custom_pages FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.is_shared_space_member())
WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.is_shared_space_member());