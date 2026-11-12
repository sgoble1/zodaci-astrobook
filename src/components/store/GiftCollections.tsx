import { Link, useNavigate } from 'react-router-dom';
import { BoxArt } from '@/components/common/BoxArt';

/**
 * Gift collections: curated ways into the existing catalog filters, plus the at-home keepsakes and the AstroBook gift option.
 * Every card opens a real filter or page; nothing here invents stock or prices.
 */
const CARDS = [
  { to: '/store?price=under-20', title: 'Gifts under $20', note: 'Stickers, pins and small pieces that fit in a card.' },
  { to: '/store?type=dept%3Astickers', title: 'Little gifts', note: 'Stickers and small gifts across every sign.' },
  { to: '/store?collection=atomic&type=dept%3Apaper', title: 'For their wall', note: 'Atomic Zodiac prints and stationery.' },
  { to: '/keepsakes', title: 'Printed at home tonight', note: 'A Birth-Sky Certificate or Star Scroll from birth details you saved.' },
  { to: '/books', title: 'Send a book as a gift', note: 'Printed AstroBooks can ship to another address with a card message inside.' },
];

export function GiftCollections({ signs }: { signs: { name: string; count: number }[] }) {
  const navigate = useNavigate();
  const sorted = [...signs].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <section aria-labelledby="gift-h" className="space-y-3">
      <div className="border-b border-dashed border-[hsl(var(--brass)/0.5)] pb-2">
        <h2 id="gift-h" className="font-label text-2xl tracking-[0.12em] text-primary">Gift collections</h2>
        <p className="font-script text-xl leading-tight text-foreground/80">Something for everyone under the same sky</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.length > 0 && <li className="obs-panel flex flex-col overflow-hidden">
          <BoxArt seed="gift-sun-sign" label="For their Sun sign" className="h-24 w-full" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <h3 className="font-display !text-lg">For their Sun sign</h3>
            <p className="text-sm text-muted-foreground">Pick a sign to see every piece made for it.</p>
            <label className="mt-auto text-sm"><span className="sr-only">Sun sign</span>
              <select defaultValue="" onChange={e => e.target.value && navigate(`/store?sign=${encodeURIComponent(e.target.value)}`)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="" disabled>Choose a sign…</option>
                {sorted.map(s => <option key={s.name} value={s.name}>{s.name} ({s.count})</option>)}
              </select></label>
          </div>
        </li>}
        {CARDS.map(c => <li key={c.to}><Link to={c.to} className="obs-panel group flex h-full flex-col overflow-hidden transition-transform duration-700 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <BoxArt seed={c.title} label={c.title} className="h-24 w-full" />
          <div className="p-4"><h3 className="font-display !text-lg">{c.title}</h3><p className="mt-1 text-sm text-muted-foreground">{c.note}</p><p className="mt-2 text-sm text-primary">Browse →</p></div>
        </Link></li>)}
      </ul>
    </section>
  );
}
