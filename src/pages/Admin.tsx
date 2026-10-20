import { CreditLedger } from '@/components/admin/CreditLedger';
import { confirmAction } from '@/components/common/ConfirmHost';
import { SectionEditor } from '@/components/admin/SectionEditor';
import { RelationshipsAdmin } from '@/components/relationships/RelationshipsAdmin';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileUp, Trash2, Save, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary, useSession, useIsAdmin } from '@/hooks/useLibrary';
import { useDocOverrides, type DocOverride } from '@/hooks/useDocOverrides';
import { AuthGate } from '@/components/common/AuthGate';
import { extractSections, type DocSection } from '@/lib/extract';
import { loadLibraryIndex } from '@/lib/corpus';
import { BUILT_IN_SOURCES, fmtSize } from '@/content/sources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MemberCharts } from '@/components/admin/MemberCharts';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { MarketingPages } from '@/components/admin/MarketingPages';
import { PrintOrders } from '@/components/admin/PrintOrders';
import { GrowthStats } from '@/components/admin/GrowthStats';
import { UpgradeFunnel } from '@/components/admin/UpgradeFunnel';
import { AdminEditionSwitch } from '@/components/common/AdminEditionSwitch';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AuditLog } from '@/components/admin/AuditLog';
import { PlatformSettings } from '@/components/admin/PlatformSettings';
import { NewsletterManager } from '@/components/admin/NewsletterManager';
import { AprilMonitor } from '@/components/admin/AprilMonitor';
import { MemberGrants } from '@/components/admin/MemberGrants';
import { ComicQueue } from '@/components/admin/ComicQueue';
import { StripeOverview } from '@/components/admin/StripeOverview';
import { ADMIN_TAB_GROUPS, resolveAdminTab, type AdminTab } from '@/lib/adminTabs';

export default function Admin() {
  const session = useSession();
  const isAdmin = useIsAdmin(session);
  const [params, setParams] = useSearchParams();
  const tab = resolveAdminTab(params.get('tab'), isAdmin);
  const go = (t: AdminTab, extra: Record<string, string> = {}) => setParams({ tab: t, ...extra }, { replace: false });
  const groups = useMemo(() => ADMIN_TAB_GROUPS.map(g => ({ ...g, tabs: g.tabs.filter(t => !t.adminOnly || isAdmin) })).filter(g => g.tabs.length), [isAdmin]);
  useEffect(() => { document.getElementById(`admin-tab-${tab}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [tab]);
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="font-smallcaps text-xs text-gold flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{isAdmin ? 'Admin' : 'Workspace'}</div>
        <div className="flex flex-wrap items-end justify-between gap-4"><h1 className="text-4xl sm:text-5xl">{isAdmin ? 'Admin Dashboard' : 'My Workspace'}</h1>{isAdmin && <AdminSearch onOpen={go} />}</div>
        <p className="text-muted-foreground max-w-2xl">{isAdmin ? 'Run Zodaci from one place: content, orders and payments, members, and platform settings. Every admin change is written to the audit log.' : 'Your saved documents and relationships. Built-in source books remain unchanged.'}</p>
        {isAdmin && <div className="flex flex-wrap items-center gap-3"><Button asChild variant="outline"><Link to="/orders?all=1">Book order management</Link></Button><Button asChild variant="outline"><Link to="/dispatch">Dispatch books</Link></Button><Button asChild variant="outline"><Link to="/brand-launch">Brand launch & email list</Link></Button><div className="w-full sm:w-auto sm:max-w-xs"><AdminEditionSwitch /></div></div>}
        {isAdmin && <p className="text-sm text-muted-foreground max-w-2xl">April's original account and its full private edition open in their own tab, so your own content is never mixed with hers.</p>}
      </header>
      <AuthGate what="open your workspace">{() => (
        <div className="space-y-6">
          <nav aria-label="Admin sections" className="-mx-1 overflow-x-auto pb-2">
            <div className="flex items-center gap-1 whitespace-nowrap px-1 text-sm">
              {groups.map((g, gi) => (
                <Fragment key={g.label}>
                  <span className={`px-2 font-smallcaps text-[10px] text-muted-foreground ${gi ? 'ml-2 border-l border-border pl-3' : ''}`}>{g.label}</span>
                  {g.tabs.map(t => <Button key={t.id} id={`admin-tab-${t.id}`} size="sm" variant={tab === t.id ? 'secondary' : 'ghost'} aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)} className={`rounded-full border ${tab === t.id ? 'border-accent bg-accent/15' : 'border-transparent'}`}>{t.label}</Button>)}
                </Fragment>
              ))}
            </div>
          </nav>
          {isAdmin && tab === 'upload' && <UploadPanel userId={session?.user.id ?? ''} />}
          {tab === 'sections' && <SectionsPanel ownerId={isAdmin ? null : session?.user.id ?? ''} />}
          {tab === 'relationships' && <RelationshipsAdmin userId={session?.user.id ?? ''} />}
          {isAdmin && <>
            {tab === 'index' && <IndexPanel />}
            {tab === 'marketing' && <MarketingPages />}
            {tab === 'growth' && <div className="space-y-8"><GrowthStats /><UpgradeFunnel /></div>}
            {tab === 'activity' && <ActivityFeed />}
            {tab === 'charts' && <MemberCharts />}
            {tab === 'orders' && <PrintOrders />}
            {tab === 'comic' && <ComicQueue />}
            {tab === 'stripe' && <StripeOverview />}
            {tab === 'newsletter' && <NewsletterManager />}
            {tab === 'april' && <AprilMonitor />}
            {tab === 'credits' && <div className="space-y-10"><MemberGrants initialMember={params.get('member')} /><CreditLedger /></div>}
            {tab === 'audit' && <AuditLog />}
            {tab === 'settings' && <PlatformSettings />}
          </>}
        </div>
      )}</AuthGate>
    </div>
  );
}

function UploadPanel({ userId }: { userId: string }) {
  const { upload } = useLibrary('masterbook');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(''); const [category, setCategory] = useState(''); const [description, setDescription] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const submit = async () => {
    if (!file) return;
    try {
      setBusy('Reading the document…');
      const sections = await extractSections(file);
      setBusy(`Saving ${sections.length} sections…`);
      await upload(file, { title: title || file.name.replace(/\.[^.]+$/, ''), category: category || 'My uploads', description, sections }, userId);
      toast.success(`Added with ${sections.length} sections — edit them under “Edit sections”`);
      setFile(null); setTitle(''); setCategory(''); setDescription('');
    } catch (e) { toast.error((e as Error).message || 'Upload failed'); }
    setBusy(null);
  };
  return (
    <div className="parchment deckle p-5 space-y-3 max-w-2xl">
      <Input type="file" accept=".pdf,.xlsx,.xls,.csv,.ods,.tsv,.txt,.md" onChange={e => { const f = e.target.files?.[0] ?? null; setFile(f); if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, '')); }} />
      <div className="grid sm:grid-cols-2 gap-3"><Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><Input placeholder="Group (e.g. Transit notes)" value={category} onChange={e => setCategory(e.target.value)} /></div>
      <Textarea placeholder="Short description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
      <Button onClick={submit} disabled={!file || !!busy}><FileUp className="w-4 h-4 mr-2" />{busy ?? 'Upload & split into sections'}</Button>
      <p className="text-xs text-muted-foreground">The document appears in the Masterbook, the Document Index, ⌘K search and Ask the Sources.</p>
    </div>
  );
}

function SectionsPanel({ ownerId }: { ownerId: string | null }) {
  const lib = useLibrary('masterbook');
  const { loading, remove, reload } = lib;
  const items = ownerId ? lib.items.filter(i => i.owner_id === ownerId) : lib.items;
  const [openId, setOpenId] = useState<string | null>(null);
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!items.length) return <p className="text-sm text-muted-foreground">No uploaded documents yet. Built-in source documents are fixed; you can rename, reorder or hide them under “Document Index”.</p>;
  return (
    <div className="space-y-3">
      {items.map(it => openId === it.id ? <SectionEditor key={it.id} item={it} onDone={() => { setOpenId(null); reload(); }} /> : (
        <div key={it.id} className="parchment p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0"><div className="font-display text-lg">{it.title}</div><div className="text-xs text-muted-foreground">{it.category} · {it.file_name} · {fmtSize(it.size_bytes)} · {((it.sections as DocSection[] | null) ?? []).length} sections</div></div>
          <Link to={`/masterbook/u/${it.id}`} className="text-xs underline">View</Link>
          <Button size="sm" variant="outline" onClick={() => setOpenId(it.id)}>Edit</Button>
          <Button size="sm" variant="ghost" className="text-destructive" aria-label={`Delete ${it.title}`} onClick={async () => { if (await confirmAction(`Delete “${it.title}”?`, 'Delete')) remove(it); }}><Trash2 className="w-4 h-4" /></Button>
        </div>
      ))}
    </div>
  );
}

function IndexPanel() {
  const { map, save } = useDocOverrides();
  const uploads = useLibrary('masterbook');
  const [docs, setDocs] = useState<{ key: string; title: string; kind: string }[]>([]);
  const [draft, setDraft] = useState<Record<string, DocOverride>>({});
  useEffect(() => {
    loadLibraryIndex().then(ix => {
      const mb = BUILT_IN_SOURCES.find(s => /Masterbook/.test(s.fileName));
      setDocs([{ key: 'masterbook', title: mb?.title ?? 'Masterbook', kind: 'Built-in' },
        ...ix.map(d => ({ key: 'lib:' + d.id, title: BUILT_IN_SOURCES.find(s => s.fileName === d.fileName)?.title ?? d.fileName, kind: 'Built-in' })),
        ...uploads.items.map(u => ({ key: 'up:' + u.id, title: u.title, kind: 'Upload' }))]);
    });
  }, [uploads.items]);
  const get = (k: string): DocOverride => draft[k] ?? map[k] ?? { doc_key: k, title: null, note: null, hidden: false, sort_order: null };
  const upd = (k: string, p: Partial<DocOverride>) => setDraft(d => ({ ...d, [k]: { ...get(k), ...p } }));
  const commit = async (k: string) => { try { await save(get(k)); setDraft(d => { const n = { ...d }; delete n[k]; return n; }); toast.success('Saved'); } catch (e) { toast.error((e as Error).message); } };
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Rename a document, add a short note under its title, set its position (lower numbers first) or hide it from the <Link to="/masterbook/index" className="underline">Document Index</Link>.</p>
      {docs.map(d => { const o = get(d.key); return (
        <div key={d.key} className={`parchment p-3 grid md:grid-cols-[1fr_1fr_90px_auto_auto] gap-2 items-center ${o.hidden ? 'opacity-60' : ''}`}>
          <Input value={o.title ?? ''} placeholder={d.title} onChange={e => upd(d.key, { title: e.target.value || null })} />
          <Input value={o.note ?? ''} placeholder="Note shown under the title" onChange={e => upd(d.key, { note: e.target.value || null })} />
          <Input type="number" value={o.sort_order ?? ''} placeholder="Order" onChange={e => upd(d.key, { sort_order: e.target.value === '' ? null : +e.target.value })} />
          <Button size="sm" variant="ghost" onClick={() => upd(d.key, { hidden: !o.hidden })} title={o.hidden ? 'Hidden' : 'Visible'}>{o.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
          <Button size="sm" onClick={() => commit(d.key)} disabled={!draft[d.key]}><Save className="w-4 h-4" /></Button>
          <div className="md:col-span-5 text-[11px] text-muted-foreground">{d.kind} · {d.title}</div>
        </div>
      ); })}
    </div>
  );
}
