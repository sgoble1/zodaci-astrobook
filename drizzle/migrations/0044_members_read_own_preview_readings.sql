CREATE POLICY "Members read own preview readings" ON public.generated_pages FOR SELECT TO authenticated
USING (owner_id = auth.uid() AND section = 'Topic Reading' AND status = 'preview');