CREATE OR REPLACE FUNCTION public.recent_library_items()
RETURNS TABLE(id uuid, kind text, title text, description text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, kind, title, description, created_at FROM public.library_items
  WHERE coalesce(category,'') NOT LIKE 'Relationship%'
  ORDER BY created_at DESC LIMIT 30
$$;
REVOKE ALL ON FUNCTION public.recent_library_items() FROM public;
GRANT EXECUTE ON FUNCTION public.recent_library_items() TO anon, authenticated;