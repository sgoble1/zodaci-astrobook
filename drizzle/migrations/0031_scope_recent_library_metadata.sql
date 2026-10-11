CREATE OR REPLACE FUNCTION public.recent_library_items()
RETURNS TABLE(id uuid, kind text, title text, description text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
SELECT li.id, li.kind, li.title, li.description, li.created_at
FROM public.library_items li
WHERE auth.uid() IS NOT NULL
AND coalesce(li.category, '') NOT LIKE 'Relationship%'
AND (li.owner_id = auth.uid()
 OR (li.shared_with_space AND public.is_shared_space_member())
 OR (li.workspace_id IS NOT NULL AND public.is_space_member(li.workspace_id)))
ORDER BY li.created_at DESC LIMIT 30
$$;
REVOKE ALL ON FUNCTION public.recent_library_items() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recent_library_items() TO anon, authenticated, service_role;