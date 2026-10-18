ALTER TABLE public.book_orders ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'print';
ALTER TABLE public.book_orders ADD CONSTRAINT book_orders_format_check CHECK (format IN ('print','digital'));

CREATE OR REPLACE FUNCTION public.guard_book_delivery()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
 IF current_user <> 'service_role' THEN
  IF TG_OP = 'INSERT' THEN
   IF NEW.final_pdf_path IS NOT NULL OR NEW.pdf_ready_at IS NOT NULL THEN RAISE EXCEPTION 'PDF delivery is server managed'; END IF;
  ELSE
   IF NEW.final_pdf_path IS DISTINCT FROM OLD.final_pdf_path OR NEW.pdf_ready_at IS DISTINCT FROM OLD.pdf_ready_at THEN RAISE EXCEPTION 'PDF delivery is server managed'; END IF;
   IF OLD.checkout_session_id IS NOT NULL AND (NEW.manuscript_path IS DISTINCT FROM OLD.manuscript_path OR NEW.manuscript_pages IS DISTINCT FROM OLD.manuscript_pages OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.edition IS DISTINCT FROM OLD.edition OR NEW.cover_path IS DISTINCT FROM OLD.cover_path OR NEW.extra_sections IS DISTINCT FROM OLD.extra_sections OR NEW.format IS DISTINCT FROM OLD.format) THEN RAISE EXCEPTION 'Submitted book contents are locked'; END IF;
   IF NEW.status = 'paid' AND OLD.status NOT IN ('paid','printing','shipped','delivered') THEN RAISE EXCEPTION 'Payment confirmation is server managed'; END IF;
  END IF;
 END IF;
 IF NEW.format = 'digital' AND NEW.status IN ('printing','shipped','delivered') THEN RAISE EXCEPTION 'Digital AstroBooks are downloaded, not shipped'; END IF;
 IF NEW.status IN ('shipped','delivered') THEN
  IF TG_OP = 'INSERT' THEN RAISE EXCEPTION 'Only paid orders can be shipped'; END IF;
  IF OLD.status NOT IN ('paid','printing','shipped','delivered') OR NEW.payment_total_cents IS NULL THEN RAISE EXCEPTION 'Only paid orders can be shipped'; END IF;
  IF NEW.carrier NOT IN ('USPS','UPS','FedEx') OR trim(NEW.tracking_number) = '' THEN RAISE EXCEPTION 'Add a supported carrier and tracking number before dispatch'; END IF;
 END IF;
 RETURN NEW;
END $function$;