import { Navigate } from 'react-router-dom';
import { useAprilSpace, useClassicView } from '@/hooks/useAprilSpace';
import AprilHome from '@/pages/AprilHome';

/** Signed-in root: April's full edition opens her home; everyone else goes to their dashboard. Public visitors get /welcome from AppShell. */
export default function Home() {
  const april = useAprilSpace();
  const classic = useClassicView();
  if (april && !classic) return <AprilHome />;
  if (april === undefined) return <div role="status" className="p-8 text-muted-foreground">Opening Zodaci…</div>;
  return <Navigate to="/dashboard" replace />;
}
