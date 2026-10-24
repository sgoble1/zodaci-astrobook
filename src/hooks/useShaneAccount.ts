import { useSession } from '@/hooks/useLibrary';
import { isShaneAccount } from '@/lib/founderEdition';
import { ADMIN_EDITION_KEY } from '@/hooks/useAprilSpace';

/** Presentation only; protected-content independently authorizes every archive request. */
export function useShaneAccount() {
  const session = useSession();
  return isShaneAccount(session?.user.email) && !['april', 'zac'].includes(sessionStorage.getItem(ADMIN_EDITION_KEY) ?? '');
}