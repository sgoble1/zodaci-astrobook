import { usePageMeta } from '@/hooks/usePageMeta';
import { PRINT_SPECS } from '@/lib/books';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Check, Truck, Plus, Trash2, Sparkles, Upload, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlan } from '@/hooks/usePlan';
import { useMyBirth } from '@/lib/myBirth';
import { streamImage } from '@/lib/streamImage';
import { BOOK_SECTIONS, BOOK_PRICES, COVER_STYLES, DIGITAL_PRICE, bookBase, bookTotal, money, type BookFormat } from '@/lib/books';
import { validateBookOrder } from '@/lib/bookOrder';
import bookPhoto from '@/assets/astrobook-public.jpg';
import coverMidnightStars from '@/assets/cover-design-midnight-stars.jpg';
import coverBlueCosmos from '@/assets/cover-design-blue-cosmos.jpg';
import coverGoldAurora from '@/assets/cover-design-gold-aurora.jpg';
import { ManuscriptPreview } from '@/components/books/ManuscriptPreview';
import { BOOK_EXAMPLES } from '@/content/bookExamples';

const aiCoverIdentity = (covers: Record<string, { url: string; final: boolean }>, choice: string) => covers[choice.slice(3)]?.url;

/** Free cover designs every visitor can use, no account or credits needed. */
const UNIVERSAL_COVERS = [
  { key: 'midnight-stars', label: 'Midnight Stars', detail: 'Black night sky with fine gold stars and a faint violet glow.', src: coverMidnightStars },
  { key: 'blue-cosmos', label: 'Blue Cosmos', detail: 'A blue spiral galaxy with a golden planet rising below.', src: coverBlueCosmos },
  { key: 'gold-aurora', label: 'Gold Aurora', detail: 'Warm gold and violet aurora over a quiet horizon.', src: coverGoldAurora },
] as const;

export default function Books() {
  usePageMeta('AstroBook · Your printed personal astrology book', 'Order AstroBook, a printed book written from your own birth chart. Softcover from $59, free US shipping.');
  const sub = useSubscription(); const birth = useMyBirth(); const nav = useNavigate();
  const [edition, setEdition] = useState<'standard'|'expanded'>('standard');
  const [format, setFormat] = useState<BookFormat>('print');
  const digital = format === 'digital';
  const [extras, setExtras] = useState<string[]>([]);
  const [covers, setCovers] = useState<Record<string,{ url: string; final: boolean }>>({});
  // Cover choice: 'design:<key>' for the free universal designs, 'upload' for the visitor's own image, 'ai:<style>' for chart-based previews.
  const [choice, setChoice] = useState('');
  const [uploaded, setUploaded] = useState<{ path: string; url: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const [address, setAddress] = useState({ name: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US' });
  const [manuscript, setManuscript] = useState<{ blob: Blob; pages: number; config: string } | null>(null);
  const config = JSON.stringify([edition, extras, choice, uploaded?.path, aiCoverIdentity(covers, choice), birth]);
  const manuscriptReady = manuscript?.config === config;
  const design = choice.startsWith('design:') ? UNIVERSAL_COVERS.find(d => d.key === choice.slice(7)) : undefined;
  const aiStyle = choice.startsWith('ai:') ? choice.slice(3) : '';
  const aiCover = aiStyle ? covers[aiStyle] : undefined;
  const coverReady = !!design || (choice === 'upload' && !!uploaded) || !!aiCover?.final;
  const coverPreviewUrl = design?.src ?? (choice === 'upload' ? uploaded?.url : aiCover?.url);
  const canUseAiCovers = usePlan().plan !== 'free';
  const generate = async () => {
    setError(''); setBusy('Generating covers');
    try {
      if (!canUseAiCovers) throw new Error('Personal cover previews are part of Full Access. Upgrade, or pick one of the free cover designs above.');
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
      decoded.close();
      const ext = file.type === 'image/png' ? 'png' : 'jpg';
      const path = `${sub.userId}/book-covers/upload-${crypto.randomUUID()}.${ext}`;
      const { error: err } = await supabase.storage.from('library').upload(path, file, { contentType: file.type });
      if (err) throw err;
      setUploaded({ path, url: URL.createObjectURL(file) });
      setChoice('upload');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not upload your cover.'); }
    finally { setBusy(''); if (fileRef.current) fileRef.current.value = ''; }
  };
  const order = async () => {
    setBusy('Saving your book…'); setError('');
    try {
      const invalid = validateBookOrder({ userId: sub.userId, coverReady, manuscriptReady, extras, address, digital });
      if (invalid || !manuscript) throw new Error(invalid ?? 'Choose a finished cover and compose your manuscript first.');
      const id = crypto.randomUUID();
      let path: string; let coverStyleLabel: string;
      if (design) {
        path = `${sub.userId}/book-covers/${id}.png`; coverStyleLabel = design.label;
        const blob = await fetch(design.src).then(r => r.blob());
        const upload = await supabase.storage.from('library').upload(path, blob, { contentType: 'image/png' });
        if (upload.error) throw upload.error;
      } else if (choice === 'upload' && uploaded) {
        path = uploaded.path; coverStyleLabel = 'Your own upload';
      } else {
        const cover = covers[aiStyle];
        if (!cover?.final) throw new Error('Choose a finished cover first.');
        path = `${sub.userId}/book-covers/${id}.png`; coverStyleLabel = aiStyle;
        const blob = await fetch(cover.url).then(r => r.blob());
        const upload = await supabase.storage.from('library').upload(path, blob, { contentType: 'image/png' });
        if (upload.error) throw upload.error;
      }
      const manuscriptPath = `${sub.userId}/manuscripts/${id}.pdf`;
      const uploadedPdf = await supabase.storage.from('library').upload(manuscriptPath, manuscript.blob, { contentType: 'application/pdf' });
      if (uploadedPdf.error) throw uploadedPdf.error;
      const { error: err } = await supabase.from('book_orders').insert({ id, user_id: sub.userId, edition, format, base_price_cents: bookBase(edition, format), extra_sections: extras.map(s => s.trim()).filter(Boolean), cover_path: path, cover_style: coverStyleLabel, shipping_address: digital ? {} : address, manuscript_path: manuscriptPath, manuscript_pages: manuscript.pages });
      if (err) throw err;
      nav(`/orders?order=${id}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your order.'); }
    finally { setBusy(''); }
  };
  return <article className="space-y-10">
    <header className="relative isolate overflow-hidden rounded min-h-[360px] flex items-end"><img src={bookPhoto} alt="AstroBook softcover and sample chart pages" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover" /><div className="absolute inset-0 -z-10 bg-background/65" /><div className="p-6 sm:p-10"><p className="font-smallcaps text-gold text-xs">Made for your birth chart</p><h1 className="text-4xl mt-2">AstroBook</h1><p className="mt-4 max-w-lg">Your personal chart, thoughtful interpretations and space for reflection. Choose a digital PDF or a printed softcover.</p><p className="text-sm text-muted-foreground mt-3">Illustrative sample · your cover is previewed below.</p></div></header>
    <nav aria-label="Book steps" className="flex flex-wrap gap-4 border-b border-border pb-4 text-sm"><a href="#edition-title" className="text-primary">Edition</a><a href="#personal-cover" className="text-primary">Cover</a><a href="#book-review" className="text-primary">Review & payment</a><Button asChild variant="outline" size="sm"><Link to="/book-preview">Read the sample book</Link></Button></nav><section aria-labelledby="edition-title"><h2 id="edition-title" className="text-2xl mb-4">Choose printed or digital</h2><div className="grid sm:grid-cols-2 gap-4">{(['print', 'digital'] as const).map(f => <Button key={f} variant="outline" aria-pressed={format === f} onClick={() => setFormat(f)} className={`h-auto whitespace-normal p-5 text-left justify-between ${format === f ? 'border-primary bg-primary/10' : ''}`}><span><span className="block text-lg">{f === 'print' ? 'Printed softcover' : 'Digital download (PDF)'}</span><span className="block text-sm text-muted-foreground mt-1">{f === 'print' ? '$59 Standard · $89 Expanded · free US shipping' : '$19.99 base price · either edition · no shipping'}</span></span>{format === f && <Check />}</Button>)}</div>
      <h3 className="text-xl mt-6 mb-3">Choose your edition</h3><div className="grid sm:grid-cols-2 gap-4">{(['standard','expanded'] as const).map(e => <Button key={e} variant="outline" aria-pressed={edition === e} onClick={() => setEdition(e)} className={`h-auto whitespace-normal p-5 text-left justify-between ${edition === e ? 'border-primary bg-primary/10' : ''}`}><span><span className="block text-xl capitalize">{e} {digital ? 'PDF' : 'printed AstroBook'}</span><span className="block text-muted-foreground mt-2">Actual pages shown in your reviewed PDF</span></span><span className="text-xl">{money(bookBase(e, format))}{edition === e && <Check className="mt-2" />}</span></Button>)}</div><p className="text-sm text-muted-foreground mt-3">Standard and Expanded manuscript specifications are being finalized. Review the actual content and page count before payment; 250 and 400 pages are targets, not guaranteed lengths. A book is a one-off purchase, not a subscription.</p>
      {digital && <p className="text-sm text-muted-foreground mt-3">Download your reviewed {edition} PDF from My orders after confirmed payment. Optional extra sections cost $6.99 each.</p>}</section>
    <section aria-labelledby="example-covers"><h2 id="example-covers" className="text-2xl">A few possible covers</h2><p className="mt-3 text-sm text-muted-foreground">Placeholder examples only — these are not based on your chart or anyone else’s. Your personal cover previews are generated separately below.</p><div className="grid sm:grid-cols-3 gap-5 mt-5">{BOOK_EXAMPLES.map(example => <figure key={example.style}><div className="relative rounded overflow-hidden aspect-[2/3] bg-card"><img src={example.image} alt={`${example.style} placeholder AstroBook cover`} width={768} height={1152} loading="lazy" className="w-full h-full object-cover" /><div className="absolute bottom-0 inset-x-0 bg-background/80 p-5"><p className="text-xs text-accent">Zodaci</p><p className="text-2xl font-display mt-2">AstroBook</p><p className="text-xs text-muted-foreground mt-2">Example artwork</p></div></div><figcaption className="mt-3"><h3 className="text-lg">{example.style}</h3><p className="text-sm text-muted-foreground mt-1">{example.detail}</p></figcaption></figure>)}</div></section>
    <section><h2 className="text-2xl">Your table of contents</h2><ol className="mt-4 divide-y divide-border">{BOOK_SECTIONS.map((s,i) => <li key={s.title} className="py-4 flex gap-4"><span className="text-gold">0{i+1}</span><div><h3 className="text-lg">{s.title}</h3><p className="text-sm text-muted-foreground mt-1">{s.description}</p></div></li>)}</ol><p className="text-sm text-muted-foreground">Includes a table of contents, your calculated chart and clear distinctions between astronomical facts and symbolic interpretation.</p></section>
    <section><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Make it more yours</h2><Button variant="outline" disabled={extras.length >= 2} onClick={() => setExtras(e => [...e,''])}><Plus />Add section · $6.99</Button></div><p className="text-sm text-muted-foreground mt-2">Up to two extra sections. For example, creativity, communication or a specific life theme.</p>{extras.map((s,i) => <div className="flex gap-2 mt-3" key={i}><Input aria-label={`Extra section ${i+1}`} maxLength={160} value={s} onChange={e => setExtras(x => x.map((v,n) => n === i ? e.target.value : v))} placeholder="Section topic" /><Button size="icon" variant="ghost" aria-label={`Remove extra section ${i+1}`} onClick={() => setExtras(x => x.filter((_,n) => n !== i))}><Trash2 /></Button></div>)}</section>
    <section><h2 id="personal-cover" className="text-2xl">Choose your cover</h2><p className="text-sm text-muted-foreground mt-2">Pick one of our three designs, use your own image, or — with Full Access — create previews drawn from your chart. Your name and the title are added on top of whichever cover you choose.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">{UNIVERSAL_COVERS.map(d => <Button key={d.key} variant="outline" aria-pressed={choice === `design:${d.key}`} onClick={() => setChoice(`design:${d.key}`)} className={`h-auto flex-col p-0 overflow-hidden ${choice === `design:${d.key}` ? 'ring-2 ring-primary' : ''}`}><div className="aspect-[2/3] w-full relative"><img src={d.src} alt={`${d.label} AstroBook cover design`} width={768} height={1152} loading="lazy" className="w-full h-full object-cover" /><span className="absolute top-5 inset-x-2 font-display text-xl text-foreground bg-background/70 py-2">{birth?.name ? `${birth.name}’s AstroBook` : 'My AstroBook'}</span></div><span className="p-3 whitespace-normal text-sm">{d.label}{choice === `design:${d.key}` && ' · Selected'}<span className="block text-xs text-muted-foreground mt-1">{d.detail}</span></span></Button>)}<Button variant="outline" aria-pressed={choice === 'upload'} onClick={() => fileRef.current?.click()} disabled={!!busy} className={`h-auto flex-col p-0 overflow-hidden ${choice === 'upload' ? 'ring-2 ring-primary' : ''}`}><div className="aspect-[2/3] w-full relative bg-muted flex items-center justify-center">{uploaded ? <img src={uploaded.url} alt="Your uploaded book cover" className="w-full h-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-muted-foreground"><Upload className="w-10 h-10" /><span className="text-sm">Upload your own</span></span>}<span className="absolute top-5 inset-x-2 font-display text-xl text-foreground bg-background/70 py-2">{birth?.name ? `${birth.name}’s AstroBook` : 'My AstroBook'}</span></div><span className="p-3 whitespace-normal text-sm">{uploaded ? 'Your own image' : 'Your own image'}{choice === 'upload' && ' · Selected'}<span className="block text-xs text-muted-foreground mt-1">JPG or PNG, up to 10 MB.</span></span></Button></div><input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" aria-label="Upload your own cover image" onChange={e => { const f = e.target.files?.[0]; if (f) void uploadCover(f); }} /></section>
    <section><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl">Personal covers from your chart</h2>{canUseAiCovers ? <Button disabled={!!busy || !sub.userId || !birth} onClick={generate}><Sparkles />Create three cover previews</Button> : <Button asChild variant="outline"><Link to="/pricing"><Lock />Included with Full Access</Link></Button>}</div><p className="text-sm text-muted-foreground mt-3">{canUseAiCovers ? 'Artwork draws on your saved planetary signs; it is symbolic, not a calculated chart diagram. Each set of three uses your account’s own generation usage, with a daily limit.' : 'Chart-based cover previews use AI generation and are included with Full Access, so free accounts never use up generation. The three designs above and your own upload are free for everyone.'}</p>{canUseAiCovers && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">{COVER_STYLES.map(style => <Button key={style} variant="outline" disabled={!covers[style]?.final || !!busy} aria-pressed={choice === `ai:${style}`} onClick={() => setChoice(`ai:${style}`)} className={`h-auto flex-col p-0 overflow-hidden ${choice === `ai:${style}` ? 'ring-2 ring-primary' : ''}`}><div className="aspect-[2/3] w-full bg-muted flex items-center justify-center relative">{covers[style] ? <img src={covers[style].url} alt={`${style} personal book cover`} className={`w-full h-full object-cover ${covers[style].final ? '' : 'blur-lg'}`} /> : <BookOpen className="w-12 h-12 text-muted-foreground" />}<span className="absolute top-5 inset-x-2 font-display text-xl text-foreground bg-background/70 py-2">{birth?.name ? `${birth.name}’s AstroBook` : 'My AstroBook'}</span></div><span className="p-4 whitespace-normal">{style}{choice === `ai:${style}` && ' · Selected'}</span></Button>)}</div>}{!sub.userId && <p className="mt-3"><Link to="/auth" className="underline text-gold">Sign in</Link> to save your cover and order.</p>}{sub.userId && !birth && <Link to="/start" className="underline text-gold">Add your birth details first</Link>}</section>
    {birth && <ManuscriptPreview key={config} birth={birth} edition={edition} extras={extras} coverUrl={coverReady ? coverPreviewUrl : undefined} onReady={file => setManuscript({ ...file, config })} />}
    <section aria-labelledby="specs"><h2 id="specs" className="text-2xl">How your AstroBook is made</h2><p className="text-sm text-muted-foreground mt-2">Printed by our partner <a className="underline" href={PRINT_SPECS.url} target="_blank" rel="noreferrer">{PRINT_SPECS.partner}</a>. {PRINT_SPECS.notes}</p><div className="grid sm:grid-cols-2 gap-4 mt-4">{([['Binding', PRINT_SPECS.bindings.map(([a, b]) => `${a}: ${b}`)], ['Sizes', PRINT_SPECS.sizes], ['Interior paper', PRINT_SPECS.papers], ['Cover finish', PRINT_SPECS.coatings]] as [string, string[]][]).map(([t, l]) => <div key={t} className="rounded border border-border bg-card p-4"><h3 className="font-smallcaps text-xs text-gold">{t}</h3><ul className="mt-2 space-y-1 text-sm">{l.map(x => <li key={x}>{x}</li>)}</ul></div>)}</div></section>
    <section><h2 className="text-2xl">US delivery</h2><div className="flex gap-3 mt-4"><Truck className="text-gold shrink-0" /><p>Free shipping within the United States. Approximately 3 days to produce after your book is approved, then approximately 5–7 days in transit. Estimates are not guaranteed.</p></div><ul className="text-sm text-muted-foreground mt-4 space-y-2"><li><a href="https://www.usps.com/ship/" target="_blank" rel="noreferrer" className="underline">USPS</a> · Priority Mail and Ground Advantage; service depends on destination.</li><li><a href="https://www.ups.com/us/en/support/shipping-support/shipping-services" target="_blank" rel="noreferrer" className="underline">UPS</a> · Ground delivery; timing varies by distance.</li><li><a href="https://www.fedex.com/en-us/shipping/ground.html" target="_blank" rel="noreferrer" className="underline">FedEx</a> · Ground / Home Delivery; availability varies.</li><li>Carrier chosen during fulfillment. Tracking appears in My Orders when shipped. No expedited or international service at launch.</li></ul></section>
    <form id="book-review" onSubmit={e => { e.preventDefault(); void order(); }} className="space-y-4 border-t border-border pt-6"><h2 className="text-2xl">{digital ? 'Get your digital AstroBook' : 'Where should we send it?'}</h2><p className="text-sm text-muted-foreground">{digital ? 'Save your book, then pay securely on the next page. Your PDF is ready to download from My orders as soon as payment is confirmed.' : "Save your book, then pay securely on the next page. We review every manuscript with our printer before production; if anything needs fixing we'll contact you before printing."}</p>{!digital && <div className="grid sm:grid-cols-2 gap-4">{Object.entries(address).filter(([k]) => k !== 'country').map(([k,v]) => <div key={k} className={k === 'line1' || k === 'line2' ? 'sm:col-span-2' : ''}><Label htmlFor={`ship-${k}`}>{({ name:'Full name',line1:'Street address',line2:'Apartment / suite (optional)',city:'City',state:'State',postal_code:'ZIP code' } as Record<string,string>)[k]}</Label><Input id={`ship-${k}`} value={v} required={k !== 'line2'} maxLength={k === 'state' ? 2 : 120} pattern={k === 'postal_code' ? '[0-9]{5}(-[0-9]{4})?' : undefined} onChange={e => setAddress(a => ({ ...a,[k]: e.target.value }))} /></div>)}</div>}<section className="border-y border-border py-4"><h3 className="text-xl">Book readiness</h3><ul className="mt-3 space-y-2 text-sm">{[[!!birth, "Birth details saved"], [coverReady, "Cover selected"], [manuscriptReady, manuscriptReady ? `Reviewed PDF · ${manuscript?.pages} actual pages` : "Compose and review your PDF"]].map(([ready, label]) => <li key={String(label)} className="flex gap-2"><span className="text-gold">{ready ? "✓" : "○"}</span>{label}</li>)}</ul></section><div className="flex flex-wrap items-center justify-between gap-4"><div><dl className="space-y-2 text-sm"><div className="flex justify-between gap-6"><dt className="capitalize">{edition} {digital ? 'digital PDF' : 'printed AstroBook'}</dt><dd>{money(bookBase(edition, format))}</dd></div>{extras.length > 0 && <div className="flex justify-between gap-6"><dt>Extra sections · {extras.length} × $6.99</dt><dd>{money(extras.length * 699)}</dd></div>}{!digital && <div className="flex justify-between gap-6"><dt>US shipping</dt><dd>$0.00</dd></div>}<div className="flex justify-between gap-6 border-t border-border pt-3 font-medium"><dt>Subtotal before tax</dt><dd>{money(bookTotal(edition,extras.length,format))}</dd></div></dl><p className="text-sm text-muted-foreground mt-2">Applicable tax calculated at checkout</p></div><Button type="submit" disabled={!!busy || !sub.userId || !coverReady || !manuscriptReady || extras.some(s => !s.trim())}>Continue to payment</Button></div></form>
    {busy && <p role="status" className="text-gold">{busy}</p>}{error && <p role="alert" className="text-destructive break-words">{error}</p>}
  </article>;
}