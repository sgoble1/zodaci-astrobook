CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  topic text NOT NULL DEFAULT 'general',
  source_path text NOT NULL DEFAULT '/welcome',
  sender_id uuid,
  handled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT, SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    handled_at IS NULL
    AND (sender_id IS NULL OR sender_id = auth.uid())
    AND length(btrim(name)) BETWEEN 1 AND 120
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
    AND length(btrim(message)) BETWEEN 10 AND 4000
    AND topic IN ('general', 'astrobook', 'astrocomic', 'shop', 'press', 'support')
    AND length(source_path) <= 200
  );

CREATE POLICY "Admins read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins mark contact messages handled"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX contact_messages_created_idx ON public.contact_messages (created_at DESC);

-- Throttle: at most 5 messages per email per hour, so the open form can't be used to flood the inbox.
CREATE OR REPLACE FUNCTION public.throttle_contact_messages()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.contact_messages
      WHERE lower(email) = lower(NEW.email) AND created_at > now() - interval '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Too many messages from this address. Please try again in an hour.' USING ERRCODE = '54000';
  END IF;
  NEW.email := lower(btrim(NEW.email));
  NEW.name := btrim(NEW.name);
  NEW.message := btrim(NEW.message);
  RETURN NEW;
END $$;

CREATE TRIGGER contact_messages_throttle BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.throttle_contact_messages();