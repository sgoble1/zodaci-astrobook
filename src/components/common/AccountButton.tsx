import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ExternalLink, Eye, LayoutGrid, Lock, LogIn, LogOut, UserRound } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import { useIsAdmin, useSession } from '@/hooks/useLibrary';
import { isAdminEmail, leaveAprilEdition, openAprilEditionTab, useAprilSpace, viewAprilEditionInApp, useClassicView, setClassicView } from '@/hooks/useAprilSpace';
import { useMyBirth } from '@/lib/myBirth';
import { AuthGate } from '@/components/common/AuthGate';
import { PLAN_LABEL } from '@/components/common/PlanLock';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { ACCOUNT_MENU, ADMIN_MENU, itemLock } from '@/content/memberNav';

/** @deprecated kept for older imports; the account menu now reads ACCOUNT_MENU from the navigation registry. */
export const ACCOUNT_LINKS: [string, string][] = ACCOUNT_MENU.map(a => [a.to, a.label]);

/** Everything the account menu (desktop dropdown and phone sheet) shows, computed once per render. */
export function useAccountMenu() {
  const session = useSession();
  const access = usePlan();
  const admin = useIsAdmin(session);
  const april = useAprilSpace();
  const birth = useMyBirth();
  const navigate = useNavigate();
  const email = session?.user.email ?? '';
  const editionSwitch = isAdminEmail(email)
    ? april
      ? [{ label: 'Back to my own content', icon: ArrowLeftRight, run: leaveAprilEdition }]
      : [{ label: 'View April’s content here', icon: Eye, run: viewAprilEditionInApp }, { label: 'Open April’s edition in a new tab', icon: ExternalLink, run: openAprilEditionTab }]
    : [];
  const classic = useClassicView();
  if (april) editionSwitch.push(classic ? { label: 'Back to the full edition', icon: LayoutGrid, run: () => setClassicView(false) } : { label: 'Switch to classic view', icon: LayoutGrid, run: () => setClassicView(true) });
  const signOut = async () => { await supabase.auth.signOut(); navigate('/welcome'); };
  const lock = (to: string) => access.loading || april ? null : itemLock(access.plan, to);
  return { session, email, plan: access.plan, planLoading: access.loading, admin, april, birth: april ? null : birth, editionSwitch, signOut, lock };
}

function LockTag({ need }: { need: ReturnType<ReturnType<typeof useAccountMenu>['lock']> }) {
  if (!need) return null;
  return <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"><Lock className="h-2.5 w-2.5" aria-hidden="true" />{PLAN_LABEL[need]}</span>;
}

/** Name, birth line and plan for the top of the account menu. */
export function AccountSummary({ menu }: { menu: ReturnType<typeof useAccountMenu> }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="truncate font-display text-base text-foreground">{menu.birth?.name || 'My account'}</p>
      <p className="truncate text-xs text-muted-foreground">{menu.email}</p>
      {menu.birth && <p className="truncate text-xs text-muted-foreground">{menu.birth.date}{menu.birth.time ? ` · ${menu.birth.time}` : ' · time unknown'} · {menu.birth.placeLabel}</p>}
    </div>
  );
}

export function AccountButton({ compact = false }: { compact?: boolean }) {
  const menu = useAccountMenu();
  if (menu.session) return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size={compact ? 'icon' : 'sm'} aria-label="Account and settings" className={compact ? 'min-h-11 min-w-11' : undefined}><UserRound className="h-4 w-4" />{!compact && <span>My account</span>}</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[80vh] w-72 overflow-y-auto">
        <DropdownMenuLabel className="font-normal"><AccountSummary menu={menu} /></DropdownMenuLabel>
        {!menu.april && !menu.planLoading && <DropdownMenuItem asChild><Link to="/pricing" className="text-xs"><span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-foreground">{PLAN_LABEL[menu.plan]} plan</span>{menu.plan !== 'creator' && <span className="ml-auto text-primary">Upgrade →</span>}</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {ACCOUNT_MENU.map(({ to, label, icon: Icon }) => <DropdownMenuItem key={to} asChild><Link to={to}><Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />{label}<LockTag need={menu.lock(to)} /></Link></DropdownMenuItem>)}
        </DropdownMenuGroup>
        {(menu.admin || menu.editionSwitch.length > 0) && <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Admin</DropdownMenuLabel>
          {menu.admin && ADMIN_MENU.map(({ to, label, icon: Icon }) => <DropdownMenuItem key={to} asChild><Link to={to}><Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />{label}</Link></DropdownMenuItem>)}
          {menu.editionSwitch.map(({ label, icon: Icon, run }) => <DropdownMenuItem key={label} onSelect={run} data-keep-wording><Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />{label}</DropdownMenuItem>)}
        </>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={menu.signOut}><LogOut className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return <Dialog><DialogTrigger asChild><Button variant="outline" size={compact ? 'icon' : 'sm'} aria-label="Sign in"><LogIn className="h-4 w-4"/>{!compact && <span>Sign in</span>}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Sign in</DialogTitle><DialogDescription>Use your registered email to open your private features.</DialogDescription></DialogHeader><AuthGate what="open your account">{() => null}</AuthGate></DialogContent></Dialog>;
}
