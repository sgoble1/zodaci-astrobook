ALTER TABLE public.dream_entries
  ADD COLUMN IF NOT EXISTS dream_time time NOT NULL DEFAULT '03:00';
