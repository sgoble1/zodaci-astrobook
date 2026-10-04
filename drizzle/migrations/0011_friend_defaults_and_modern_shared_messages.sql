ALTER TABLE public.relationships ALTER COLUMN relation SET DEFAULT 'Friend';

ALTER TABLE public.shared_messages ADD COLUMN reply_to_id uuid REFERENCES public.shared_messages(id) ON DELETE SET NULL;

CREATE TABLE public.shared_message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.shared_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  emoji text NOT NULL CHECK (emoji IN ('❤️', '👍', '✨', '😂')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
GRANT SELECT, INSERT, DELETE ON public.shared_message_reactions TO authenticated;
GRANT ALL ON public.shared_message_reactions TO service_role;
ALTER TABLE public.shared_message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared members read reactions" ON public.shared_message_reactions FOR SELECT TO authenticated USING (public.is_shared_space_member());
CREATE POLICY "shared members add reactions" ON public.shared_message_reactions FOR INSERT TO authenticated WITH CHECK (public.is_shared_space_member() AND user_id = auth.uid());
CREATE POLICY "members remove own reactions" ON public.shared_message_reactions FOR DELETE TO authenticated USING (public.is_shared_space_member() AND user_id = auth.uid());
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_message_reactions;