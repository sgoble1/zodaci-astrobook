import { CinematicVideo } from '@/components/fx/CinematicVideo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Book3D } from '@/components/books/Book3D';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Check, Truck, Plus, Trash2, Sparkles, Upload, Lock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlan } from '@/hooks/usePlan';
import { useMyBirth } from '@/lib/myBirth';
import { streamImage } from '@/lib/streamImage';
import { BOOK_SECTIONS, BOOK_VERSIONS, CHAPTER_TABS, COVER_STYLES, EXTRA_SECTION_PRICE, bookTotal, isEdition, money, versionOf, type Edition } from '@/lib/books';
import { validateBookOrder } from '@/lib/bookOrder';
import bookPhoto from '@/assets/astrobook-public.jpg';
import { COVER_DESIGNS } from '@/content/coverDesigns';
import { CoverEditor } from '@/components/books/CoverEditor';
import { useCoverImage } from '@/hooks/useCoverImage';
import { DEFAULT_CROP, type CoverCrop } from '@/lib/coverLayout';
import { coverSpecKey, renderCoverJpeg, type CoverSpec } from '@/lib/coverRender';
import { ManuscriptPreview } from '@/components/books/ManuscriptPreview';
import { VersionCompare } from '@/components/books/VersionCompare';
import { Faq, ASTROBOOK_FAQ } from '@/components/brand/Faq';

/** A small finished-cover thumbnail (artwork plus the reader's name), drawn by the same code as the print cover. */
function CoverThumb({ spec, alt, blur = false }: { spec: CoverSpec; alt: string; blur?: boolean }) {
  const url = useCoverImage(spec, 40);
  return url ? <img src={url} alt={alt} className={`h-full w-full object-cover ${blur ? 'blur-lg' : ''}`} /> : <div className="h-full w-full animate-pulse bg-muted motion-reduce:animate-none" aria-hidden />;
}

export default function Books() {
  usePageMeta('AstroBook · Your personal astrology book in five versions', 'Order AstroBook, written from your own birth chart: Digital PDF $24.99, Pocket $34.99, Classic $59.99, Signature Hardcover $97 or Collector’s Linen $149. Free US shipping.');
  const sub = useSubscription(); const birth = useMyBirth(); const nav = useNavigate();
  const [params] = useSearchParams();
  const initial = params.get('version');
  const [edition, setEdition] = useState<Edition>(initial && isEdition(initial) ? initial : 'classic');
  const version = versionOf(edition)!;
  const digital = version.format === 'digital';
  const [orderId] = useState(() => crypto.randomUUID());
  const [extras, setExtras] = useState<string[]>([]);
  const [gift, setGift] = useState(false); const [giftMessage, setGiftMessage] = useState('');
  const [covers, setCovers] = useState<Record<string, { url: string; final: boolean }>>({});
  // Cover choice: 'design:<key>' for the free universal designs, 'upload' for the visitor's own image, 'ai:<style>' for chart-based previews.
  const [choice, setChoice] = useState('');
  const [uploaded, setUploaded] = useState<{ url: string; name: string } | null>(null);
  const [crop, setCrop] = useState<CoverCrop>(DEFAULT_CROP);
  const [coverName, setCoverName] = useState<string | null>(null);
  const nameOnCover = coverName ?? birth?.name ?? '';
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const [address, setAddress] = useState({ name: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US' });
  const [manuscript, setManuscript] = useState<{ blob: Blob; pages: number; config: string } | null>(null);
  const design = choice.startsWith('design:') ? COVER_DESIGNS.find(d => d.key === choice.slice(7)) : undefined;
  const aiStyle = choice.startsWith('ai:') ? choice.slice(3) : '';
  const aiCover = aiStyle ? covers[aiStyle] : undefined;
  // The cover as designed: artwork source, position/zoom, the name, and this version's trim.
  const spec = useMemo<CoverSpec | null>(() => {
    const source = design ? { kind: 'design' as const, key: design.key } : choice === 'upload' && uploaded ? { kind: 'image' as const, url: uploaded.url } : aiCover?.final ? { kind: 'image' as const, url: aiCover.url } : null;
    return source ? { source, crop, name: nameOnCover, trimPt: version.trimPt } : null;
  }, [design, choice, uploaded, aiCover?.final, aiCover?.url, crop, nameOnCover, version.trimPt]);
  const specKey = spec ? coverSpecKey(spec) : '';
  // The print-resolution cover (300 ppi) is rebuilt shortly after you stop adjusting; it is page 1 of the book.
  const [composed, setComposed] = useState<{ key: string; blob: Blob; url: string } | null>(null);
  const [composing, setComposing] = useState(false);
  useEffect(() => {
    if (!spec) return;
    let on = true; setComposing(true);
    const t = window.setTimeout(() => {
      renderCoverJpeg(spec).then(r => { if (!on) return; setComposed(prev => { if (prev) URL.revokeObjectURL(prev.url); return { key: specKey, blob: r.blob, url: URL.createObjectURL(r.blob) }; }); })
        .catch(e => { if (on) setError(e instanceof Error ? e.message : 'The cover could not be prepared.'); })
        .finally(() => { if (on) setComposing(false); });
    }, 600);
    return () => { on = false; window.clearTimeout(t); };
  }, [specKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (next: string) => { if (next !== choice) setCrop(DEFAULT_CROP); setChoice(next); };
  const coverReady = !!spec && composed?.key === specKey;
  const coverPreviewUrl = coverReady ? composed?.url : undefined;
  const config = JSON.stringify([edition, extras, specKey, birth]);
  const manuscriptReady = manuscript?.config === config;
  const canUseAiCovers = usePlan().plan !== 'free';
  const certificate = edition === 'linen' ? orderId.slice(0, 8).toUpperCase() : undefined;
  const generate = async () => {
    setError(''); setBusy('Generating covers');
    try {
      if (!canUseAiCovers) throw new Error('Personal cover previews are part of Pro. Upgrade, or pick one of the free cover designs above.');
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Sign in and save your birth details before creating covers.');
      for (const style of COVER_STYLES) {
        if (covers[style]?.final) continue;
        setBusy(`Creating ${style.toLowerCase()}…`);
        await streamImage(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/book-cover`, { style }, (url, final) => setCovers(c => ({ ...c, [style]: { url, final } })), undefined, { Authorization: `Bearer ${data.session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY });
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Cover generation failed.'); }
    finally { setBusy(''); }
  };
  const uploadCover = async (file: File) => {
    setError(''); setBusy('Uploading your cover…');
    try {
      if (!sub.userId) throw new Error('Sign in to use your own cover image.');
      if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Please choose an image file (JPG or PNG).');
      if (file.size > 10 * 1024 * 1024) throw new Error('Please choose an image under 10 MB.');
      const decoded = await createImageBitmap(file);
      const small = Math.min(decoded.width, decoded.height) < 600;
      decoded.close();
      if (small) throw new Error('That image is too small to print well. Please choose one at least 600 pixels on its shortest side.');
      // The picture stays in this browser while you design; only the finished cover is saved with your order.
      if (uploaded) URL.revokeObjectURL(uploaded.url);
      setUploaded({ url: URL.createObjectURL(file), name: file.name });
      setCrop(DEFAULT_CROP); setChoice('upload');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not upload your cover.'); }
    finally { setBusy(''); if (fileRef.current) fileRef.current.value = ''; }
  };
  const order = async () => {
    setBusy('Saving your book…'); setError('');
    try {
      const invalid = validateBookOrder({ userId: sub.userId, coverReady, manuscriptReady, extras, address, digital });
      if (invalid || !manuscript) throw new Error(invalid ?? 'Choose a finished cover and compose your manuscript first.');
      if (gift && giftMessage.length > 500) throw new Error('Keep the gift message under 500 characters.');
      const id = orderId;
      if (!composed || composed.key !== specKey) throw new Error('Your cover is still being prepared. Try again in a moment.');
      // The saved cover is exactly the designed front cover, as a print-resolution JPEG.
      const path = `${sub.userId}/book-covers/${id}.jpg`;
      const coverStyleLabel = design ? design.label : choice === 'upload' ? 'Your own upload' : aiStyle;
      const upload = await supabase.storage.from('library').upload(path, composed.blob, { contentType: 'image/jpeg', upsert: true });
      if (upload.error) throw upload.error;
      const manuscriptPath = `${sub.userId}/manuscripts/${id}.pdf`;
      const uploadedPdf = await supabase.storage.from('library').upload(manuscriptPath, manuscript.blob, { contentType: 'application/pdf', upsert: true });
      if (uploadedPdf.error) throw uploadedPdf.error;
      const { error: err } = await supabase.from('book_orders').insert({ id, user_id: sub.userId, edition, format: version.format, base_price_cents: version.price, extra_sections: extras.map(s => s.trim()).filter(Boolean), cover_path: path, cover_style: coverStyleLabel, shipping_address: digital ? {} : address, manuscript_path: manuscriptPath, manuscript_pages: manuscript.pages, gift: !digital && gift, gift_message: !digital && gift ? giftMessage.trim() : '' });
      if (err) throw err;
      nav(`/orders?order=${id}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your order.'); }
    finally { setBusy(''); }
  };
  return <article className="space-y-12">
    <header className="relative isolate overflow-hidden rounded min-h-[360px] flex items-end"><CinematicVideo poster={bookPhoto} /><div className="absolute inset-0 -z-10 bg-background/65" /><div className="p-6 sm:p-10"><p className="font-smallcaps text-gold text-xs">Made for your birth chart</p><h1 className="text-4xl mt-2">AstroBook</h1><p className="mt-4 max-w-lg">Your chart, written into a book. Five versions, from an instant PDF to a linen-bound collector’s edition, all built from your exact birth moment.</p><p className="text-sm text-muted-foreground mt-3">Illustrative sample · your own cover is previewed below.</p></div></header>

    <nav aria-label="Book steps" className="flex flex-wrap gap-4 border-b border-border pb-4 text-sm"><a href="#versions" className="text-primary">Version</a><a href="#personal-cover" className="text-primary">Cover</a><a href="#book-review" className="text-primary">Review & payment</a><Button asChild variant="outline" size="sm"><Link to="/book-preview">Read the sample book</Link></Button></nav>

    <section id="versions" aria-labelledby="versions-title" className="space-y-5">
      <h2 id="versions-title" className="text-2xl">Choose your version</h2>
      <div role="radiogroup" aria-label="AstroBook version" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {BOOK_VERSIONS.map(v => <button key={v.id} type="button" role="radio" aria-checked={edition === v.id} onClick={() => setEdition(v.id)} className={`flex flex-col rounded-lg border p-4 text-left transition-colors duration-500 ${edition === v.id ? 'border-gold bg-gold/10 ring-1 ring-gold/40' : 'border-border hover:border-primary/60'}`}>
          <span className="flex items-center justify-between gap-2"><span className="font-display text-lg">{v.name}</span>{edition === v.id && <Check className="h-4 w-4 text-gold" aria-hidden />}</span>
          <span className="mt-1 text-xl">{money(v.price)}</span>
          <span className="mt-2 text-xs text-muted-foreground">{v.trim ?? 'PDF download'} · {v.pages[0]}–{v.pages[1]} pages</span>
          <span className="mt-2 text-sm text-muted-foreground">{v.tagline}</span>
        </button>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        <div className="rounded border border-border p-4"><Book3D pages={version.pages[1]} trimPt={version.trimPt} hardcover={edition === 'signature' || edition === 'linen'} label={`${version.trim ?? '6″ × 9″ PDF'} · ${version.binding}`} coverSrc={coverReady ? coverPreviewUrl : undefined} /></div>
        <div className="space-y-3">
          <h3 className="text-xl">What’s inside the {version.name}</h3>
          <ul className="space-y-2 text-sm">{version.inside.map(x => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" aria-hidden />{x}</li>)}</ul>
          <dl className="grid grid-cols-2 gap-3 pt-2 text-sm">{[['Format', version.binding], ['Paper', version.paper], ['Cover', version.cover], ['Delivery', version.ship]].map(([k, v]) => <div key={k}><dt className="font-smallcaps text-xs text-gold">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>)}</dl>
          <p className="text-xs text-muted-foreground">Page ranges are targets: the real count depends on how many of your readings are finished, and is shown before you pay. Nothing is padded to reach a number.</p>
        </div>
      </div>
      <details className="rounded border border-border p-4"><summary className="cursor-pointer text-primary">Compare all five versions</summary><div className="mt-4"><VersionCompare /></div></details>
    </section>

    <section aria-labelledby="chapters-title" className="space-y-4">
      <h2 id="chapters-title" className="text-2xl">What your chapters cover</h2>
      <Tabs defaultValue={CHAPTER_TABS[0].id}>
        <TabsList className="flex h-auto flex-wrap justify-start">{CHAPTER_TABS.map(t => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}</TabsList>
        {CHAPTER_TABS.map(t => <TabsContent key={t.id} value={t.id} className="rounded border border-border p-5"><p>{t.text}</p><ul className="mt-3 space-y-1 text-sm text-muted-foreground">{t.points.map(p => <li key={p} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" aria-hidden />{p}</li>)}</ul></TabsContent>)}
      </Tabs>
      <ol className="divide-y divide-border">{BOOK_SECTIONS.map(s => <li key={s.title} className="py-3"><h3 className="text-lg">{s.title}</h3><p className="text-sm text-muted-foreground mt-1">{s.description}</p></li>)}</ol>
    </section>

    <section><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Make it more yours</h2><Button variant="outline" disabled={extras.length >= 2} onClick={() => setExtras(e => [...e, ''])}><Plus />Add section · {money(EXTRA_SECTION_PRICE)}</Button></div><p className="text-sm text-muted-foreground mt-2">Up to two extra sections from readings you have already finished, for example creativity, communication or a life theme.</p>{extras.map((s, i) => <div className="flex gap-2 mt-3" key={i}><Input aria-label={`Extra section ${i + 1}`} maxLength={160} value={s} onChange={e => setExtras(x => x.map((v, n) => n === i ? e.target.value : v))} placeholder="Section title, as it appears in My Masterbook" /><Button size="icon" variant="ghost" aria-label={`Remove extra section ${i + 1}`} onClick={() => setExtras(x => x.filter((_, n) => n !== i))}><Trash2 /></Button></div>)}</section>

    <section><h2 id="personal-cover" className="text-2xl">Choose your cover</h2><p className="text-sm text-muted-foreground mt-2">Pick one of our designs, a solid color or gradient, use your own image, or with Pro create previews drawn from your chart. Your name and the title are added on top of whichever cover you choose.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">{UNIVERSAL_COVERS.map(d => <Button key={d.key} variant="outline" aria-pressed={choice === `design:${d.key}`} onClick={() => setChoice(`design:${d.key}`)} className={`h-auto flex-col p-0 overflow-hidden ${choice === `design:${d.key}` ? 'ring-2 ring-primary' : ''}`}><div className="aspect-[2/3] w-full relative"><img src={d.src} alt={`${d.label} AstroBook cover design`} width={768} height={1152} loading="lazy" className="w-full h-full object-cover" /><span className="absolute top-5 inset-x-2 font-display text-xl text-foreground bg-background/70 py-2">{nameOnCover}</span></div><span className="p-3 whitespace-normal text-sm">{d.label}{choice === `design:${d.key}` && ' · Selected'}<span className="block text-xs text-muted-foreground mt-1">{d.detail}</span></span></Button>)}<Button variant="outline" aria-pressed={choice === 'upload'} onClick={() => fileRef.current?.click()} disabled={!!busy} className={`h-auto flex-col p-0 overflow-hidden ${choice === 'upload' ? 'ring-2 ring-primary' : ''}`}><div className="aspect-[2/3] w-full relative bg-muted flex items-center justify-center">{uploaded ? <img loading="lazy" decoding="async" src={uploaded.url} alt="Your uploaded book cover" className="w-full h-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-muted-foreground"><Upload className="w-10 h-10" /><span className="text-sm">Upload your own</span></span>}<span className="absolute top-5 inset-x-2 font-display text-xl text-foreground bg-background/70 py-2">{nameOnCover}</span></div><span className="p-3 whitespace-normal text-sm">Your own image{choice === 'upload' && ' · Selected'}<span className="block text-xs text-muted-foreground mt-1">JPG or PNG, up to 10 MB.</span></span></Button></div><input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" aria-label="Upload your own cover image" onChange={e => { const f = e.target.files?.[0]; if (f) void uploadCover(f); }} /></section>
    <section><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl">Personal covers from your chart</h2>{canUseAiCovers ? <Button disabled={!!busy || !sub.userId || !birth} onClick={generate}><Sparkles />Create three cover previews</Button> : <Button asChild variant="outline"><Link to="/pricing"><Lock />Included with Pro</Link></Button>}</div><p className="text-sm text-muted-foreground mt-3">{canUseAiCovers ? 'Artwork draws on your saved planetary signs; it is symbolic, not a calculated chart diagram. Each cover preview uses 3 AI credits from your monthly balance (9 for all three).' : 'Chart-based cover previews use AI and are included with Pro. The three designs above and your own upload are free for everyone.'}</p>{canUseAiCovers && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">{COVER_STYLES.map(style => <Button key={style} variant="outline" disabled={!covers[style]?.final || !!busy} aria-pressed={choice === `ai:${style}`} onClick={() => setChoice(`ai:${style}`)} className={`h-auto flex-col p-0 overflow-hidden ${choice === `ai:${style}` ? 'ring-2 ring-primary' : ''}`}><div className="aspect-[2/3] w-full bg-muted flex items-center justify-center relative">{covers[style] ? <img loading="lazy" decoding="async" src={covers[style].url} alt={`${style} personal book cover`} className={`w-full h-full object-cover ${covers[style].final ? '' : 'blur-lg'}`} /> : <BookOpen className="w-12 h-12 text-muted-foreground" />}<span className="absolute top-5 inset-x-2 font-display text-xl text-foreground bg-background/70 py-2">{nameOnCover}</span></div><span className="p-4 whitespace-normal">{style}{choice === `ai:${style}` && ' · Selected'}</span></Button>)}</div>}{!sub.userId && <p className="mt-3"><Link to="/auth?next=/books" className="underline text-gold">Sign in</Link> to save your cover and order.</p>}{sub.userId && !birth && <Link to="/start" className="underline text-gold">Add your birth details first</Link>}</section>
    {birth && <ManuscriptPreview key={config} birth={birth} edition={edition} extras={extras} certificate={certificate} coverUrl={coverReady ? coverPreviewUrl : undefined} onReady={file => setManuscript({ ...file, config })} />}

    <section aria-labelledby="specs"><h2 id="specs" className="text-2xl">How your {version.name} is made</h2>{digital ? <p className="text-sm text-muted-foreground mt-2">A full-color PDF laid out at 6 × 9 inches, ready to read on screen or print at home. It downloads from My orders as soon as payment is confirmed.</p> : <><p className="text-sm text-muted-foreground mt-2">Printed on demand by <a className="underline" href="https://www.lulu.com/" target="_blank" rel="noreferrer">Lulu</a>, one copy at a time, after we review your manuscript.</p><dl className="grid sm:grid-cols-2 gap-4 mt-4">{[['Trim size', version.trim], ['Binding', version.binding], ['Interior', version.paper], ['Cover', version.cover]].map(([t, v]) => <div key={t} className="rounded border border-border bg-card p-4"><dt className="font-smallcaps text-xs text-gold">{t}</dt><dd className="mt-2 text-sm">{v}</dd></div>)}</dl></>}</section>
    {!digital && <section><h2 className="text-2xl">US delivery</h2><div className="flex gap-3 mt-4"><Truck className="text-gold shrink-0" /><p>Free shipping within the United States. {version.name}: {version.ship} after your manuscript is approved. Estimates are not guaranteed. Tracking appears in My orders when your book ships. No international shipping yet.</p></div></section>}

    <form id="book-review" onSubmit={e => { e.preventDefault(); void order(); }} className="space-y-4 border-t border-border pt-6">
      <h2 className="text-2xl">{digital ? 'Get your digital AstroBook' : 'Where should we send it?'}</h2>
      <p className="text-sm text-muted-foreground">{digital ? 'Save your book, then pay securely on the next page. Your PDF is ready to download from My orders as soon as payment is confirmed.' : "Save your book, then pay securely on the next page. We review every manuscript before it goes to print; if anything needs fixing we'll contact you first."}</p>
      {!digital && <div className="grid sm:grid-cols-2 gap-4">{Object.entries(address).filter(([k]) => k !== 'country').map(([k, v]) => <div key={k} className={k === 'line1' || k === 'line2' ? 'sm:col-span-2' : ''}><Label htmlFor={`ship-${k}`}>{({ name: 'Full name', line1: 'Street address', line2: 'Apartment / suite (optional)', city: 'City', state: 'State', postal_code: 'ZIP code' } as Record<string, string>)[k]}</Label><Input id={`ship-${k}`} value={v} required={k !== 'line2'} maxLength={k === 'state' ? 2 : 120} pattern={k === 'postal_code' ? '[0-9]{5}(-[0-9]{4})?' : undefined} onChange={e => setAddress(a => ({ ...a, [k]: e.target.value }))} /></div>)}</div>}
      {!digital && <div className="space-y-3 rounded border border-border p-4"><label className="flex items-center gap-3"><Checkbox checked={gift} onCheckedChange={v => setGift(v === true)} /><Gift className="h-4 w-4 text-gold" aria-hidden />This is a gift — ship it to the address above with a message</label>{gift && <div><Label htmlFor="gift-message">Gift message (printed on a card inside, up to 500 characters)</Label><Textarea id="gift-message" maxLength={500} value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder="Happy birthday — here is your sky." /><p className="mt-1 text-xs text-muted-foreground">The book is written from the birth details on this account. To give someone a book about their own chart, have them create a free account with their details.</p></div>}</div>}
      <section className="border-y border-border py-4"><h3 className="text-xl">Book readiness</h3><ul className="mt-3 space-y-2 text-sm">{[[!!birth, 'Birth details saved'], [coverReady, 'Cover selected'], [manuscriptReady, manuscriptReady ? `Reviewed PDF · ${manuscript?.pages} actual pages` : 'Compose and review your PDF']].map(([ready, label]) => <li key={String(label)} className="flex gap-2"><span className="text-gold">{ready ? '✓' : '○'}</span>{label}</li>)}</ul></section>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><dl className="space-y-2 text-sm"><div className="flex justify-between gap-6"><dt>AstroBook {version.name}{version.trim ? ` · ${version.trim}` : ''}</dt><dd>{money(version.price)}</dd></div>{extras.length > 0 && <div className="flex justify-between gap-6"><dt>Extra sections · {extras.length} × {money(EXTRA_SECTION_PRICE)}</dt><dd>{money(extras.length * EXTRA_SECTION_PRICE)}</dd></div>}{!digital && <div className="flex justify-between gap-6"><dt>US shipping</dt><dd>$0.00</dd></div>}<div className="flex justify-between gap-6 border-t border-border pt-3 font-medium"><dt>Subtotal before tax</dt><dd>{money(bookTotal(edition, extras.length, version.format))}</dd></div></dl><p className="text-sm text-muted-foreground mt-2">Applicable tax calculated at checkout</p></div><Button type="submit" disabled={!!busy || !sub.userId || !coverReady || !manuscriptReady || extras.some(s => !s.trim())}>Continue to payment</Button></div>
    </form>
    {busy && <p role="status" className="text-gold">{busy}</p>}{error && <p role="alert" className="text-destructive break-words">{error}</p>}
    <section aria-labelledby="book-faq" className="space-y-4"><h2 id="book-faq" className="text-2xl">AstroBook questions</h2><Faq items={ASTROBOOK_FAQ} id="astrobook-faq-schema" /></section>
  </article>;
}
