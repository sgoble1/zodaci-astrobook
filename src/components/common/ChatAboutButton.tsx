import { BookOpen, Brain, MessageCircle, Telescope } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useSession } from '@/hooks/useLibrary';
import { shareToChat } from '@/components/shared/SharedExtras';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const MEMBERS = new Set(['shanealecompte@gmail.com', 'shanegoble@gmail.com', 'babybluepuppet@gmail.com']);

/** Opens the current page in the user's chosen conversation. */
export function ChatAboutButton({ path: fixed, label, compact }: { path?: string; label?: string; compact?: boolean }) {
  const session = useSession(); const nav = useNavigate(); const { pathname, hash } = useLocation();
  if (!session) return null;
  const path = fixed ?? pathname + hash;
  const context = () => {
    const title = label || document.querySelector('main h1')?.textContent?.trim() || document.title;
    return `I want to talk about “${title}” — ${window.location.origin}${path}`;
  };
  const goShared = async () => {
    try {
      await shareToChat(`💬 ${context()}`);
      toast.success('Added to your conversation', { action: { label: 'Open chat', onClick: () => nav('/shared/conversations') } });
    } catch (e) { toast.error((e as Error).message); }
  };
  const go = (to: string) => nav(`${to}?q=${encodeURIComponent(context())}`);
  const approvedSharedMember = MEMBERS.has(session.user.email?.toLowerCase() ?? '');
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button type="button" variant={compact ? 'link' : 'outline'} size="sm" className={compact ? 'h-auto p-0 text-xs' : 'w-full justify-start text-xs'}><MessageCircle className="h-3.5 w-3.5" />Chat about this{compact ? '' : ' page'}</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-64">
      <DropdownMenuLabel>Who would you like to talk with?</DropdownMenuLabel>
      {approvedSharedMember && <DropdownMenuItem onSelect={goShared}><MessageCircle className="mr-2 h-4 w-4" />April &amp; Shane</DropdownMenuItem>}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => go('/workbook/companion')}><Brain className="mr-2 h-4 w-4" />The Therapy Oracle</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => go('/chat')}><Telescope className="mr-2 h-4 w-4" />SmartChat</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => go('/ask')}><BookOpen className="mr-2 h-4 w-4" />Ask the Sources</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
