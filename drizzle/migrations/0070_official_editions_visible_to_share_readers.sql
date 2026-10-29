-- People an owner shared the whole edition with may see that edition's card and birth facts (the book itself states them).
CREATE OR REPLACE FUNCTION public.my_official_editions()
 RETURNS TABLE(edition text, display_name text, is_own boolean, birth jsonb, birth_source text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH visible AS (
    SELECT e.* FROM public.official_editions e
    WHERE auth.uid() IS NOT NULL
      AND (public.has_role(auth.uid(), 'admin') OR public.can_open_edition(e.edition))
  ), saved AS (
    SELECT DISTINCT ON (v.edition) v.edition,
      jsonb_build_object('date', p.birth_date, 'time', p.birth_time, 'lat', p.lat, 'lon', p.lon, 'tz', p.tz,
                         'place_label', p.place_label, 'house_system', p.house_system) AS birth
    FROM visible v
    JOIN auth.users u ON lower(u.email) = ANY (v.owner_emails)
      OR lower(u.email) IN (SELECT a.email FROM public.edition_access a WHERE a.edition = v.edition)
    JOIN public.profiles p ON p.id = u.id
    WHERE p.birth_date IS NOT NULL AND p.lat IS NOT NULL AND p.lon IS NOT NULL
    ORDER BY v.edition, p.onboarded_at DESC NULLS LAST
  )
  SELECT v.edition, v.display_name, public.owns_official_edition(v.edition),
         coalesce(s.birth, nullif(v.birth, '{}'::jsonb)),
         CASE WHEN s.birth IS NOT NULL THEN 'Saved birth details' ELSE v.birth_source END
  FROM visible v LEFT JOIN saved s ON s.edition = v.edition
  ORDER BY v.sort_order
$function$;