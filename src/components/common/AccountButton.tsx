import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserRound } from 'lucide-react';
import { useSession } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

/** Account & settings live here instead of the main menu. */
export const ACCOUNT_LINKS: [string, string][] = [
  ['/dashboard', 'My Dashboard & Bookmarks'], ['/start', 'Edit birth details'], ['/personal-context', 'Personal context'],
  ['/workspaces', 'Shared workspaces'], ['/pricing', 'Plans & Pricing'], ['/creator', 'Creator dashboard'], ['/orders', 'My book orders'], ['/instructions', 'Instructions & Help'], ['/about', 'About Zodaci'],
];

export function AccountButton({ compact = false }: { compact?: boolean }) {
  const session = useSession();
  const navigate = useNavigate();
  if (session) return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size={compact ? 'icon' : 'sm'} aria-label="Account and settings"><UserRound className="h-4 w-4" />{!compact && <span>My account</span>}</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{session.user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACCOUNT_LINKS.map(([to, label]) => <DropdownMenuItem key={to} asChild><Link to={to}>{label}</Link></DropdownMenuItem>)}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={async () => { await supabase.auth.signOut(); navigate('/welcome'); }}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return <Dialog><DialogTrigger asChild><Button variant="outline" size={compact ? 'icon' : 'sm'} aria-label="Sign in"><LogIn className="h-4 w-4"/>{!compact && <span>Sign in</span>}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Sign in</DialogTitle><DialogDescription>Use your registered email to open your private features.</DialogDescription></DialogHeader><AuthGate what="open your account">{() => null}</AuthGate></DialogContent></Dialog>;
}
