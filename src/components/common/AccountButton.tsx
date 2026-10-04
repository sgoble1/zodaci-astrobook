import { Link } from 'react-router-dom';
import { LogIn, UserRound } from 'lucide-react';
import { useSession } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function AccountButton({ compact = false }: { compact?: boolean }) {
  const session = useSession();
  if (session) return <Button asChild variant="outline" size={compact ? 'icon' : 'sm'} aria-label="Open my account"><Link to="/dashboard"><UserRound className="h-4 w-4"/>{!compact && <span>My account</span>}</Link></Button>;
  return <Dialog><DialogTrigger asChild><Button variant="outline" size={compact ? 'icon' : 'sm'} aria-label="Sign in"><LogIn className="h-4 w-4"/>{!compact && <span>Sign in</span>}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Sign in</DialogTitle><DialogDescription>Use Shane’s or April’s account to open private features.</DialogDescription></DialogHeader><AuthGate what="open your account">{() => null}</AuthGate></DialogContent></Dialog>;
}
