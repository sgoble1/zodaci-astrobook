DROP POLICY IF EXISTS "Public discussion reads" ON public.community_posts;
CREATE POLICY "Members read discussions" ON public.community_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Public reply reads" ON public.community_replies;
CREATE POLICY "Members read replies" ON public.community_replies FOR SELECT TO authenticated USING (true);