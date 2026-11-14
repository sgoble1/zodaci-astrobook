CREATE OR REPLACE FUNCTION public.guard_book_gift()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user <> 'service_role' THEN
    IF NEW.recipient_notified_at IS DISTINCT FROM OLD.recipient_notified_at THEN RAISE EXCEPTION 'Gift notices are server managed'; END IF;
    IF OLD.checkout_session_id IS NOT NULL AND (NEW.recipient_birth IS DISTINCT FROM OLD.recipient_birth OR NEW.recipient_name IS DISTINCT FROM OLD.recipient_name OR NEW.recipient_email IS DISTINCT FROM OLD.recipient_email OR NEW.gift_message IS DISTINCT FROM OLD.gift_message OR NEW.gift IS DISTINCT FROM OLD.gift) THEN
      RAISE EXCEPTION 'Submitted gift details are locked';
    END IF;
  END IF;
  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS book_gift_guard ON public.book_orders;
CREATE TRIGGER book_gift_guard BEFORE UPDATE ON public.book_orders FOR EACH ROW EXECUTE FUNCTION public.guard_book_gift();