import { BookOpen, Brain, CircleHelp, MessageCircle, Telescope, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useSession } from '@/hooks/useLibrary';
import { shareToChat } from '@/components/shared/SharedExtras';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const MEMBERS = new Set(['shanealecompte@gmail.com', 'shanegoble@gmail.com', 'babybluepuppet@gmail.com']);

/** Opens the current page in the user's chosen conversation. */
export function ChatAboutButton({ path: fixed, label, compact, icon }: { path?: string; label?: string; compact?: boolean; icon?: boolean }) {
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
  const chooser = <DropdownMenu>
    <DropdownMenuTrigger asChild>
      {icon
        ? <Button type="button" variant="ghost" size="icon" aria-label="Chat about this page" title="Chat about this page" className="min-h-11 min-w-11"><MessageCircle className="h-4 w-4" /></Button>
        : <Button type="button" variant={compact ? 'link' : 'outline'} size="sm" className={compact ? 'h-auto p-0 text-xs' : 'w-full justify-start text-xs'}><MessageCircle className="h-3.5 w-3.5" />Chat about this{compact ? '' : ' page'}</Button>}
    </DropdownMenuTrigger>
    <DropdownMenuContent align={icon ? 'end' : 'start'} className="w-64">
      <DropdownMenuLabel>Who would you like to talk with?</DropdownMenuLabel>
      {approvedSharedMember && <DropdownMenuItem onSelect={goShared}><MessageCircle className="mr-2 h-4 w-4" />April &amp; Shane</DropdownMenuItem>}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => go('/workbook/companion')}><Brain className="mr-2 h-4 w-4" />The Therapy Oracle</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => go('/workbook/social-integration')}><Users className="mr-2 h-4 w-4" />Social Counselor</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => go('/chat')}><Telescope className="mr-2 h-4 w-4" />SmartChat</DropdownMenuItem>
      {/* Ask the Sources searches the protected founder archive; other members would land on their readings instead. */}
      {approvedSharedMember && <DropdownMenuItem onSelect={() => go('/ask')}><BookOpen className="mr-2 h-4 w-4" />Ask the Sources</DropdownMenuItem>}
      {icon && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => nav('/instructions')}><CircleHelp className="mr-2 h-4 w-4" />Instructions & Help</DropdownMenuItem></>}
    </DropdownMenuContent>
  </DropdownMenu>;
  if (icon) return chooser;
  return <div className={compact ? 'inline-flex items-center gap-3' : 'space-y-2'}>{chooser}<Button type="button" variant={compact ? 'link' : 'outline'} size="sm" onClick={() => nav('/instructions')} className={compact ? 'h-auto p-0 text-xs' : 'w-full justify-start text-xs'}><CircleHelp className="h-3.5 w-3.5" />Instructions</Button></div>;
}
