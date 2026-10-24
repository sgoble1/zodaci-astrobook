-- Official AstroBook section: which founder editions (Masterbook + AstroComic) each account may see.
-- Owners see only their own edition; admins see every edition.
CREATE TABLE public.official_editions (
  edition text PRIMARY KEY CHECK (edition IN ('april', 'shane', 'zac')),
  display_name text NOT NULL,
  owner_emails text[] NOT NULL DEFAULT '{}',
  birth jsonb NOT NULL DEFAULT '{}'::jsonb,
  birth_source text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.official_editions TO authenticated;
GRANT ALL ON public.official_editions TO service_role;

ALTER TABLE public.official_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read official editions" ON public.official_editions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update official editions" ON public.official_editions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.official_editions (edition, display_name, owner_emails, birth, birth_source, sort_order) VALUES
  ('april', 'April', ARRAY['babybluepuppet@gmail.com'], '{}'::jsonb, '', 1),
  ('shane', 'Shane', ARRAY['shanegoble@gmail.com', 'shanealecompte@gmail.com'], '{}'::jsonb, '', 2),
  ('zac', 'Zac', ARRAY[]::text[],
    '{"date":"1987-07-10","time":"12:08","lat":39.9567,"lon":-83.0144,"tz":"America/New_York","place_label":"Columbus, Ohio (Mount Carmel Medical Center)","house_system":"whole"}'::jsonb,
    'Volume I (confirmed birth time)', 3);

-- True when the signed-in account owns this edition (listed owner email, or granted in edition_access).
CREATE OR REPLACE FUNCTION public.owns_official_edition(_edition text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.official_editions e
            WHERE e.edition = _edition AND lower(coalesce(auth.jwt() ->> 'email', '')) = ANY (e.owner_emails))
    OR EXISTS (SELECT 1 FROM public.edition_access a
               WHERE a.edition = _edition AND a.email = lower(coalesce(auth.jwt() ->> 'email', ''))))
$$;

-- The editions this account may see in the Official section: its own, or all of them for admins.
-- Birth facts come from the owner's saved profile when present, otherwise from the edition's verified source.
CREATE OR REPLACE FUNCTION public.my_official_editions()
RETURNS TABLE (edition text, display_name text, is_own boolean, birth jsonb, birth_source text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH visible AS (
    SELECT e.* FROM public.official_editions e
    WHERE auth.uid() IS NOT NULL
      AND (public.has_role(auth.uid(), 'admin') OR public.owns_official_edition(e.edition))
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
$$;

REVOKE ALL ON FUNCTION public.owns_official_edition(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_official_editions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_official_edition(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_official_editions() TO authenticated;