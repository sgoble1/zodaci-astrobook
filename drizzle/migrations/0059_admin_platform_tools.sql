-- Member emails for admin views (manifests, member details). Admin only.
CREATE OR REPLACE FUNCTION public.admin_member_emails(_ids uuid[]) RETURNS TABLE(id uuid, email text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF cardinality(_ids) > 500 THEN RAISE EXCEPTION 'too many ids'; END IF;
  RETURN QUERY SELECT u.id, u.email::text FROM auth.users u WHERE u.id = ANY(_ids);
END $$;
REVOKE ALL ON FUNCTION public.admin_member_emails(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_member_emails(uuid[]) TO authenticated;

-- Admin management: list, grant and revoke (self-revoke blocked, every change audited).
CREATE OR REPLACE FUNCTION public.admin_list_admins() RETURNS TABLE(user_id uuid, email text, display_name text, joined timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT r.user_id, u.email::text, coalesce(p.display_name, ''), u.created_at
    FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id LEFT JOIN public.profiles p ON p.id = r.user_id
    WHERE r.role = 'admin' ORDER BY u.created_at;
END $$;
REVOKE ALL ON FUNCTION public.admin_list_admins() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_admins() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_admin(_email text, _grant boolean, _note text DEFAULT '') RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); target uuid;
BEGIN
  IF NOT public.has_role(uid, 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  SELECT id INTO target FROM auth.users WHERE lower(email) = lower(trim(coalesce(_email, ''))) LIMIT 1;
  IF target IS NULL THEN RETURN 'no_account'; END IF;
  IF NOT _grant AND target = uid THEN RETURN 'self'; END IF;
  IF _grant THEN
    IF public.has_role(target, 'admin') THEN RETURN 'already'; END IF;
    INSERT INTO public.user_roles (user_id, role) VALUES (target, 'admin');
  ELSE
    IF NOT public.has_role(target, 'admin') THEN RETURN 'not_admin'; END IF;
    DELETE FROM public.user_roles WHERE user_id = target AND role = 'admin';
  END IF;
  INSERT INTO public.audit_log (admin_id, action, target_table, target_id, summary, after)
    VALUES (uid, CASE WHEN _grant THEN 'admin.grant' ELSE 'admin.revoke' END, 'user_roles', target::text,
      left(format('%s admin access for %s', CASE WHEN _grant THEN 'Granted' ELSE 'Revoked' END, lower(trim(_email))), 500),
      jsonb_build_object('email', lower(trim(_email)), 'note', left(coalesce(_note, ''), 300)));
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.admin_set_admin(text, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_admin(text, boolean, text) TO authenticated;

-- Audit trail for admin edits (service and member writes are not admin actions and are not logged here).
CREATE OR REPLACE FUNCTION public.audit_admin_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); b jsonb; a jsonb; tid text; summary text;
BEGIN
  IF uid IS NULL OR NOT public.has_role(uid, 'admin') THEN RETURN coalesce(NEW, OLD); END IF;
  IF TG_OP <> 'INSERT' THEN b := to_jsonb(OLD) - 'content' - 'script' - 'body_md' - 'sections' - 'chart' - 'updated_at'; END IF;
  IF TG_OP <> 'DELETE' THEN a := to_jsonb(NEW) - 'content' - 'script' - 'body_md' - 'sections' - 'chart' - 'updated_at'; END IF;
  IF TG_OP = 'UPDATE' AND b = a THEN RETURN NEW; END IF;
  tid := coalesce(a->>'id', b->>'id', a->>'key', b->>'key', a->>'edition', b->>'edition', '');
  summary := format('%s %s', lower(TG_OP), TG_TABLE_NAME);
  IF TG_OP = 'UPDATE' AND (b->>'status') IS DISTINCT FROM (a->>'status') THEN summary := summary || format(': status %s → %s', b->>'status', a->>'status'); END IF;
  INSERT INTO public.audit_log (admin_id, action, target_table, target_id, summary, before, after)
    VALUES (uid, TG_TABLE_NAME || '.' || lower(TG_OP), TG_TABLE_NAME, left(tid, 120), left(summary, 500), b, a);
  RETURN coalesce(NEW, OLD);
END $$;
REVOKE ALL ON FUNCTION public.audit_admin_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER audit_book_orders AFTER UPDATE ON public.book_orders FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_book_costing AFTER INSERT OR UPDATE ON public.book_costing FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_comic_issues AFTER INSERT OR UPDATE ON public.comic_issues FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_comic_print_runs AFTER INSERT OR UPDATE ON public.comic_print_runs FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_comic_subscriptions AFTER UPDATE ON public.comic_subscriptions FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_newsletter_campaigns AFTER INSERT OR UPDATE OR DELETE ON public.newsletter_campaigns FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_platform_settings AFTER INSERT OR UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_marketing_pages AFTER INSERT OR UPDATE OR DELETE ON public.marketing_pages FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();
CREATE TRIGGER audit_generated_pages AFTER UPDATE OR DELETE ON public.generated_pages FOR EACH ROW EXECUTE FUNCTION public.audit_admin_change();

-- April's account monitor: activity metadata, counts and usage only. Never message, answer or reading text.
CREATE OR REPLACE FUNCTION public.monitored_account_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM auth.users WHERE lower(email) = 'babybluepuppet@gmail.com' LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.monitored_account_id() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_april_overview() RETURNS TABLE(
  found boolean, display_name text, joined timestamptz, last_seen timestamptz, visits_30d integer, page_views_30d integer,
  minutes_30d integer, clicks_30d integer, media_30d integer, ai_uses_month integer, counselor_sessions integer,
  social_sessions integer, workbook_entries integer, readings_ready integer, readings_writing integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE a uuid := public.monitored_account_id();
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF a IS NULL THEN RETURN QUERY SELECT false, ''::text, NULL::timestamptz, NULL::timestamptz, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0; RETURN; END IF;
  RETURN QUERY SELECT true,
    coalesce((SELECT p.display_name FROM public.profiles p WHERE p.id = a), ''),
    (SELECT u.created_at FROM auth.users u WHERE u.id = a),
    (SELECT max(e.created_at) FROM public.activity_events e WHERE e.user_id = a),
    (SELECT count(DISTINCT e.visit_id)::int FROM public.activity_events e WHERE e.user_id = a AND e.created_at > now() - interval '30 days'),
    (SELECT count(*)::int FROM public.activity_events e WHERE e.user_id = a AND e.kind = 'page' AND e.created_at > now() - interval '30 days'),
    (SELECT (coalesce(sum(e.duration_seconds), 0) / 60)::int FROM public.activity_events e WHERE e.user_id = a AND e.created_at > now() - interval '30 days'),
    (SELECT count(*)::int FROM public.activity_events e WHERE e.user_id = a AND e.kind = 'click' AND e.created_at > now() - interval '30 days'),
    (SELECT count(*)::int FROM public.activity_events e WHERE e.user_id = a AND e.kind = 'media' AND e.created_at > now() - interval '30 days'),
    (SELECT count(*)::int FROM public.ai_usage x WHERE x.user_id = a AND x.created_at >= date_trunc('month', now())),
    (SELECT count(*)::int FROM public.therapy_sessions t WHERE t.owner_id = a),
    (SELECT count(*)::int FROM public.social_sessions s WHERE s.owner_id = a),
    (SELECT count(*)::int FROM public.workbook_entries w WHERE w.owner_id = a),
    (SELECT count(*)::int FROM public.generated_pages g WHERE g.owner_id = a AND g.status = 'ready'),
    (SELECT count(*)::int FROM public.topic_reading_jobs j WHERE j.owner_id = a AND j.status IN ('queued', 'running'));
END $$;
REVOKE ALL ON FUNCTION public.admin_april_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_april_overview() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_april_events(_limit integer DEFAULT 200, _kind text DEFAULT NULL)
RETURNS TABLE(created_at timestamptz, kind text, label text, path text, duration_seconds integer, device text, visit_id text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE a uuid := public.monitored_account_id();
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF a IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT e.created_at, e.kind, left(e.label, 120), e.path, e.duration_seconds, e.device, e.visit_id
    FROM public.activity_events e WHERE e.user_id = a AND (_kind IS NULL OR e.kind = _kind)
    ORDER BY e.created_at DESC LIMIT least(greatest(coalesce(_limit, 200), 1), 200);
END $$;
REVOKE ALL ON FUNCTION public.admin_april_events(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_april_events(integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_april_usage() RETURNS TABLE(feature text, uses integer, credits integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE a uuid := public.monitored_account_id();
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF a IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT x.feature, count(*)::int, sum(public.credit_cost(x.feature))::int
    FROM public.ai_usage x WHERE x.user_id = a AND x.created_at >= date_trunc('month', now())
    GROUP BY x.feature ORDER BY count(*) DESC;
END $$;
REVOKE ALL ON FUNCTION public.admin_april_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_april_usage() TO authenticated;

-- AstroComic print manifest: subscriber, delivery and birth data needed to build that month's issues.
CREATE OR REPLACE FUNCTION public.admin_comic_manifest() RETURNS TABLE(
  subscription_id uuid, user_id uuid, plan text, status text, environment text, created_at timestamptz, paused_until date, skip_months date[],
  current_period_end timestamptz, cancel_at_period_end boolean, shipping_address jsonb, email text, display_name text,
  birth_date date, birth_time text, lat double precision, lon double precision, tz text, place_label text, house_system text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT s.id, s.user_id, s.plan, s.status, s.environment, s.created_at, s.paused_until, s.skip_months,
    s.current_period_end, s.cancel_at_period_end, s.shipping_address, u.email::text, coalesce(p.display_name, ''),
    p.birth_date, p.birth_time::text, p.lat::double precision, p.lon::double precision, p.tz, p.place_label, p.house_system
    FROM public.comic_subscriptions s LEFT JOIN auth.users u ON u.id = s.user_id LEFT JOIN public.profiles p ON p.id = s.user_id
    WHERE s.status <> 'pending' ORDER BY s.created_at;
END $$;
REVOKE ALL ON FUNCTION public.admin_comic_manifest() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_comic_manifest() TO authenticated;