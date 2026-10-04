import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { CUSTOM_PAGES_CHANGED, type CustomPage } from '@/hooks/useCustomPages';
import { MENU_SECTIONS } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';

export default function CustomPageView() {
  const { id } = useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const [page, setPage] = useState<CustomPage | null | undefined>(undefined);
  useEffect(() => { setPage(undefined); supabase.from('custom_pages').select('*').eq('id', id!).maybeSingle().then(({ data }) => setPage((data as CustomPage) ?? null)); }, [id]);

  if (page === undefined) return <p className="text-muted-foreground" role="status">Loading…</p>;
  if (!page) return <p>This page was not found, or you need to sign in. <Link className="underline" to="/create">Create a page</Link></p>;

  const move = async (menu_group: string) => {
    const { error } = await supabase.from('custom_pages').update({ menu_group }).eq('id', page.id);
    if (error) return toast.error(error.message);
    setPage({ ...page, menu_group }); window.dispatchEvent(new Event(CUSTOM_PAGES_CHANGED)); toast.success(`Moved to ${menu_group}`);
  };
  const remove = async () => {
    const { error } = await supabase.from('custom_pages').delete().eq('id', page.id);
    if (error) return toast.error(error.message);
    window.dispatchEvent(new Event(CUSTOM_PAGES_CHANGED)); navigate('/create');
  };

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="inline-block rounded px-2 py-0.5 font-smallcaps text-xs bg-created/25 text-foreground">Created page · {page.menu_group}</div>
        <h1 className="text-4xl sm:text-5xl">{page.title}</h1>
        {page.brief && <p className="max-w-2xl text-sm text-muted-foreground">{page.brief}</p>}
      </header>
      {page.status === 'ready' ? <div className="prose prose-invert max-w-none"><ReactMarkdown>{page.content}</ReactMarkdown></div>
        : <p className="parchment p-4">{page.status === 'failed' ? 'This page could not be written. Delete it and try again.' : 'This page is still being written…'}</p>}
      {user && (
        <footer className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <label htmlFor="move-group" className="text-sm">Menu location</label>
          <select id="move-group" value={page.menu_group} onChange={e => move(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {MENU_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button variant="outline" onClick={remove}>Delete page</Button>
        </footer>
      )}
    </article>
  );
}
