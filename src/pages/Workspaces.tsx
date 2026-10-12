import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Workspaces() {
  const session = useSession();
  const [params] = useSearchParams();
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    const r = await supabase.from('spaces').select('id,name');
    if (r.error) setMessage(r.error.message);
    else setSpaces(r.data ?? []);
  }, [session]);

  useEffect(() => { void load(); }, [load]);

  return (
    <article className="max-w-3xl space-y-8">
      <header>
        <p className="text-xs font-smallcaps text-gold">Only invited members</p>
        <h1 className="text-4xl mt-2">Your shared workspaces</h1>
        <p className="text-muted-foreground mt-3">
          Share selected podcasts and wonderings with people you invite. Your birth details, personal examples and private readings stay private.
        </p>
      </header>
      {!session ? (
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      ) : (
        <>
          {params.get('invite') && (
            <Button
              onClick={async () => {
                const token = params.get('invite');
                if (!token) return;
                const r = await supabase.rpc('accept_space_invite', { _token: token });
                setMessage(r.error?.message ?? 'Invitation accepted.');
                void load();
              }}
            >
              Accept invitation for my email
            </Button>
          )}
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await supabase.rpc('create_space', { _name: name });
              if (r.error) setMessage(r.error.message);
              else {
                setName('');
                void load();
              }
            }}
          >
            <Input
              aria-label="Workspace name"
              value={name}
              maxLength={100}
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="Workspace name"
            />
            <Button>Create workspace</Button>
          </form>
          <form
            className="space-y-4 border-y border-border py-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await supabase.from('space_invites')
                .insert({
                  space_id: selected,
                  email: email.trim().toLowerCase(),
                  invited_by: session.user.id
                })
                .select('token')
                .single();
              if (r.error) setMessage(r.error.message);
              else {
                setInviteLink(`${window.location.origin}/workspaces?invite=${r.data.token}`);
                setMessage('Invitation link ready. Send it to the invited person; they must sign in with that email.');
              }
            }}
          >
            <div>
              <Label htmlFor="workspace-select">Workspace</Label>
              <select
                id="workspace-select"
                required
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="h-10 w-full border border-input bg-background rounded px-3"
              >
                <option value="">Choose a workspace</option>
                {spaces.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="invite-email">Invite by email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <Button disabled={!selected}>Create invitation link</Button>
          </form>

          {inviteLink && (
            <div className="space-y-3 p-4 parchment border border-gold/30 rounded">
              <Label htmlFor="invite-link">Invitation link</Label>
              <Input id="invite-link" readOnly value={inviteLink} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void navigator.clipboard.writeText(inviteLink)}>
                  Copy link
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`mailto:${email}?subject=Invitation to Zodaci workspace&body=Hi, I would like to invite you to a shared workspace on Zodaci: ${inviteLink}`}
                  >
                    Share via Email
                  </a>
                </Button>
              </div>
            </div>
          )}

          <ul className="divide-y divide-border">
            {spaces.map((s) => (
              <li key={s.id} className="py-4 flex flex-wrap justify-between gap-3">
                <div><h2 className="text-xl">{s.name}</h2><Members spaceId={s.id} me={session?.user.id} /></div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/wonderings?workspace=${s.id}`}>Wonderings</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/podcasts">Shared podcasts</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {message && (
        <p role="status" className="text-sm text-gold">
          {message}
        </p>
      )}
    </article>
  );
}

/** Lists a workspace's members; the owner can remove others, and anyone can leave. */
function Members({ spaceId, me }: { spaceId: string; me?: string }) {
  const [rows, setRows] = useState<{ user_id: string; display_name: string; role: string }[]>([]);
  const load = useCallback(async () => {
    const [d, m] = await Promise.all([
      supabase.rpc('workspace_member_directory', { _space_id: spaceId }),
      supabase.from('space_members').select('user_id,role').eq('space_id', spaceId),
    ]);
    const roles = new Map((m.data ?? []).map(r => [r.user_id, r.role]));
    setRows((d.data ?? []).map((r: { user_id: string; display_name: string }) => ({ ...r, role: roles.get(r.user_id) ?? 'member' })));
  }, [spaceId]);
  useEffect(() => { void load(); }, [load]);
  const iOwn = rows.some(r => r.user_id === me && r.role === 'owner');
  const remove = async (uid: string) => {
    if (!confirm(uid === me ? 'Leave this workspace?' : 'Remove this member?')) return;
    await supabase.from('space_members').delete().eq('space_id', spaceId).eq('user_id', uid);
    void load();
  };
  return (
    <ul className="mt-2 space-y-1 text-sm text-muted-foreground" aria-label="Members">
      {rows.map(r => (
        <li key={r.user_id} className="flex items-center gap-2">
          <span>{r.display_name}{r.user_id === me ? ' (you)' : ''} · {r.role === 'owner' ? 'Owner' : 'Member'}</span>
          {r.role !== 'owner' && (iOwn || r.user_id === me) && <button className="underline" onClick={() => remove(r.user_id)}>{r.user_id === me ? 'Leave' : 'Remove'}</button>}
        </li>
      ))}
    </ul>
  );
}
