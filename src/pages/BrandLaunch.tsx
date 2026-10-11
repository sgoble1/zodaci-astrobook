import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSession, useIsAdmin } from '@/hooks/useLibrary';
import { supabase } from '@/integrations/supabase/client';
import planet from '@/assets/astrobook-planet.png';
import hero from '@/assets/zodaci-brand-hero.jpg';

const profiles = [
  { platform: 'Instagram', bio: 'Your sky. Your story. Personal birth charts, thoughtful readings & AstroBook — your sky, in print. Explore your chart with Zodaci.' },
  { platform: 'TikTok', bio: 'Your sky. Your story. Birth charts, plain-language reflections & AstroBook.' },
  { platform: 'YouTube', bio: 'Welcome to Zodaci. Explore calculated birth charts, the history behind symbolic traditions and thoughtful ways to reflect on your own patterns. AstroBook is our printed personal book. Astrology is a reflective practice, not a scientifically validated prediction service.' },
];
const firstPost = 'Meet Zodaci. Your birth chart is a starting point for curiosity — not a script for your life. Explore your measured sky, build a personal reading library, and discover AstroBook, your sky in print. Free to begin.';
type Subscriber = { id: string; email: string; consent_at: string };
export default function BrandLaunch() {
  const session = useSession(); const admin = useIsAdmin(session);
  const [rows, setRows] = useState<Subscriber[]>([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true); setError('');
    const { data, error: failure } = await supabase.from('brand_email_subscribers').select('id,email,consent_at').order('consent_at', { ascending: false });
    if (failure) setError('Could not load the email list.'); else setRows(data || []);
    setBusy(false);
  };
  useEffect(() => { if (admin) void load(); }, [admin]);
  if (!session || !admin) return <div><h1>Brand launch</h1><p className="mt-4 text-muted-foreground">Sign in with the admin account to manage the Zodaci email list and social-profile drafts.</p><Button asChild className="mt-4"><Link to="/auth">Sign in</Link></Button></div>;
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); toast.success('Copied'); } catch { toast.error('Clipboard unavailable. Select and copy the text.'); } };
  return <article className="space-y-10"><header><h1>Zodaci launch kit</h1><p className="mt-3 text-muted-foreground">Profile drafts, brand artwork and consented email signups. Social accounts have not been created; suggested handles are not reserved.</p><Button asChild variant="outline" className="mt-4"><Link to="/welcome">Open brand landing page</Link></Button></header>
    <section><h2 className="text-2xl">Social profiles</h2><p className="mt-3 text-muted-foreground">Display name: Zodaci · Try @zodaci or @zodaciapp if available. Add your public brand-site URL after its launch.</p><div className="grid gap-4 mt-5">{profiles.map(p => <div key={p.platform} className="rounded border border-border bg-card p-5"><div className="flex justify-between gap-3 items-center"><h3 className="text-xl">{p.platform}</h3><Button variant="ghost" size="icon" aria-label={`Copy ${p.platform} bio`} onClick={() => void copy(p.bio)}><Copy /></Button></div><p className="text-sm mt-3 leading-relaxed select-text">{p.bio}</p></div>)}</div><h3 className="text-xl mt-6">First post</h3><p className="mt-3 select-text text-muted-foreground">{firstPost}</p><Button variant="outline" className="mt-3" onClick={() => void copy(firstPost)}><Copy />Copy first post</Button></section>
    <section><h2 className="text-2xl">Brand artwork</h2><div className="flex flex-wrap gap-4 mt-5"><Button asChild variant="outline"><a href={planet} download="zodaci-profile-icon.png"><Download />Planet profile icon</a></Button><Button asChild variant="outline"><a href={hero} download="zodaci-launch-artwork.jpg"><Download />Launch artwork</a></Button></div></section>
    <section><div className="flex flex-wrap justify-between items-center gap-3"><h2 className="text-2xl">Email list · {rows.length}</h2><div className="flex gap-2"><Button size="icon" variant="outline" aria-label="Refresh email list" onClick={() => void load()} disabled={busy}><RefreshCw /></Button><Button variant="outline" disabled={!rows.length} onClick={() => {
      const csv = 'email,consent_at\r\n' + rows.map(r => `"${r.email.replaceAll('"', '""')}",${r.consent_at}`).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = 'zodaci-consented-email-list.csv'; a.click(); URL.revokeObjectURL(url);
    }}><Download />Export CSV</Button></div></div><p className="text-sm text-muted-foreground mt-3">Only explicit opt-ins appear here. Email campaigns are not sent by this form; configure a verified sender before sending. Remove anyone who requests to leave.</p>
      {busy && <p role="status" className="mt-4">Loading email list…</p>}{error && <p role="alert" className="text-destructive mt-4">{error}</p>}
      <ul className="mt-5 divide-y divide-border">{rows.map(r => <li key={r.id} className="py-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="break-all text-sm">{r.email}</p><p className="text-xs text-muted-foreground mt-1">Consent: {new Date(r.consent_at).toLocaleString()}</p></div><Button size="icon" variant="ghost" aria-label={`Remove ${r.email} from list`} onClick={async () => { if (!confirm('Remove this email from the list?')) return; const { error: failure } = await supabase.from('brand_email_subscribers').delete().eq('id', r.id); if (failure) toast.error('Could not remove email.'); else void load(); }}><Trash2 /></Button></li>)}</ul>{!busy && !rows.length && <p className="mt-4 text-muted-foreground">No email signups yet.</p>}
    </section></article>;
}