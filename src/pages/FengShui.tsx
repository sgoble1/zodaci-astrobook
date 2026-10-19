import { SourceChapters } from '@/components/common/SourceChapters';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BAGUA, KUA_INFO, type BaguaArea } from '@/content/april';
import baguaImg from '@/assets/bagua-map.jpg';

// 3x3 grid — index maps to compass direction
const gridOrder: BaguaArea['direction'][] = [
  'SE','S','SW',
  'E','Center','W',
  'NE','N','NW',
];

export default function FengShui() {
  const [selected, setSelected] = useState<BaguaArea>(BAGUA.find(b => b.direction === 'SE')!);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display mt-2">Kua {KUA_INFO.number} · Water · East Group.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Every gua of her home, calibrated to a Water Kua in the East Group. Click any of the nine areas to open the full guidance.
        </p>
        <div className="flex flex-wrap gap-4 text-sm mt-4">
          <Link to="/feng-shui/bagua" className="underline">Full Bagua & home guide: rooms, crystals, 12 weeks →</Link>
          <Link to="/feng-shui/flying-stars" className="underline">Flying Stars by year →</Link>
        </div>
      </header>

      <div className="p-6 border border-gold/40 rounded bg-card">
        <p className="text-sm leading-relaxed">{KUA_INFO.note}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div><span className="font-smallcaps text-[10px] text-gold">Best directions</span> · {KUA_INFO.bestDirections.join(', ')}</div>
          <div><span className="font-smallcaps text-[10px] text-muted-foreground">Difficult directions</span> · {KUA_INFO.worstDirections.join(', ')}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,1fr] gap-8 items-start">
        {/* Bagua grid */}
        <div>
          <div className="relative deckle bg-vellum p-2">
            <img src={baguaImg} alt="An ornate bagua map illustration with the eight trigrams and central tai ji" width={1200} height={1200} className="w-full h-auto opacity-25" loading="lazy" />
            <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-1">
              {gridOrder.map(dir => {
                const area = BAGUA.find(b => b.direction === dir)!;
                const isSel = selected.direction === dir;
                return (
                  <button key={dir} onClick={() => setSelected(area)}
                    className={`p-3 rounded border transition-all text-left backdrop-blur-sm ${
                      isSel ? 'border-gold bg-gold/25 shadow-[var(--shadow-gold)]'
                            : area.isBestForKua1 ? 'border-gold/40 bg-card/70 hover:border-gold'
                            : 'border-oxblood/40 bg-card/70 hover:border-oxblood'
                    }`}>
                    <div className="font-smallcaps text-[9px] text-muted-foreground">{area.direction}</div>
                    <div className="font-display text-sm mt-1 leading-tight">{area.gua}</div>
                    <div className="text-[10px] text-foreground/70 mt-1">{area.lifeArea}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 border border-gold/60 bg-gold/25 rounded-sm" /><span className="text-muted-foreground">Favorable · East group</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 border border-oxblood/60 rounded-sm" /><span className="text-muted-foreground">Suppress with utility use</span></div>
          </div>
        </div>

        {/* Detail */}
        <div className="lg:sticky lg:top-8 h-fit p-6 border border-gold/40 rounded bg-card gentle-fade" key={selected.direction}>
          <div className="font-smallcaps text-[11px] text-gold">{selected.direction} · {selected.element} · {selected.color}</div>
          <h2 className="font-display mt-2">{selected.gua} · {selected.lifeArea}</h2>
          <div className="gold-rule my-4 w-16" />
          <p className="text-foreground/85 leading-relaxed">{selected.guidance}</p>
          <div className={`mt-5 inline-block px-3 py-1 border rounded font-smallcaps text-[10px] ${
            selected.isBestForKua1 ? 'border-gold/60 text-gold' : 'border-oxblood/60 text-oxblood'
          }`}>
            {selected.isBestForKua1 ? 'Favorable for Kua 1' : 'One of her four negative directions'}
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-display mb-4">All nine areas</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {BAGUA.map(b => (
            <button key={b.direction} onClick={() => setSelected(b)}
              className={`text-left p-4 border rounded bg-card/60 hover:border-gold ${b.direction === selected.direction ? 'border-gold' : 'border-border'}`}>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-lg">{b.gua}</div>
                  <div className="text-xs text-muted-foreground">{b.lifeArea}</div>
                </div>
                <div className="font-smallcaps text-[10px] text-gold">{b.direction} · {b.element}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
      <SourceChapters match={/feng shui|kua|bagua|sacred space|flying star|element|direction/i} />
    </div>
  );
}
