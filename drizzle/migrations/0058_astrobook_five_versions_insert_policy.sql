DROP POLICY IF EXISTS "Members create drafts" ON public.book_orders;
CREATE POLICY "Members create drafts" ON public.book_orders FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND status IN ('draft','quote_requested')
  AND shipping_cents IS NULL AND extras_cents IS NULL AND admin_note = '' AND tracking_number = '' AND lulu_reference = ''
  AND edition IN ('digital','pocket','classic','signature','linen')
  AND base_price_cents = CASE edition WHEN 'digital' THEN 2499 WHEN 'pocket' THEN 3499 WHEN 'classic' THEN 5999 WHEN 'signature' THEN 9700 WHEN 'linen' THEN 14900 END
  AND jsonb_typeof(extra_sections) = 'array' AND jsonb_array_length(extra_sections) <= 2
  AND (format = 'digital' OR shipping_address->>'country' = 'US')
);
COMMENT ON POLICY "Members create drafts" ON public.book_orders IS 'New drafts use the five AstroBook versions; prices mirror src/lib/books.ts BOOK_VERSIONS. Legacy standard/expanded rows remain readable.';