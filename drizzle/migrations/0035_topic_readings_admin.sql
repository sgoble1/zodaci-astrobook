CREATE POLICY "Members read own published topic readings" ON public.generated_pages FOR SELECT TO authenticated USING (owner_id = auth.uid() AND section = 'Topic Reading' AND status = 'ready');
CREATE POLICY "Admins read all generated pages" ON public.generated_pages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update generated pages" ON public.generated_pages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') AND status IN ('ready','hidden'));
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT, UPDATE ON public.generated_pages TO authenticated;