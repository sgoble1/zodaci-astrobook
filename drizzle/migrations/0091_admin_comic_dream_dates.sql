CREATE OR REPLACE FUNCTION public.admin_comic_dream_dates(_user_ids uuid[])
RETURNS TABLE(user_id uuid, dream_date date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.user_id, d.dream_date FROM public.dream_entries d
  WHERE public.has_role(auth.uid(), 'admin') AND d.use_in_comic AND d.user_id = ANY(_user_ids)
  ORDER BY d.dream_date DESC
$$;
REVOKE ALL ON FUNCTION public.admin_comic_dream_dates(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_comic_dream_dates(uuid[]) TO authenticated;