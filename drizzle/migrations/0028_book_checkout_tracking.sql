ALTER TABLE public.book_orders ADD COLUMN checkout_session_id text, ADD COLUMN environment text NOT NULL DEFAULT 'sandbox', ADD COLUMN payment_total_cents integer;
CREATE UNIQUE INDEX book_order_checkout_unique ON public.book_orders(checkout_session_id) WHERE checkout_session_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.validate_book_order_insert() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
 IF NEW.checkout_session_id IS NOT NULL OR NEW.payment_total_cents IS NOT NULL THEN RAISE EXCEPTION 'Payment confirmation is server managed'; END IF;
 IF NEW.user_id <> auth.uid() AND current_user <> 'service_role' AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER book_order_insert_guard BEFORE INSERT ON public.book_orders FOR EACH ROW EXECUTE FUNCTION public.validate_book_order_insert();