import { MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useSession } from '@/hooks/useLibrary';
import { shareToChat } from '@/components/shared/SharedExtras';

const MEMBERS = new Set(['shanealecompte@gmail.com', 'shanegoble@gmail.com', 'babybluepuppet@gmail.com']);

/** Drops a link to this content into the April & Shane conversation. Visible only to the two approved accounts. */
export function ChatAboutButton({ path: fixed, label, compact }: { path?: string; label?: string; compact?: boolean }) {
  const session = useSession(); const nav = useNavigate(); const { pathname, hash } = useLocation();
  if (!session || !MEMBERS.has(session.user.email?.toLowerCase() ?? '')) return null;
  const path = fixed ?? pathname + hash;
  const go = async () => {
    const title = label || document.querySelector('main h1')?.textContent?.trim() || document.title;
    try {
      await shareToChat(`💬 Let's talk about “${title}” — ${window.location.origin}${path}`);
      toast.success('Added to your conversation', { action: { label: 'Open chat', onClick: () => nav('/shared/conversations') } });
    } catch (e) { toast.error((e as Error).message); }
  };
  return compact
    ? <button type="button" onClick={go} className="inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"><MessageCircle className="h-3.5 w-3.5" />Chat about this</button>
    : <button type="button" onClick={go} className="flex w-full items-center gap-2 rounded border border-border px-3 py-1.5 text-xs hover:bg-muted/60"><MessageCircle className="h-3.5 w-3.5" />Chat about this page</button>;
}
