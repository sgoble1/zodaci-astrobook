import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { computeChart, fmtLon, SIGN_KEYWORDS, BODY_KEYWORDS, type ChartInput, type ChartResult } from '@/lib/astro';
import { APRIL, toParams } from './ChartCalculator';
import { useRelationships, saveRelationship, deleteRelationship, type Relationship } from '@/hooks/useRelationships';
import { AuthGate } from '@/components/common/AuthGate';
import { ChartWheel, starContacts } from '@/components/chart/ChartWheel';
import { KuaWheel } from '@/components/fengshui/KuaWheel';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';
import { Button } from '@/components/ui/button';
import { RelDocs } from '@/components/relationships/RelDocs';
import { useSession } from '@/hooks/useLibrary';
import { PersonForm } from '@/components/relationships/PersonForm';
import type { ConfidenceLevel } from '@/content/confidence';
import { kuaNumber, groupOf, KUA_TABLE, KUA_ELEMENT } from '@/lib/kua';
import { DIR_NAME } from '@/content/fengshui';
import { interAspects, overlays, composite, balance, signPair, animalRelation, dayMasterRelation, lifePath, LP_MEANING, lifePathPair, scoreSummary, HOUSE_THEME } from '@/lib/synastry';

const APRIL_KUA = 1; // As stated in the Feng Shui guide (Section 18A)

function Sec({ id, n, title, level, note, children }: { id: string; n: string; title: string; level: ConfidenceLevel; note: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <div className="module-heading border-b border-gold/40 pb-2">
        <span className="font-smallcaps text-xs text-gold">{n}</span><h2 className="min-w-0 text-2xl">{title}</h2>
        <div className="module-heading-actions"><ConfidenceBadge level={level} note={note} /><CopyLinkButton hash={id} label="Link" /></div>
      </div>
      {children}
    </section>
  );
}

export const toInput = (r: Relationship): ChartInput => ({ date: r.birth_date, time: r.birth_time, lat: r.lat, lon: r.lon, tz: r.tz, placeLabel: r.place_label, placeSource: 'geocoded', sex: r.sex });
const pillar = (c: ChartResult, l: string) => c.bazi.find(p => p.label.startsWith(l));

export default function RelationshipDetail() {
  const { id } = useParams();
  const { items, loading } = useRelationships();
  const rel = items.find(r => r.id === id);
  return (
    <AuthGate what="view relationships">
      {() => loading ? <p>Loading…</p> : !rel ? <p>Relationship not found. <Link to="/relationships" className="underline">All relationships</Link></p> : <Detail rel={rel} key={rel.id} />}
    </AuthGate>
  );
}

function Detail({ rel }: { rel: Relationship }) {
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(rel.notes);
  const [saved, setSaved] = useState('');
  const A = useMemo(() => computeChart(APRIL), []);
  const B = useMemo(() => computeChart(toInput(rel)), [rel]);
  const N = rel.name;
  const ia = useMemo(() => interAspects(A, B, 'April', N), [A, B, N]);
  const score = scoreSummary(ia);
  const ovAB = overlays(A, B), ovBA = overlays(B, A);
  const comp = composite(A, B);
  const balA = balance(A), balB = balance(B);
  const b = (c: ChartResult, k: string) => c.bodies.find(x => x.key === k)!;
  const timeKnown = !!rel.birth_time;
  const lvl: ConfidenceLevel = timeKnown ? 'derived' : 'ambiguous';
  const kB = kuaNumber(rel.birth_date, rel.sex);
  const kA = kuaNumber(APRIL.date, 'female');
  const yA = pillar(A, 'Year')!, yB = pillar(B, 'Year')!, dA = pillar(A, 'Day')!, dB = pillar(B, 'Day')!;
  const animal = animalRelation(yA.animal, yB.animal);
  const lpA = lifePath(APRIL.date), lpB = lifePath(rel.birth_date);
  const stars = starContacts(B);
  const top = ia.slice(0, 40);
  const harmonyTop = ia.filter(x => x.tone !== 'tension').slice(0, 5), tensionTop = ia.filter(x => x.tone === 'tension').slice(0, 5);
  const needKeys = new Set(['moon', 'venus', 'mars', 'saturn']);
  const aprilNeeds = ia.filter(x => needKeys.has(x.aKey)).slice(0, 4);
  const otherNeeds = ia.filter(x => needKeys.has(x.bKey)).slice(0, 4);
  const tightLinks = ia.filter(x => x.orb < 1).slice(0, 5);
  const coincidences = [
    b(A, 'sun').sign === b(B, 'sun').sign ? `Both Suns are in ${b(A, 'sun').sign}.` : '',
    b(A, 'moon').sign === b(B, 'moon').sign ? `Both Moons are in ${b(A, 'moon').sign}${timeKnown ? '.' : ' (the untimed Moon makes this provisional).'}` : '',
    A.asc != null && B.asc != null && fmtLon(A.asc).sign === fmtLon(B.asc).sign ? `Both Rising signs are ${fmtLon(A.asc).sign}.` : '',
    yA.animal === yB.animal ? `Both Chinese year signs are ${yA.animal}.` : '',
    dA.stemElement === dB.stemElement ? `Both Day Masters use the ${dA.stemElement} element.` : '',
    lpA.n === lpB.n ? `Both Life Paths calculate to ${lpA.n}.` : '',
    kB && groupOf(kB.kua) === groupOf(APRIL_KUA) ? `Both Kua numbers belong to the ${groupOf(APRIL_KUA)} group.` : '',
  ].filter(Boolean);
  const distanceKm = (() => { const rad = (v: number) => v * Math.PI / 180; const dLat = rad(rel.lat - APRIL.lat), dLon = rad(rel.lon - APRIL.lon); const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(APRIL.lat)) * Math.cos(rad(rel.lat)) * Math.sin(dLon / 2) ** 2; return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))); })();

  const saveNotes = async () => { setSaved('Saving…'); try { await saveRelationship({ id: rel.id, notes }); setSaved('Saved'); } catch (e) { setSaved((e as Error).message); } };

  if (editing) return <div className="space-y-4"><h1 className="text-3xl">Edit {N}</h1><PersonForm initial={rel} submitLabel="Save changes" onSave={async p => { await saveRelationship({ ...p, id: rel.id }); setEditing(false); }} /><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>;

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Relationship · {rel.relation}</div>
        <h1 className="text-4xl">April & {N}</h1>
        <p className="text-muted-foreground">{N}: born {rel.birth_date}{timeKnown ? ` at ${rel.birth_time}` : ' (time unknown — noon used)'} in {rel.place_label} · {rel.sex === 'unspecified' ? 'sex not given' : rel.sex}. April: 6 Sept 1990, 3:38 PM, Geneva NY.</p>
        <div className="flex flex-wrap gap-2">{B.flags.map((f, i) => <ConfidenceBadge key={i} level={f.level} note={`${f.topic}: ${f.note}`} />)}</div>
        <nav className="flex flex-wrap gap-3 text-xs pt-2">{[['chart', 'Their chart'], ['elements', 'Positions'], ['bazi', 'Ba Zi'], ['kua', 'Feng Shui'], ['overview', 'Overview'], ['needs', 'Needs & connections'], ['synastry', 'Contacts'], ['overlays', 'House overlays'], ['composite', 'Composite'], ['chinese', 'Chinese match'], ['numbers', 'Numerology'], ['notes', 'Notes']].map(([h, l]) => <a key={h} href={`#${h}`} className="underline">{l}</a>)}</nav>
        <div className="flex flex-wrap gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit details</Button>
          <Button size="sm" asChild><Link to={`/relationships/${rel.id}/reading`}>Relationship reading</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to={`/relationships/${rel.id}/timeline`}>Timeline</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/guides/relationships">Relationship sources</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to={`/reading?${toParams(toInput(rel))}`}>{N}’s full reading</Link></Button>
          <Button size="sm" variant="ghost" onClick={async () => { if (confirm(`Delete ${N}?`)) { await deleteRelationship(rel.id); nav('/relationships'); } }}>Delete</Button></div>
      </header>

      <Sec id="chart" n="I" title={`${N}’s natal chart`} level={lvl} note="Calculated with the same ephemeris as the Chart Calculator.">
        <ChartWheel r={B} />
        {B.asc != null ? <p><b>Rising {fmtLon(B.asc).sign}</b> ({SIGN_KEYWORDS[fmtLon(B.asc).sign]}) · Midheaven {fmtLon(B.mc!).text}</p> : <p className="text-oxblood text-sm">No birth time: Rising sign, Midheaven and houses aren’t calculated.</p>}
      </Sec>

      <Sec id="elements" n="II" title={`${N}’s positions and their meanings`} level={lvl} note="Meanings are short in-app keyword notes, not quotes from the source documents.">
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">{B.bodies.map(x => <li key={x.key} className="parchment p-3"><b>{x.glyph} {x.name} {x.deg}°{String(x.min).padStart(2, '0')}′ {x.sign}</b>{x.house ? ` · house ${x.house}` : ''}{x.retro && !x.key.includes('Node') ? ' · Rx' : ''} <ConfidenceBadge compact level={x.confidence} note={x.note} /><p>{BODY_KEYWORDS[x.key] ?? ''} expressed as {SIGN_KEYWORDS[x.sign]}{x.house ? `, in the area of ${HOUSE_THEME[x.house]}` : ''}.</p></li>)}</ul>
        <h3 className="text-xl pt-2">{N}’s strongest natal aspects</h3>
        <ul className="text-sm grid sm:grid-cols-2 gap-1">{B.aspects.slice(0, 14).map((a, i) => <li key={i}>{a.a} {a.symbol} {a.b} <span className="text-muted-foreground">({a.type}, {a.orb.toFixed(1)}°)</span></li>)}</ul>
        <p className="text-sm">Elements: {Object.entries(balB.el).map(([k, v]) => `${k} ${v}`).join(' · ')} — Modes: {Object.entries(balB.mo).map(([k, v]) => `${k} ${v}`).join(' · ')}</p>
      </Sec>

      <Sec id="bazi" n="III" title={`${N}’s Four Pillars (Ba Zi)`} level={timeKnown ? 'derived' : 'ambiguous'} note="Standard sexagenary calculation; the Hour pillar needs a birth time.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{B.bazi.map(p => <div key={p.label} className="parchment p-3"><div className="font-smallcaps text-[10px] text-gold">{p.label}</div><div className="font-display text-2xl">{p.stem}{p.branch} {p.romanized}</div><div className="text-xs text-muted-foreground">{p.polarity} {p.stemElement} · {p.animal}</div><p className="text-[11px] mt-1">{p.note}</p></div>)}</div>
        <p className="text-sm">Day Master (the self): <b>{dB.polarity} {dB.stemElement}</b> · Year animal: <b>{yB.animal}</b> · Element count: {Object.entries(B.elements).map(([k, v]) => `${k} ${v}`).join(', ')}.</p>
      </Sec>

      <Sec id="kua" n="IV" title="Feng Shui · Kua directions" level="derived" note="Standard Eight Mansions formula; needs sex.">
        {kB ? <><KuaWheel kua={kB.kua} label={N} /><ReasoningPanel reasoning={{ inputs: [{ label: 'Birth date', value: rel.birth_date }, { label: 'Sex', value: rel.sex }], steps: kB.steps.map((s, i) => ({ label: `Step ${i + 1}`, detail: s })), output: `Kua ${kB.kua}`, confidence: 'derived', caveats: [] }} />
          <div className="parchment p-4 text-sm space-y-1"><b>Living together:</b> {groupOf(kB.kua) === groupOf(APRIL_KUA) ? `Both are in the ${groupOf(APRIL_KUA)} group, so your good directions overlap.` : `April (Kua ${APRIL_KUA}, ${groupOf(APRIL_KUA)}) and ${N} (Kua ${kB.kua}, ${groupOf(kB.kua)}) are in different groups, so your best directions don’t overlap. Usual remedy: each of you faces your own best direction at your desk; for the bed, choose one partner’s Nien Yen (love) direction.`}
            <p>Shared good directions: {(() => { const g = (k: number) => Object.values(KUA_TABLE[k]).slice(0, 4); const s = g(APRIL_KUA).filter(d => g(kB.kua).includes(d)); return s.length ? s.map(d => DIR_NAME[d]).join(', ') : 'none'; })()}. April’s relationship direction: {DIR_NAME[KUA_TABLE[APRIL_KUA]['Nien Yen']]}; {N}’s: {DIR_NAME[KUA_TABLE[kB.kua]['Nien Yen']]}.</p>
            <p className="text-xs text-muted-foreground">April’s Kua 1 is from her Feng Shui guide. The standard female formula would give her Kua {kA?.kua} ({KUA_ELEMENT[kA!.kua]}); the guide’s value is used here.</p></div></>
          : <p className="text-sm">Add {N}’s sex (Edit details) to calculate their Kua number and directions.</p>}
      </Sec>

      <Sec id="overview" n="V" title="Relationship overview" level={lvl} note="Weighted summary of the contacts between the two charts; interpretive.">
        <div className="grid sm:grid-cols-3 gap-3 text-center">{([['Harmony', score.harmony], ['Fusion (conjunctions)', score.fusion], ['Growth energy', score.tension]] as const).map(([l, v]) => <div key={l} className="parchment p-3"><div className="font-display text-3xl">{v}</div><div className="text-xs">{l}</div></div>)}</div>
        <ul className="text-sm space-y-1">
          <li><b>Sun & Sun:</b> {signPair(b(A, 'sun').sign, b(B, 'sun').sign)}</li>
          <li><b>Moon & Moon:</b> {signPair(b(A, 'moon').sign, b(B, 'moon').sign)} {!timeKnown && <ConfidenceBadge compact level="ambiguous" note="Their Moon sign may change without a birth time." />}</li>
          <li><b>April’s Venus & {N}’s Mars:</b> {signPair(b(A, 'venus').sign, b(B, 'mars').sign)}</li>
          <li><b>{N}’s Venus & April’s Mars:</b> {signPair(b(B, 'venus').sign, b(A, 'mars').sign)}</li>
          <li><b>Chinese years:</b> {yA.animal} & {yB.animal}: {animal.label}.</li>
        </ul>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="parchment p-3"><h3 className="text-lg">Strengths</h3><ul className="list-disc pl-5">{harmonyTop.map((x, i) => <li key={i}>{x.text}</li>)}</ul></div>
          <div className="parchment p-3"><h3 className="text-lg">Growth opportunities</h3><ul className="list-disc pl-5">{tensionTop.map((x, i) => <li key={i}>{x.text}</li>)}</ul></div>
        </div>
      </Sec>

      <Sec id="needs" n="V½" title="Needs, connections & coincidences" level={lvl} note="Built from saved birth facts and the calculated chart contacts shown on this page; interpretation is symbolic, not a claim about lived events.">
        <p className="text-sm text-muted-foreground">This reads the connection in both directions. It does not assume either person’s private history, family story, or behavior.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="parchment p-4"><h3 className="text-lg">How {N} connects with April’s needs</h3>{aprilNeeds.length ? <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">{aprilNeeds.map((x, i) => <li key={`${x.aKey}-${x.bKey}-${i}`}>{x.text}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No major Moon, Venus, Mars, or Saturn contact falls within the chart’s chosen limits.</p>}</div>
          <div className="parchment p-4"><h3 className="text-lg">How April connects with {N}’s needs</h3>{otherNeeds.length ? <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">{otherNeeds.map((x, i) => <li key={`${x.aKey}-${x.bKey}-${i}`}>{x.text}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No major Moon, Venus, Mars, or Saturn contact falls within the chart’s chosen limits.</p>}</div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div><h3 className="text-lg">Strongest exact links</h3>{tightLinks.length ? <ul className="mt-2 space-y-2 text-sm">{tightLinks.map((x, i) => <li key={`${x.aKey}-${x.bKey}-${i}`}><b>April {x.aName} {x.symbol} {N} {x.bName}</b> · {x.orb.toFixed(2)}° apart<p>{x.text}</p></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No major contact is tighter than 1°.</p>}</div>
          <div><h3 className="text-lg">Shared patterns</h3>{coincidences.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{coincidences.map(x => <li key={x}>{x}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No exact same-sign or same-number pattern appears in these calculations. Connection can still show through aspects and differences.</p>}</div>
        </div>
        <div className="rounded-md border border-border p-4 text-sm"><h3 className="text-lg">Birthplace facts</h3><p>April: Geneva, New York. {N}: {rel.place_label}. The saved coordinates are about {distanceKm.toLocaleString()} km ({Math.round(distanceKm * 0.621371).toLocaleString()} miles) apart in a straight line.</p><p className="mt-1 text-xs text-muted-foreground">This is geography only. AstroBook does not turn birthplace distance or a matching place name into a personality claim.</p></div>
      </Sec>

      <Sec id="synastry" n="VI" title="Planet-to-planet contacts (synastry)" level={lvl} note="Orbs: conjunction/opposition 7°, trine/square 6°, sextile 4°. With no birth time, Moon contacts over 3° are left out.">
        <p className="text-sm text-muted-foreground">{ia.length} contacts found; strongest first.</p>
        <ul className="space-y-1 text-sm">{top.map((x, i) => <li key={i} className="border-b border-border/50 pb-1"><b>April {x.aName} {x.symbol} {N} {x.bName}</b> <span className="text-xs text-muted-foreground">{x.type} · {x.orb.toFixed(1)}° · {x.tone}</span>{x.uncertain && <ConfidenceBadge compact level="ambiguous" note="Involves an untimed Moon." />}<p>{x.text}</p></li>)}</ul>
      </Sec>

      <Sec id="overlays" n="VII" title="House overlays" level={timeKnown ? 'derived' : 'ambiguous'} note="Which area of life each person’s planets light up in the other’s chart.">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><h3 className="text-lg">{N}’s planets in April’s houses</h3><ul>{ovBA!.map(o => <li key={o.body.key}>{o.body.glyph} {o.body.name} → house {o.house} <span className="text-muted-foreground">({o.theme})</span></li>)}</ul></div>
          <div><h3 className="text-lg">April’s planets in {N}’s houses</h3>{ovAB ? <ul>{ovAB.map(o => <li key={o.body.key}>{o.body.glyph} {o.body.name} → house {o.house} <span className="text-muted-foreground">({o.theme})</span></li>)}</ul> : <p className="text-muted-foreground">Needs {N}’s birth time.</p>}</div>
        </div>
      </Sec>

      <Sec id="composite" n="VIII" title="Composite chart (the relationship itself)" level={lvl} note="Midpoint of each pair of planets.">
        <ul className="grid sm:grid-cols-2 gap-1 text-sm">{comp.map(c => <li key={c.key}>{c.glyph} Composite {c.name}: <b>{c.text}</b> — {SIGN_KEYWORDS[c.sign]} {c.uncertain && <ConfidenceBadge compact level="ambiguous" note="Moon uncertain without a birth time." />}</li>)}</ul>
        <p className="text-sm">Composite Sun in <b>{comp[0].sign}</b>: the relationship’s purpose feels {SIGN_KEYWORDS[comp[0].sign]}. Composite Venus in <b>{comp.find(c => c.key === 'venus')!.sign}</b> describes how love is shown within it.</p>
        <p className="text-sm">Elements side by side — April: {Object.entries(balA.el).map(([k, v]) => `${k} ${v}`).join(', ')} · {N}: {Object.entries(balB.el).map(([k, v]) => `${k} ${v}`).join(', ')}.</p>
      </Sec>

      <Sec id="chinese" n="IX" title="Chinese astrology match" level="derived" note="Classic branch relationships and the five-element cycle.">
        <p><b>{yA.animal} (April) & {yB.animal} ({N}): {animal.label}.</b> {animal.text}</p>
        <p><b>Day Masters:</b> April {dA.polarity} {dA.stemElement} ({dA.romanized}) & {N} {dB.polarity} {dB.stemElement} ({dB.romanized}). {dayMasterRelation(dA.stemElement, dB.stemElement, 'April', N)}</p>
        <p className="text-xs text-muted-foreground">April’s Day pillar here is the calculator’s value; the site’s Ba Zi page gives a different Day pillar (see Data Quality).</p>
      </Sec>

      <Sec id="numbers" n="X" title="Numerology" level="derived" note="Life Path from the full birth date.">
        <p>April: Life Path <b>{lpA.n}</b> ({LP_MEANING[lpA.n]}). {N}: Life Path <b>{lpB.n}</b> ({LP_MEANING[lpB.n]}) — {lpB.steps}.</p>
        <p>{lifePathPair(lpA.n, lpB.n)}</p>
        {stars.length > 0 && <><h3 className="text-lg">Fixed stars on {N}’s chart</h3><ul className="text-sm">{stars.map((s, i) => <li key={i}>★ {s.star.name} conjunct {s.point} ({s.orb.toFixed(1)}°): {s.star.meaning}</li>)}</ul></>}
      </Sec>

      <Sec id="docs" n="X½" title={`Documents for ${N}`} level="confirmed" note="Your uploaded files; each becomes a Masterbook document with sections.">
        <DocsBlock rel={rel} />
      </Sec>

      <Sec id="notes" n="XI" title="Notes" level="confirmed" note="Your own notes, saved to your account.">
        <textarea className="w-full min-h-40 border rounded p-3 bg-background" maxLength={20000} value={notes} onChange={e => { setNotes(e.target.value); setSaved(''); }} />
        <div className="flex items-center gap-3"><Button onClick={saveNotes}>Save notes</Button><span className="text-sm text-muted-foreground">{saved}</span></div>
      </Sec>
    </div>
  );
}

function DocsBlock({ rel }: { rel: Relationship }) {
  const session = useSession();
  return session ? <RelDocs rel={rel} userId={session.user.id} /> : null;
}
