-- Admins draft and print each subscriber's AstroComic, so they need to see which observatory character the member chose.
CREATE POLICY "admins read member characters"
ON public.member_characters
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));