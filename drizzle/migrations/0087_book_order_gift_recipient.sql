ALTER TABLE public.book_orders
  ADD COLUMN IF NOT EXISTS recipient_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_birth jsonb,
  ADD COLUMN IF NOT EXISTS recipient_notified_at timestamptz;

COMMENT ON COLUMN public.book_orders.recipient_birth IS 'Birth facts of the gift recipient the book was written from (never copied to the buyer profile).';

CREATE OR REPLACE FUNCTION public.validate_book_order_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ BEGIN
 IF NEW.checkout_session_id IS NOT NULL OR NEW.payment_total_cents IS NOT NULL THEN RAISE EXCEPTION 'Payment confirmation is server managed'; END IF;
 IF NEW.user_id <> auth.uid() AND current_user <> 'service_role' AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
 IF NEW.recipient_notified_at IS NOT NULL AND current_user <> 'service_role' THEN RAISE EXCEPTION 'Gift notices are server managed'; END IF;
 IF length(NEW.gift_message) > 500 THEN RAISE EXCEPTION 'Gift message is too long'; END IF;
 IF length(NEW.recipient_name) > 80 THEN RAISE EXCEPTION 'Recipient name is too long'; END IF;
 IF NEW.recipient_email <> '' AND (length(NEW.recipient_email) > 254 OR NEW.recipient_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') THEN RAISE EXCEPTION 'Recipient email is not valid'; END IF;
 IF NEW.recipient_birth IS NOT NULL THEN
   IF NOT NEW.gift THEN RAISE EXCEPTION 'A book written for someone else must be marked as a gift'; END IF;
   IF NEW.recipient_name = '' THEN RAISE EXCEPTION 'Recipient name is required'; END IF;
   IF jsonb_typeof(NEW.recipient_birth) <> 'object' OR (NEW.recipient_birth->>'date') !~ '^\d{4}-\d{2}-\d{2}$'
      OR jsonb_typeof(NEW.recipient_birth->'lat') <> 'number' OR jsonb_typeof(NEW.recipient_birth->'lon') <> 'number'
      OR coalesce(NEW.recipient_birth->>'tz','') = '' THEN RAISE EXCEPTION 'Recipient birth details are incomplete'; END IF;
   IF jsonb_array_length(NEW.extra_sections) > 0 THEN RAISE EXCEPTION 'Extra sections come from your own readings, so they cannot be added to a gift for someone else'; END IF;
 ELSIF NEW.recipient_email <> '' AND NOT NEW.gift THEN RAISE EXCEPTION 'Recipient email is only used for gifts';
 END IF;
 RETURN NEW; END $function$;

-- Recipients see gifts addressed to their verified sign-in email once paid (limited fields, no addresses or payment data).
CREATE OR REPLACE FUNCTION public.my_received_gifts()
 RETURNS TABLE(id uuid, edition text, format text, status text, gift_message text, recipient_name text, sender_name text, pdf_ready boolean, created_at timestamptz)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT o.id, o.edition, o.format, o.status, o.gift_message, o.recipient_name,
         coalesce(nullif(p.display_name, ''), 'A friend') AS sender_name,
         o.final_pdf_path IS NOT NULL AS pdf_ready, o.created_at
  FROM public.book_orders o
  LEFT JOIN public.profiles p ON p.id = o.user_id
  WHERE o.gift
    AND o.recipient_email <> ''
    AND auth.uid() IS NOT NULL
    AND lower(o.recipient_email) = lower(coalesce((SELECT u.email FROM auth.users u WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL), ''))
    AND o.status IN ('paid','print_brief_sent','printing','quality_check','shipped','delivered')
    AND o.payment_total_cents IS NOT NULL
    AND o.payment_hold IS NULL
  ORDER BY o.created_at DESC
$$;
REVOKE ALL ON FUNCTION public.my_received_gifts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_received_gifts() TO authenticated;