CREATE TABLE public.book_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 edition text NOT NULL DEFAULT 'standard' CHECK (edition IN ('standard','expanded')),
 base_price_cents integer NOT NULL DEFAULT 4500, extra_sections jsonb NOT NULL DEFAULT '[]',
 cover_path text, cover_style text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','quote_requested','awaiting_payment','paid','printing','shipped','delivered','canceled')),
 shipping_address jsonb NOT NULL DEFAULT '{}', carrier text NOT NULL DEFAULT '', tracking_number text NOT NULL DEFAULT '',
 shipping_cents integer, extras_cents integer, admin_note text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.book_orders TO authenticated;
GRANT ALL ON public.book_orders TO service_role;
ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own orders admins read all" ON public.book_orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Members create drafts" ON public.book_orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status IN ('draft','quote_requested') AND shipping_cents IS NULL AND extras_cents IS NULL AND admin_note = '' AND tracking_number = '' AND base_price_cents = CASE WHEN edition = 'expanded' THEN 8000 ELSE 4500 END AND jsonb_array_length(extra_sections) <= 2 AND shipping_address->>'country' = 'US');
CREATE POLICY "Admins manage orders" ON public.book_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.blog_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL, author_name text NOT NULL,
 title text NOT NULL CHECK (length(title) BETWEEN 3 AND 180), body text NOT NULL CHECK (length(body) BETWEEN 20 AND 30000),
 published boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read published posts or own drafts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published OR author_id = auth.uid());
CREATE POLICY "Subscribers create own posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND public.has_paid_plan(auth.uid()));
CREATE POLICY "Subscribers edit own posts" ON public.blog_posts FOR UPDATE TO authenticated USING (author_id = auth.uid() AND public.has_paid_plan(auth.uid())) WITH CHECK (author_id = auth.uid() AND public.has_paid_plan(auth.uid()));
CREATE POLICY "Authors delete own posts" ON public.blog_posts FOR DELETE TO authenticated USING (author_id = auth.uid());
CREATE TABLE public.ai_access_pauses (
 scope text PRIMARY KEY, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_access_pauses TO service_role;
ALTER TABLE public.ai_access_pauses ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS generated_starter_unique ON public.generated_pages(owner_id,page_key) WHERE page_key LIKE 'starter-%';
CREATE OR REPLACE FUNCTION public.request_book_quote(_order_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 UPDATE public.book_orders SET status = 'quote_requested', updated_at = now() WHERE id = _order_id AND user_id = auth.uid() AND status = 'draft';
 IF NOT FOUND THEN RAISE EXCEPTION 'Draft order not available'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.request_book_quote(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_book_quote(uuid) TO authenticated;