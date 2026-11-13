CREATE TABLE public.payment_webhook_events (
  event_id text PRIMARY KEY CHECK (char_length(event_id) <= 120),
  event_type text NOT NULL CHECK (char_length(event_type) <= 80),
  environment text NOT NULL CHECK (environment IN ('sandbox','live')),
  object_id text NOT NULL DEFAULT '' CHECK (char_length(object_id) <= 120),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','processed','failed')),
  attempts integer NOT NULL DEFAULT 1,
  last_error text NOT NULL DEFAULT '' CHECK (char_length(last_error) <= 500),
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.payment_webhook_events TO service_role;
CREATE INDEX payment_webhook_events_status_idx ON public.payment_webhook_events (status, received_at DESC);

CREATE OR REPLACE FUNCTION public.admin_payment_issues()
RETURNS TABLE (event_id text, event_type text, environment text, object_id text, status text, attempts integer, last_error text, received_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN QUERY SELECT e.event_id, e.event_type, e.environment, e.object_id, e.status, e.attempts, e.last_error, e.received_at
    FROM public.payment_webhook_events e
    WHERE e.status <> 'processed' AND e.received_at < now() - interval '2 minutes'
    ORDER BY e.received_at DESC LIMIT 100;
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_payment_issues() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_payment_issues() TO authenticated;