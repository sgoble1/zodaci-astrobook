import { ZODIAC, PLACEMENTS, HOUSES } from '@/content/april';
import {
  SABIAN_SYMBOLS, FIXED_STARS, ASTEROIDS, SPECIAL_ASPECTS,
  ARABIC_PARTS, PROFECTION_35, PRENATAL_ECLIPSE,
} from '@/content/compendium';
import { useState } from 'react';
export default function Compendium() {
  return (
    <div className="space-y-12">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Companion Volumes · Reference</div>
        <h1 className="font-display mt-2">The Master Compendium.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Reference tables from the compendium and supplementary volumes: the zodiac fundamentals, every placement with its dignity, and the rulership map of the houses. Sortable, scannable, all cross-linked to the interpretive pages.
        </p>
      </header>

      <section>
        <h2 className="font-display mb-4">Zodiac fundamentals</h2>
        <div className="overflow-x-auto border border-border rounded bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left font-smallcaps text-[10px]">
                <th className="px-3 py-2">Sign</th><th className="px-3 py-2">Glyph</th>
                <th className="px-3 py-2">Element</th><th className="px-3 py-2">Modality</th><th className="px-3 py-2">Ruler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {ZODIAC.map(z => (
                <tr key={z.name} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-display">{z.name}</td>
                  <td className="px-3 py-2 text-gold text-lg">{z.glyph}</td>
                  <td className="px-3 py-2">{z.element}</td>
                  <td className="px-3 py-2">{z.modality}</td>
                  <td className="px-3 py-2">{z.ruler}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4">Complete planetary positions & dignities</h2>
        <div className="overflow-x-auto border border-border rounded bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left font-smallcaps text-[10px]">
                <th className="px-3 py-2">Body</th><th className="px-3 py-2">Sign</th>
                <th className="px-3 py-2">Degree</th><th className="px-3 py-2">House</th>
                <th className="px-3 py-2">Motion</th><th className="px-3 py-2">Dignity & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {PLACEMENTS.map(p => (
                <tr key={p.key} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-display"><span className="text-gold mr-2">{p.glyph}</span>{p.name}</td>
                  <td className="px-3 py-2">{p.sign} {p.signGlyph}</td>
                  <td className="px-3 py-2">{p.degree}°{String(p.minute).padStart(2,'0')}′</td>
                  <td className="px-3 py-2">H{p.house}</td>
                  <td className="px-3 py-2">{p.motion}</td>
                  <td className="px-3 py-2">{p.dignity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4">House rulership quick reference</h2>
        <div className="overflow-x-auto border border-border rounded bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left font-smallcaps text-[10px]">
                <th className="px-3 py-2">House</th><th className="px-3 py-2">Cusp Sign</th>
                <th className="px-3 py-2">Ruler</th><th className="px-3 py-2">Tenants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {HOUSES.map(h => (
                <tr key={h.number} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-display text-gold">{h.number}</td>
                  <td className="px-3 py-2">{h.cusp}</td>
                  <td className="px-3 py-2">{h.ruler}</td>
                  <td className="px-3 py-2">{h.planets.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
