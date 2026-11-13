import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ScrollText, Award, ShoppingBag, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHead } from '@/components/observatory/PageHead';
import { SpotArt } from '@/components/art/SpotArt';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { ChartRequired } from '@/components/common/ChartRequired';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRelationships, type Relationship } from '@/hooks/useRelationships';
import { viewingSharedEdition } from '@/hooks/useAprilSpace';
import { computeChart, type ChartResult } from '@/lib/astro';
import { certificateRows, keepsakeNumber, scrollSections } from '@/lib/keepsakes';
import type { MyBirth } from '@/lib/myBirth';

type Kind = 'certificate' | 'scroll';
type Subject = { id: string; name: string; date: string; time: string | null; place: string; chart: ChartResult };

const longDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const clock = (t: string | null) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };

/** Printable keepsakes from calculated charts: a Birth-Sky Certificate and a tall Star Scroll, for yourself or as a gift. */
export default function Keepsakes() {
  usePageMeta('Keepsakes · Birth-Sky Certificate & Star Scroll · Zodaci', 'Print a Birth-Sky Certificate or a Star Scroll from your own calculated chart, or make one as a gift from birth details you saved.');
  return <ChartRequired what="print your keepsakes">{({ chart, birth }) => <Studio chart={chart} birth={birth} />}</ChartRequired>;
}

function Studio({ chart, birth }: { chart: ChartResult; birth: MyBirth }) {
  const { items } = useRelationships();
  // A shared-edition viewer prints that edition's own sky only; their saved people never appear in someone else's edition.
  const people = viewingSharedEdition() ? [] : items;
  const [who, setWho] = useState('me');
  const [kind, setKind] = useState<Kind>('certificate');
  const subjects = useMemo<Subject[]>(() => [
    { id: 'me', name: birth.name || 'My chart', date: birth.date, time: birth.time, place: birth.placeLabel, chart },
    ...people.map((r: Relationship) => { try { return { id: r.id, name: r.name, date: r.birth_date, time: r.birth_time, place: r.place_label, chart: computeChart({ date: r.birth_date, time: r.birth_time, lat: r.lat, lon: r.lon, tz: r.tz, placeLabel: r.place_label, placeSource: 'geocoded', sex: r.sex }) }; } catch { return null; } }).filter((x): x is Subject => !!x),
  ], [birth, chart, people]);
  const subject = subjects.find(s => s.id === who) ?? subjects[0];
  useEffect(() => { if (!subjects.some(s => s.id === who)) setWho('me'); }, [subjects, who]);

  const print = () => {
    document.body.classList.add('printing-keepsake');
    const done = () => { document.body.classList.remove('printing-keepsake'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    window.setTimeout(done, 1500);
  };

  const [saving, setSaving] = useState(false);
  const download = async () => {
    setSaving(true);
    try {
      const { certificatePdf, scrollPdf } = await import('@/lib/keepsakePdf');
      const info = { name: subject.name, bornLine: `born ${longDate(subject.date)}${subject.time ? ` at ${clock(subject.time)}` : ''} · ${subject.place}`, number: keepsakeNumber({ date: subject.date, time: subject.time, lat: subject.chart.input.lat, lon: subject.chart.input.lon }), printed: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
      const bytes = kind === 'certificate' ? await certificatePdf(info, certificateRows(subject.chart)) : await scrollPdf(info, scrollSections(subject.chart));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `${kind === 'certificate' ? 'birth-sky-certificate' : 'star-scroll'}-${subject.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`; a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch { toast.error('The PDF could not be made. Please try again.'); } finally { setSaving(false); }
  };

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <PageHead eyebrow="Observatory Gift Shop · Keepsakes" title="Keepsakes from the sky" script="Printed from the measured sky, for you or as a gift." art="shop"
        actions={<Button asChild variant="outline"><Link to="/store"><ShoppingBag className="mr-2 h-4 w-4" aria-hidden />Visit the Gift Shop</Link></Button>}>
        Choose whose sky, choose a keepsake, then print it or save it as a PDF from the print window. Gifts use the birth details you saved for that person, and nothing is shared with them unless you hand it over.
      </PageHead>

      <div className="grid gap-4 print:hidden md:grid-cols-[1fr_auto] md:items-end">
        <fieldset className="space-y-2">
          <legend className="font-label text-xs tracking-[0.16em] text-primary">Whose sky</legend>
          <div className="flex flex-wrap gap-2">{subjects.map(s => <button key={s.id} type="button" aria-pressed={who === s.id} onClick={() => setWho(s.id)} className={`min-h-10 rounded-full border px-4 text-sm transition-colors duration-500 ${who === s.id ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}>{s.id === 'me' ? `Me · ${s.name}` : s.name}</button>)}
            {!people.length && !viewingSharedEdition() && <Link to="/relationships" className="inline-flex min-h-10 items-center px-2 text-sm text-primary underline-offset-4 hover:underline">Add someone to make a gift</Link>}</div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <div role="group" aria-label="Keepsake" className="flex gap-1">
            <Button variant={kind === 'certificate' ? 'default' : 'outline'} aria-pressed={kind === 'certificate'} onClick={() => setKind('certificate')}><Award className="mr-2 h-4 w-4" aria-hidden />Certificate</Button>
            <Button variant={kind === 'scroll' ? 'default' : 'outline'} aria-pressed={kind === 'scroll'} onClick={() => setKind('scroll')}><ScrollText className="mr-2 h-4 w-4" aria-hidden />Star Scroll</Button>
          </div>
          <Button onClick={() => void download()} disabled={saving}><Download className="mr-2 h-4 w-4" aria-hidden />{saving ? 'Making PDF…' : 'Download print PDF'}</Button>
          <Button variant="outline" onClick={print}><Printer className="mr-2 h-4 w-4" aria-hidden />Print</Button>
        </div>
      </div>

      {kind === 'certificate' ? <Certificate s={subject} /> : <StarScroll s={subject} />}
      <p className="text-sm text-muted-foreground print:hidden">Positions are calculated with the astronomy-engine ephemeris from the birth details shown. {subject.time ? '' : 'Without a birth time, the Rising sign, Midheaven and houses are left off and the Moon is shown by sign only.'} The keepsake number is a reprint label, not an official record.</p>
    </article>
  );
}

function Certificate({ s }: { s: Subject }) {
  const rows = certificateRows(s.chart);
  const no = keepsakeNumber({ date: s.date, time: s.time, lat: s.chart.input.lat, lon: s.chart.input.lon });
  return (
    <section aria-label={`Birth-Sky Certificate for ${s.name}`} className="keepsake-sheet keepsake-certificate mx-auto max-w-3xl" data-keep-wording>
      <div className="keepsake-border p-6 text-center sm:p-10">
        <p className="font-label text-xs tracking-[0.28em]">Zodaci · Astral Research Authority</p>
        <div className="mx-auto my-4 inline-flex rounded-full border-4 border-double border-[hsl(var(--brass))] p-2"><SpotArt kind="sign" className="h-20 w-20" /></div>
        <h2 className="font-display !text-3xl sm:!text-4xl">Certificate of the Birth Sky</h2>
        <p className="mt-2 font-script text-2xl">This keepsake records the sky above</p>
        <p className="mt-3 font-display !text-2xl sm:!text-3xl">{s.name}</p>
        <p className="mt-2 text-sm">born {longDate(s.date)}{s.time ? ` at ${clock(s.time)}` : ''} · {s.place}</p>
        <dl className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-x-8 gap-y-2 text-left sm:grid-cols-2">
          {rows.map(r => <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-dashed border-[hsl(var(--comic-navy)/0.3)] py-1"><dt className="font-label text-xs tracking-[0.12em]">{r.label}</dt><dd className="text-right text-sm">{r.value}</dd></div>)}
        </dl>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 text-left text-xs">
          <p>Keepsake no. <span className="font-mono">{no}</span><br />Printed {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-right"><span className="font-script text-xl">The Grand Observatory</span><br />Calculated, not invented</p>
        </div>
      </div>
    </section>
  );
}

function StarScroll({ s }: { s: Subject }) {
  const sections = scrollSections(s.chart);
  return (
    <section aria-label={`Star Scroll for ${s.name}`} className="keepsake-sheet keepsake-scroll mx-auto max-w-3xl" data-keep-wording>
      <div className="keepsake-border space-y-6 p-6 sm:p-10">
        <header className="text-center">
          <p className="font-label text-xs tracking-[0.28em]">Star Scroll</p>
          <h2 className="mt-2 font-display !text-3xl sm:!text-4xl">{s.name}</h2>
          <p className="mt-1 text-sm">{longDate(s.date)}{s.time ? ` · ${clock(s.time)}` : ' · time unknown'} · {s.place}</p>
        </header>
        <div className="keepsake-wheel"><ChartWheel r={s.chart} /></div>
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map(sec => (
            <div key={sec.title}>
              <h3 className="font-label !text-sm tracking-[0.16em]">{sec.title}</h3>
              <dl className="mt-2 space-y-1 text-sm">{sec.rows.map(r => <div key={r.label} className="flex justify-between gap-3 border-b border-dashed border-[hsl(var(--comic-navy)/0.25)] py-0.5"><dt>{r.label}</dt><dd className="text-right">{r.value}</dd></div>)}</dl>
            </div>
          ))}
        </div>
        <p className="text-center font-script text-xl">Same skies. Brighter answers.</p>
      </div>
    </section>
  );
}
