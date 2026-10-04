CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own convos select" ON public.chat_conversations FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own convos insert" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own convos update" ON public.chat_conversations FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own convos delete" ON public.chat_conversations FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  role text NOT NULL,
  content text NOT NULL DEFAULT '',
  passages jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_conv_idx ON public.chat_messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own msgs select" ON public.chat_messages FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own msgs insert" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND c.owner_id = auth.uid()));
CREATE POLICY "own msgs delete" ON public.chat_messages FOR DELETE TO authenticated USING (owner_id = auth.uid());