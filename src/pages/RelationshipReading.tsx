import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { computeChart, fmtLon, SIGN_KEYWORDS } from '@/lib/astro';
import { toInput } from './RelationshipDetail';
import { useRelationships, type Relationship } from '@/hooks/useRelationships';
import { AuthGate } from '@/components/common/AuthGate';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { KuaWheel } from '@/components/fengshui/KuaWheel';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import type { ConfidenceLevel } from '@/content/confidence';
import { kuaNumber, groupOf, KUA_TABLE, KUA_ELEMENT } from '@/lib/kua';
import { DIR_NAME } from '@/content/fengshui';
import { interAspects, overlays, composite, signPair, animalRelation, dayMasterRelation, lifePath, LP_MEANING, lifePathPair, scoreSummary, elementOf, possessive, sharedGoodDirections } from '@/lib/synastry';
import { SelfGate } from '@/components/relationships/SelfGate';
import type { RelationshipSelf } from '@/hooks/useRelationshipSelf';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function RelationshipReading() {
  const { id } = useParams();
  const { items, loading } = useRelationships();
  const rel = items.find(r => r.id === id);
  usePageMeta(rel ? `Reading · You & ${rel.name} · Zodaci` : 'Relationship reading · Zodaci', 'A private relationship reading from two calculated birth charts.');
  return <AuthGate what="view relationship readings">{() => <SelfGate>{self => loading ? <p role="status">Loading…</p> : !rel ? <p>Not found. <Link className="underline" to="/relationships">All relationships</Link></p> : <ReadingBody rel={rel} self={self} />}</SelfGate>}</AuthGate>;
}

function Part({ n, title, level, note, children }: { n: string; title: string; level: ConfidenceLevel; note: string; children: React.ReactNode }) {
  return <section className="space-y-3"><div className="flex flex-wrap items-center gap-3 border-b border-gold/40 pb-2"><span className="font-smallcaps text-xs text-gold">{n}</span><h2 className="text-2xl flex-1">{title}</h2><ConfidenceBadge level={level} note={note} /></div>{children}</section>;
}

function ReadingBody({ rel, self }: { rel: Relationship; self: RelationshipSelf }) {
  const N = rel.name;
  const me = self.name; const myP = possessive(me); const my = me === 'You' ? 'your' : myP; const Me = me === 'You' ? 'You' : me;
  const A = self.chart;
  const B = useMemo(() => computeChart(toInput(rel)), [rel]);
  const ia = useMemo(() => interAspects(A, B, me, N), [A, B, me, N]);
  const sc = scoreSummary(ia); const comp = composite(A, B);
  const ov = overlays(B, A) ?? [];
  const kA = self.kua;
  const b = (c: typeof A, k: string) => c.bodies.find(x => x.key === k)!;
  const timed = !!rel.birth_time; const lvl: ConfidenceLevel = timed ? 'derived' : 'ambiguous';
  const yA = A.bazi.find(p => p.label.startsWith('Year'))!, yB = B.bazi.find(p => p.label.startsWith('Year'))!;
  const dA = A.bazi.find(p => p.label.startsWith('Day'))!, dB = B.bazi.find(p => p.label.startsWith('Day'))!;
  const an = animalRelation(yA.animal, yB.animal);
  const kB = kuaNumber(rel.birth_date, rel.sex);
  const lpA = lifePath(self.birth.date), lpB = lifePath(rel.birth_date);
  const top = ia[0]; const harm = ia.filter(x => x.tone !== 'tension').slice(0, 3), tens = ia.filter(x => x.tone === 'tension').slice(0, 3);
  const in7 = ov.filter(o => [5, 7, 8].includes(o.house));
  const cSun = comp[0], cMoon = comp.find(c => c.key === 'moon')!, cVen = comp.find(c => c.key === 'venus')!;
  const overall = sc.harmony + sc.fusion >= sc.tension ? 'more flowing than effortful' : 'energised by productive differences';
  const shared = kA && kB ? sharedGoodDirections(kA.kua, kB.kua) : [];

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Relationship reading</div>
        <h1 className="text-4xl">{Me} & {N} · The Reading</h1>
        <p className="text-muted-foreground max-w-3xl">Both charts, the contacts between them, the combined chart, the Four Pillars, numerology and the Feng Shui directions, brought together into one reading. Interpretations are written by the app from the calculations{self.isApril ? <>; for your own relationship chapters see <Link to="/guides/relationships" className="underline">Relationships in the Sources</Link></> : ''}.</p>
        <div className="flex gap-3 text-sm"><Link to={`/relationships/${rel.id}`} className="underline">← Relationship details</Link><Link to={`/relationships/${rel.id}/timeline`} className="underline">Timeline</Link></div>
      </header>

      <div className="grid md:grid-cols-2 gap-6"><div><h3 className="font-display text-xl mb-2">{Me}</h3><ChartWheel r={A} /></div><div><h3 className="font-display text-xl mb-2">{N}</h3><ChartWheel r={B} /></div></div>

      <Part n="I" title="The shape of the bond" level={lvl} note="Weighted from all planet-to-planet contacts.">
        <p>Across {ia.length} contacts the connection reads as <b>{overall}</b> (harmony {sc.harmony}, fusion {sc.fusion}, growth energy {sc.tension}). {top && <>The single strongest link is <b>{myP} {top.aName} {top.type.toLowerCase()} {N}’s {top.bName}</b> ({top.orb.toFixed(1)}°). {top.text}</>}</p>
        <p>{Me} {me === 'You' ? 'are' : 'is'} a {b(A, 'sun').sign} Sun with a {b(A, 'moon').sign} Moon{A.asc != null ? ` and ${fmtLon(A.asc).sign} Rising` : ''}; {N} is a {b(B, 'sun').sign} Sun with a {b(B, 'moon').sign} Moon{!timed && ' (uncertain without a birth time)'}{B.asc != null ? ` and ${fmtLon(B.asc).sign} Rising` : ''}. {signPair(b(A, 'sun').sign, b(B, 'sun').sign)}</p>
        <ReasoningPanel reasoning={{ inputs: [{ label: Me, value: `${self.birth.date} ${self.birth.time ?? '(no time)'} ${self.birth.placeLabel}` }, { label: N, value: `${rel.birth_date} ${rel.birth_time ?? '(no time)'} ${rel.place_label}` }], steps: [{ label: 'Contacts', detail: 'Every planet/angle pair checked for conjunction, opposition, trine, square, sextile.' }, { label: 'Weighting', detail: 'Personal planets and angles count more; tighter orbs count more.' }], output: overall, confidence: lvl, caveats: ['Interpretive summary, not quoted from the source PDFs.'] }} />
      </Part>

      <Part n="II" title="Love, attraction and emotional safety" level={lvl} note="Venus–Mars, Moon contacts and house overlays.">
        <p><b>Attraction:</b> {myP} Venus in {b(A, 'venus').sign} with {N}’s Mars in {b(B, 'mars').sign} — {signPair(b(A, 'venus').sign, b(B, 'mars').sign)} {N}’s Venus in {b(B, 'venus').sign} with {my} Mars in {b(A, 'mars').sign} — {signPair(b(B, 'venus').sign, b(A, 'mars').sign)}</p>
        <p><b>Feeling at home:</b> Moons in {b(A, 'moon').sign} and {b(B, 'moon').sign} ({elementOf(b(A, 'moon').sign)} and {elementOf(b(B, 'moon').sign)}).</p>
        {in7.length > 0 && <p><b>In {my} creativity, close-bond and shared-depth houses:</b> {in7.map(o => `${N}’s ${o.body.name} in the ${o.house}th`).join(', ')}. These are the parts of {N} {me === 'You' ? 'you' : me} may experience as especially personally significant.</p>}
      </Part>

      <Part n="III" title="Gifts and growing edges" level={lvl} note="Strongest harmonious and challenging contacts.">
        <div className="grid md:grid-cols-2 gap-3 text-sm"><ul className="parchment p-3 list-disc pl-6">{harm.map((x, i) => <li key={i}>{x.text}</li>)}</ul><ul className="parchment p-3 list-disc pl-6">{tens.map((x, i) => <li key={i}>{x.text}</li>)}</ul></div>
      </Part>

      <Part n="IV" title="The relationship as its own chart" level={lvl} note="Composite midpoints.">
        <p>The composite Sun in <b>{cSun.sign}</b> says the relationship exists to be {SIGN_KEYWORDS[cSun.sign]}. Its Moon in <b>{cMoon.sign}</b>{cMoon.uncertain ? ' (uncertain)' : ''} sets the emotional climate — {SIGN_KEYWORDS[cMoon.sign]}; composite Venus in <b>{cVen.sign}</b> shows how affection is expressed — {SIGN_KEYWORDS[cVen.sign]}.</p>
      </Part>

      <Part n="V" title="Chinese astrology: pillars in conversation" level="derived" note="Branch relationships and five-element cycle.">
        <p>{myP} {yA.animal} year meets {N}’s {yB.animal}: <b>{an.label}</b>. {an.text}</p>
        <p>{dayMasterRelation(dA.stemElement, dB.stemElement, me, N)}</p>
      </Part>

      <Part n="VI" title="Numbers" level="derived" note="Life Paths from birth dates.">
        <p>Life Path {lpA.n} ({LP_MEANING[lpA.n]}) with Life Path {lpB.n} ({LP_MEANING[lpB.n]}). {lifePathPair(lpA.n, lpB.n)}</p>
      </Part>

      <Part n="VII" title="The home you share · Bagua directions" level="derived" note={kA?.source === 'guide' ? 'Your Kua from your Feng Shui guide; the other person’s from the standard formula.' : 'Both Kua numbers from the standard Eight Mansions formula.'}>
        {kB && kA ? <>
          <p>{Me} {me === 'You' ? 'are' : 'is'} Kua {kA.kua} ({KUA_ELEMENT[kA.kua]}, {groupOf(kA.kua)} group); {N} is Kua {kB.kua} ({KUA_ELEMENT[kB.kua]}, {groupOf(kB.kua)} group). {groupOf(kB.kua) === groupOf(kA.kua) ? 'Your good directions overlap, so a shared bedroom and entrance are easy to arrange.' : `Your groups differ, so no direction is ideal for both of you${shared.length ? '' : ' (no shared good directions)'}.`} {shared.length > 0 && `Shared good directions: ${shared.map(d => DIR_NAME[d]).join(', ')}.`} For the bed, use {my} love direction, {DIR_NAME[KUA_TABLE[kA.kua]['Nien Yen']]}, or {N}’s, {DIR_NAME[KUA_TABLE[kB.kua]['Nien Yen']]}; at desks, each of you should face your own Sheng Chi: {Me} {DIR_NAME[KUA_TABLE[kA.kua]['Sheng Chi']]}, {N} {DIR_NAME[KUA_TABLE[kB.kua]['Sheng Chi']]}.</p>
          {kA.source === 'guide' && <p className="text-xs text-muted-foreground">Kua {kA.kua} is from your Feng Shui guide; the standard formula gives Kua {kA.formula ?? '—'}.</p>}
          <KuaWheel kua={kB.kua} label={N} />
          {self.isApril && <p className="text-xs"><Link to="/masterbook/bagua-wheel" className="underline">Your Bagua wheel (from your guide)</Link></p>}
        </> : !kA ? <p>Add your own sex in <Link to="/start" className="underline">your birth details</Link> to include Feng Shui directions.</p> : <p>Add {N}’s sex on the relationship page to include Feng Shui directions.</p>}
      </Part>
    </div>
  );
}
