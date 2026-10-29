-- Private Masterbooks open by account only: the edition's owner, or people the owner shared the whole
-- edition or a single chapter with. Passwords and device unlock tokens are retired.
CREATE TABLE public.edition_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition text NOT NULL CHECK (edition IN ('april', 'shane', 'zac')),
  scope text NOT NULL CHECK (scope IN ('edition', 'chapter')),
  area text,
  chapter_id text,
  chapter_title text NOT NULL DEFAULT '',
  recipient_email text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT edition_shares_shape CHECK (
    (scope = 'edition' AND area IS NULL AND chapter_id IS NULL)
    OR (scope = 'chapter' AND chapter_id ~ '^[A-Za-z0-9._-]{1,120}$'
        AND ((area = 'masterbook' AND edition = 'april') OR (area = 'shane' AND edition = 'shane') OR (area = 'zac' AND edition = 'zac')))
  ),
  CONSTRAINT edition_shares_email CHECK (recipient_email = lower(recipient_email) AND recipient_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' AND length(recipient_email) <= 254),
  CONSTRAINT edition_shares_title CHECK (length(chapter_title) <= 300)
);
CREATE UNIQUE INDEX edition_shares_unique ON public.edition_shares (edition, recipient_email, coalesce(area, ''), coalesce(chapter_id, ''));
CREATE INDEX edition_shares_recipient_idx ON public.edition_shares (recipient_email);

GRANT SELECT ON public.edition_shares TO authenticated;
GRANT ALL ON public.edition_shares TO service_role;
ALTER TABLE public.edition_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and recipients see their shares"
  ON public.edition_shares FOR SELECT TO authenticated
  USING (recipient_email = lower(coalesce(auth.jwt() ->> 'email', '')) OR public.owns_official_edition(edition));

CREATE OR REPLACE FUNCTION public.edition_of_area(_area text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public
AS $$ SELECT CASE _area WHEN 'masterbook' THEN 'april' WHEN 'library' THEN 'april' WHEN 'shane' THEN 'shane' WHEN 'zac' THEN 'zac' END $$;

-- Whole edition: owner or an edition-wide share addressed to the signed-in email.
CREATE OR REPLACE FUNCTION public.can_open_edition(_edition text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.owns_official_edition(_edition)
    OR EXISTS (SELECT 1 FROM public.edition_shares s
               WHERE s.edition = _edition AND s.scope = 'edition'
                 AND s.recipient_email = lower(coalesce(auth.jwt() ->> 'email', ''))))
$$;

-- One chapter: whole-edition access, or a chapter share for exactly this chapter.
CREATE OR REPLACE FUNCTION public.can_open_chapter(_area text, _chapter text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.can_open_edition(public.edition_of_area(_area))
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.edition_shares s
      WHERE s.scope = 'chapter' AND s.area = _area AND s.chapter_id = _chapter
        AND s.recipient_email = lower(coalesce(auth.jwt() ->> 'email', ''))))
$$;

-- Chapter ids shared individually with the signed-in email in one area (used to filter the chapter list).
CREATE OR REPLACE FUNCTION public.my_shared_chapters(_area text)
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.chapter_id FROM public.edition_shares s
  WHERE auth.uid() IS NOT NULL AND s.scope = 'chapter' AND s.area = _area
    AND s.recipient_email = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

-- Existing access checks now follow ownership + shares (no admin override, no passwords).
CREATE OR REPLACE FUNCTION public.can_read_shane_edition()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.can_open_edition('shane') $$;
CREATE OR REPLACE FUNCTION public.can_read_zac_edition()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.can_open_edition('zac') $$;

-- Every email that owns an edition (canonical owners plus admin-assigned edition_access).
CREATE OR REPLACE FUNCTION public.edition_owner_emails(_edition text)
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT coalesce(array_agg(DISTINCT x.email), '{}') FROM (
    SELECT lower(unnest(e.owner_emails)) AS email FROM public.official_editions e WHERE e.edition = _edition
    UNION SELECT lower(a.email) FROM public.edition_access a WHERE a.edition = _edition
  ) x
$$;
REVOKE ALL ON FUNCTION public.edition_owner_emails(text) FROM PUBLIC, anon, authenticated;

-- People an owner can pick by name (the other founders), without exposing their emails.
CREATE OR REPLACE FUNCTION public.edition_share_targets(_edition text)
RETURNS TABLE(target text, display_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.edition, e.display_name FROM public.official_editions e
  WHERE public.owns_official_edition(_edition) AND e.edition <> _edition
  ORDER BY e.sort_order
$$;

CREATE OR REPLACE FUNCTION public.share_edition(_edition text, _target text, _area text DEFAULT NULL, _chapter_id text DEFAULT NULL, _chapter_title text DEFAULT '')
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  me text := lower(coalesce(auth.jwt() ->> 'email', ''));
  t text := lower(btrim(coalesce(_target, '')));
  emails text[];
  n integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.owns_official_edition(_edition) THEN
    RAISE EXCEPTION 'Only the owner of this edition can share it.' USING ERRCODE = '42501';
  END IF;
  IF t IN ('april', 'shane', 'zac') THEN
    IF t = _edition THEN RAISE EXCEPTION 'This is already your own edition.' USING ERRCODE = '22023'; END IF;
    emails := public.edition_owner_emails(t);
  ELSIF t ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' AND length(t) <= 254 THEN
    emails := ARRAY[t];
  ELSE
    RAISE EXCEPTION 'Enter a valid email address.' USING ERRCODE = '22023';
  END IF;
  emails := array(SELECT e FROM unnest(emails) e WHERE e <> me AND NOT (e = ANY (public.edition_owner_emails(_edition))));
  IF coalesce(array_length(emails, 1), 0) = 0 THEN
    RAISE EXCEPTION 'That person already owns this edition, or has no email on file yet.' USING ERRCODE = '22023';
  END IF;
  IF _chapter_id IS NULL THEN
    INSERT INTO public.edition_shares (edition, scope, recipient_email, created_by)
    SELECT _edition, 'edition', e, auth.uid() FROM unnest(emails) e ON CONFLICT DO NOTHING;
  ELSE
    IF public.edition_of_area(_area) IS DISTINCT FROM _edition OR _area = 'library' THEN
      RAISE EXCEPTION 'That chapter is not part of this edition.' USING ERRCODE = '22023';
    END IF;
    INSERT INTO public.edition_shares (edition, scope, area, chapter_id, chapter_title, recipient_email, created_by)
    SELECT _edition, 'chapter', _area, _chapter_id, left(coalesce(_chapter_title, ''), 300), e, auth.uid() FROM unnest(emails) e ON CONFLICT DO NOTHING;
  END IF;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

-- The owner's view of who can read what, grouped by person (founders by name, others by email).
CREATE OR REPLACE FUNCTION public.my_edition_shares(_edition text)
RETURNS TABLE(recipient text, recipient_label text, scope text, area text, chapter_id text, chapter_title text, ids uuid[], created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH owned AS (SELECT public.owns_official_edition(_edition) AS ok),
  founders AS (
    SELECT e.edition AS key, e.display_name, unnest(public.edition_owner_emails(e.edition)) AS email FROM public.official_editions e
  )
  SELECT coalesce(f.key, s.recipient_email), coalesce(f.display_name, s.recipient_email), s.scope, s.area, s.chapter_id,
         max(s.chapter_title), array_agg(s.id ORDER BY s.created_at), min(s.created_at)
  FROM public.edition_shares s CROSS JOIN owned
  LEFT JOIN founders f ON f.email = s.recipient_email
  WHERE owned.ok AND s.edition = _edition
  GROUP BY coalesce(f.key, s.recipient_email), coalesce(f.display_name, s.recipient_email), s.scope, s.area, s.chapter_id
  ORDER BY s.scope DESC, min(s.created_at) DESC
$$;

CREATE OR REPLACE FUNCTION public.revoke_edition_shares(_ids uuid[])
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first.' USING ERRCODE = '42501'; END IF;
  DELETE FROM public.edition_shares s WHERE s.id = ANY (_ids) AND public.owns_official_edition(s.edition);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

-- What other people have shared with the signed-in account.
CREATE OR REPLACE FUNCTION public.shared_with_me()
RETURNS TABLE(edition text, owner_name text, scope text, area text, chapter_id text, chapter_title text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.edition, e.display_name, s.scope, s.area, s.chapter_id, s.chapter_title, s.created_at
  FROM public.edition_shares s JOIN public.official_editions e ON e.edition = s.edition
  WHERE auth.uid() IS NOT NULL AND s.recipient_email = lower(coalesce(auth.jwt() ->> 'email', ''))
    AND NOT public.owns_official_edition(s.edition)
  ORDER BY s.scope DESC, s.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.can_open_edition(text), public.can_open_chapter(text, text), public.my_shared_chapters(text),
  public.edition_share_targets(text), public.share_edition(text, text, text, text, text), public.my_edition_shares(text),
  public.revoke_edition_shares(uuid[]), public.shared_with_me() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_open_edition(text), public.can_open_chapter(text, text), public.my_shared_chapters(text),
  public.edition_share_targets(text), public.share_edition(text, text, text, text, text), public.my_edition_shares(text),
  public.revoke_edition_shares(uuid[]), public.shared_with_me(), public.edition_of_area(text) TO authenticated;

-- Keep today's access as ordinary, revocable shares: Shane can keep reading April's and Zac's editions until they revoke it.
INSERT INTO public.edition_shares (edition, scope, recipient_email)
SELECT ed, 'edition', em FROM unnest(ARRAY['april', 'zac']) ed CROSS JOIN unnest(ARRAY['shanegoble@gmail.com', 'shanealecompte@gmail.com']) em
ON CONFLICT DO NOTHING;
-- Shane's earlier "share with April" switch becomes an edition share.
INSERT INTO public.edition_shares (edition, scope, recipient_email)
SELECT 'shane', 'edition', lower(c.viewer_email) FROM public.chart_shares c
JOIN auth.users u ON u.id = c.owner_id
WHERE c.enabled AND lower(u.email) IN ('shanegoble@gmail.com', 'shanealecompte@gmail.com')
ON CONFLICT DO NOTHING;