CREATE TABLE public.lulu_print_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.book_orders(id) ON DELETE CASCADE,
  environment text NOT NULL CHECK (environment IN ('sandbox','production')),
  lulu_job_id bigint,
  pod_package_id text NOT NULL,
  page_count integer NOT NULL CHECK (page_count > 0),
  shipping_level text NOT NULL,
  status text NOT NULL DEFAULT 'SUBMITTING',
  status_message text NOT NULL DEFAULT '',
  total_cost_cents integer,
  currency text,
  tracking_id text NOT NULL DEFAULT '',
  tracking_url text NOT NULL DEFAULT '',
  carrier_name text NOT NULL DEFAULT '',
  arrival_min date,
  arrival_max date,
  interior_path text,
  cover_path text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (environment, lulu_job_id)
);

GRANT SELECT ON public.lulu_print_jobs TO authenticated;
GRANT ALL ON public.lulu_print_jobs TO service_role;

ALTER TABLE public.lulu_print_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read Lulu print jobs" ON public.lulu_print_jobs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- One live (non-failed) Lulu job per order and environment; a failed, rejected or cancelled job can be retried.
CREATE UNIQUE INDEX lulu_print_jobs_one_active ON public.lulu_print_jobs (order_id, environment)
  WHERE status NOT IN ('FAILED','REJECTED','CANCELED','ERROR');
CREATE INDEX lulu_print_jobs_order ON public.lulu_print_jobs (order_id, created_at DESC);