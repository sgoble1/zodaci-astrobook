import { fmtLon, type ChartResult } from '@/lib/astro';
import { buildComicIssue, CAST, type ComicIssue, type ComicPage, type ComicPanel } from '@/lib/comic';

/** Presentation alias only: never changes a saved profile, edition owner or birth fact. */
export const previewName = (name: string) => /^shane\b/i.test(name.trim()) ? 'Julian Mercer' : name;
export type StoryFactor = { page: number; kind: 'placement' | 'aspect' | 'point' | 'transit'; key: string; sign?: string; house?: number; retro?: boolean; orb?: number; measured: string };
export type NarrativeIssue = ComicIssue & { factors: StoryFactor[] };

const SIGN_ACTION: Record<string, string> = {
  Aries: 'Let’s try it. We can learn something from the first attempt.', Taurus: 'First, make it steady. I want something we can rely on.',
  Gemini: 'Tell me both versions. The difference might be the useful part.', Cancer: 'Before we go on, is everyone all right?',
  Leo: 'I’ll stand beside the signal. Nobody has to begin alone.', Virgo: 'There’s one small detail we haven’t checked.',
  Libra: 'Let’s hear the other side before we choose.', Scorpio: 'The surface looks fine. I want to see what is underneath.',
  Sagittarius: 'There must be another route. Let’s look beyond this hill.', Capricorn: 'One sound piece at a time. Then we test the load.',
  Aquarius: 'What if we build it differently, so everybody can use it?', Pisces: 'I can almost hear the missing phrase. Give me a quiet minute.',
};
const ROOMS = ['entrance terrace', 'supply bench', 'neighborhood relay room', 'foundation chamber', 'experimental drawing room', 'maintenance workshop', 'agreement table', 'shared archive', 'hilltop research station', 'public signal desk', 'community assembly room', 'sheltered service tunnel'];
const TASK: Record<string, [string, string, string]> = {
  sun: ['The First Light', 'Sovereign holds the first route marker. A beginning needs courage, but not an audience that agrees with every move.', 'We can start without knowing the whole road.'],
  moon: ['A Steady Lamp', 'Dreamer sets a lamp on the bench. Nobody repairs a signal well while pretending not to need a pause.', 'Sit with me a minute. Nothing here needs you to rush.'],
  mercury: ['The Missing Line', 'Messenger spreads two message strips beside each other. A hurried answer would be easy. A faithful one takes another reading.', 'I’d rather ask again than send the wrong thing.'],
  venus: ['Worth Keeping', 'Enchantress considers the route marker. A pleasing design is not enough; somebody has to choose what it is for.', 'Do we like this because it works, or because we’re used to it?'],
  mars: ['The Quiet Repair', 'Warrior finds a loose conduit. Force would make a louder scene. Careful effort might actually keep the lamp burning.', 'I’m not here to win against the machine. I’m here to get it working.'],
  jupiter: ['The Other Route', 'Philosopher unfolds a second map. A wider view is useful only if it leaves room for the person standing across the table.', 'Show me what I’m missing. I brought a pencil, not a verdict.'],
  saturn: ['A Promise That Holds', 'Elder sets down the clock. He does not punish the unfinished work. He asks what can honestly be promised today.', 'Small is fine. Say what you can do, and then do that.'],
  uranus: ['A Different Circuit', 'Rebel notices a connection everybody has been stepping around. He lifts the casing instead of blaming the people using it.', 'The old design isn’t sacred. The people relying on it matter.'],
  neptune: ['The Shape of a Sound', 'Mystic listens with the others. She sketches what the signal seems to say, then leaves space for the test to disagree.', 'A beautiful idea still deserves a careful check.'],
  pluto: ['Below the Surface', 'Transformer kneels beside the foundation. Nothing has to be torn down for spectacle. Only the part that cannot hold the load needs replacing.', 'We can keep what’s sound. We don’t have to keep everything.'],
};
const RELATION: Record<string, [string, string]> = {
  Conjunction: ['At the Same Bench', 'They arrive with different tools but the same piece of work. Neither can pretend the other is not there.'],
  Opposition: ['Both Banks of the River', 'Each has a clear view from one bank. The bridge will fail if they build it from only one side.'],
  Square: ['The Crossed Routes', 'Their good plans meet at a corner neither can pass. They stop, change the joint, and try again.'],
  Trine: ['The Current That Helps', 'One hands over the tool just as the other reaches for it. Help comes easily; they still have to use it.'],
  Sextile: ['The Side Door', 'A small door opens between their workrooms. It stays only an opening until somebody walks through.'],
};

/** Full preview narrative; astronomy stays in the existing engine. Fictional actions are not inferred biography. */
export function buildComicPreview(chart: ChartResult, opts: Parameters<typeof buildComicIssue>[1]): NarrativeIssue {
  const base = buildComicIssue(chart, { ...opts, reader: previewName(opts.reader) });
  const hero = previewName(opts.reader).trim() || 'Reader';
  const timed = Boolean(chart.input.time && chart.asc != null);
  const factors: StoryFactor[] = [];
  const pages: ComicPage[] = [];
  const add = (title: string, scene: string, caption: string, who: string, words: string, artSlot: string, section = 'The Midnight Signal') => {
    const n = pages.length + 1;
    const character = CAST.find(c => c.name === who);
    const splash = n === 2 || n === 21;
    const shape = n % 3 === 0 ? 'tall' : n % 3 === 1 ? 'square' : 'wide';
    const panels: ComicPanel[] = [
      { shape, scene, caption, artSlot },
      { shape: 'square', scene: character ? `${who} considers the next choice at the station.` : scene, balloons: [{ who, text: words }], artSlot: character ? `cast:${character.key}` : 'detail' },
      { shape: shape === 'square' ? 'wide' : 'square', scene: `${hero} studies the instrument beside the revised drawing.`, caption: character ? `${hero} sets the suggestion beside the drawing before acting.` : 'The revised drawing stays beside the tools.', artSlot: character?.key === 'moon' ? 'lamp' : 'drawing' },
    ];
    if (splash) {
      panels.splice(0, panels.length, { shape: 'bleed', scene, caption, balloons: [{ who, text: words }], artSlot: 'terrace' });
    } else if (n >= 13 && n <= 16) {
      panels[0].shape = 'wide';
      panels[2].shape = 'square';
      panels.push({ shape: 'wide', scene: 'Two revised routes meet at the signal console.', caption: 'They test the connection together, rather than calling agreement a finished repair.', artSlot: 'detail' });
    }
    pages.push({ n, section, title, panels });
    return n;
  };
  pages.push({ ...base.pages[0], title: 'The Midnight Signal', panels: [{ shape: 'bleed', scene: 'Researcher at a brass signal console beneath an atomic compass orbit.', caption: `${hero} · Issue ${opts.issueNumber}`, artSlot: 'cover' }] });
  add('An Unfinished Message', 'An observatory signal falters above a quiet hill terrace.', `${hero} comes to the station with a drawing, not a prophecy. Tonight’s task is simple to name and harder to do: make a signal clear enough for somebody else to receive.`, hero, 'I don’t need it to sound impressive. I need it to mean what we send.', 'terrace');
  for (const c of CAST) {
    const b = chart.bodies.find(x => x.key === c.key);
    if (!b || (c.key === 'moon' && !timed)) {
      add('A Pause Without a Label', 'A lamp stands beside an unassigned workbench.', 'Some information is missing. Nobody fills the empty space with a confident guess.', hero, 'Leave that part open. We can still work with what we know.', 'lamp');
      continue;
    }
    const task = TASK[c.key];
    const room = timed && b.house ? ROOMS[b.house - 1] : 'observatory workshop';
    const settings: Record<string, string> = { sun: 'console', moon: 'lamp', mercury: 'drawing', venus: 'archive', mars: 'conduit', jupiter: 'bridge', saturn: 'detail', uranus: 'circuit', neptune: 'agreement', pluto: 'foundation' };
    const slot = settings[c.key] ?? 'workshop';
    const review = b.retro ? ` ${c.name} returns to the earlier draft before proceeding.` : ` ${c.name} tests the next step in the work.`;
    const n = add(task[0], `${c.name} works in the ${room}.`, `${task[1]}${review}`, c.name, `${SIGN_ACTION[b.sign] ?? task[2]} ${b.retro ? 'Wait. I want to check the choice we made before this one.' : task[2]}`, slot);
    factors.push({ page: n, kind: 'placement', key: b.key, sign: b.sign, ...(timed && b.house ? { house: b.house } : {}), retro: Boolean(b.retro), measured: `${b.name} · ${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′${b.retro ? ' · apparent retrograde motion' : ''}${timed && b.house ? ` · house ${b.house}` : ''}` });
  }
  const names = new Set(CAST.map(c => c.planet));
  const aspects = chart.aspects.filter(a => names.has(a.a) && names.has(a.b) && RELATION[a.type]).sort((a, b) => a.orb - b.orb).slice(0, 4);
  for (let i = 0; i < 4; i++) {
    const a = aspects[i];
    const [title, turn] = a ? RELATION[a.type] : ['The Open Bench', 'They test another connection rather than assuming a result.'];
    const ca = CAST.find(c => c.planet === a?.a), cb = CAST.find(c => c.planet === a?.b);
    const n = add(title, `${ca?.name ?? 'The researcher'} and ${cb?.name ?? 'Elder'} test the signal connection.`, turn, ca?.name ?? hero, a?.type === 'Square' ? 'Your plan matters. So does the part that won’t fit mine. Let’s work on that joint.' : a?.type === 'Opposition' ? 'I can’t see your bank from here. Tell me what the water is doing on your side.' : 'I can help with that. Put the work between us.', a?.type === 'Opposition' || a?.type === 'Square' ? 'bridge' : 'agreement');
    if (a) factors.push({ page: n, kind: 'aspect', key: `${a.a}/${a.b}/${a.type}`, orb: a.orb, measured: `${a.a} ${a.type.toLowerCase()} ${a.b} · orb ${a.orb.toFixed(2)}°` });
  }
  const point = (key: string, title: string, text: string, dialogue: string) => {
    const b = timed ? chart.bodies.find(x => x.key === key) : undefined;
    const n = add(title, 'The researcher works at an experimental drawing bench.', text, hero, dialogue, 'drawing');
    if (b) factors.push({ page: n, kind: 'point', key, sign: b.sign, house: b.house ?? undefined, retro: Boolean(b.retro), measured: `${b.name} · ${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′${b.house ? ` · house ${b.house}` : ''}` });
  };
  const chiron = timed ? chart.bodies.find(b => b.key === 'chiron') : undefined;
  point('chiron', 'Room for an Uneven Line', chiron ? `At the ${chiron.house ? ROOMS[chiron.house - 1] : 'workbench'}, a line on the drawing wobbles. It is a reason to practise, not evidence of an old wound somebody else can name.` : 'An uneven line is allowed to remain a question. No personal history is supplied to explain it.', 'I can be seen learning. I don’t have to make the first version perfect.');
  const node = timed ? chart.bodies.find(b => b.key === 'northNode') : undefined;
  point('northNode', 'A Route Worth Trying', node ? `A fresh route opens through the ${node.house ? ROOMS[node.house - 1] : 'workshop'}. ${SIGN_ACTION[node.sign] ?? 'The researcher chooses an experiment.'}` : 'They leave a fresh route unlabelled until the missing information is supplied.', 'Let’s make something we can actually try, instead of another answer we only admire.');
  const influence = base.influence;
  const visitor = CAST.find(c => c.key === influence?.key);
  const visitorPage = add('The Hand Behind the Signal', influence?.scene ?? 'Sovereign sets a route marker beside the signal console.', `${visitor?.name ?? 'Sovereign'} stays at the controls while the researcher works. The altered signal changes what the team must respond to; it does not decide their answer for them.`, hero, influence?.response ?? 'Let’s check the connection before we send it.', visitor ? `cast:${visitor.key}` : 'console');
  factors.push({ page: visitorPage, kind: 'transit', key: influence?.key ?? 'sun', retro: influence?.retro, measured: influence?.measured ?? 'Sun-led fictional opening motif; no exact transit claimed.' });
  add('A Signal Somebody Can Hear', 'The full cast gathers around the repaired signal console.', 'They make one more test after the adjustment. The receiver answers. Nobody has solved a whole life; somebody has finally heard the message they meant to send.', hero, 'There. That’s what I meant. Thank you for staying with it.', 'ensemble');
  add('Morning at the Station', 'Researcher looks toward the observatory at dawn.', 'There will be another message. For now, the drawing can rest beside the tools. A story can offer a question without answering your life for you.', hero, 'What did I keep? What did I reconsider? That’s enough to take home tonight.', 'terrace');
  pages.push({ n: 22, section: 'Calculation Ledger', title: 'The Drawing Beneath the Story', panels: [{ shape: 'wide', scene: 'Brass instrument and source drawing.', artSlot: 'drawing' }], body: [
    'Fictional scenes, not a record of the reader’s life. Signs inform manner; timed houses choose workrooms; close aspects shape cooperation or friction; apparent backward motion leads a character to reconsider. The background operator represents a separate calculated sky contact, not evidence that planets cause events.',
    ...factors.filter(f => f.kind === 'placement').map(f => `p.${f.page} · ${f.measured}`),
  ] });
  pages.push({ n: 23, section: 'Calculation Ledger', title: 'Connections and Open Questions', panels: [{ shape: 'wide', scene: 'The revised drawing on the signal desk.', artSlot: 'detail' }], body: [
    ...(timed && chart.asc != null ? [`Recorded birth time ${chart.input.time} · ${chart.input.placeLabel} · Rising ${fmtLon(chart.asc).sign}${chart.mc != null ? ` · Midheaven ${fmtLon(chart.mc).sign}` : ''}. Houses: ${chart.input.houseSystem ?? 'placidus'}.`] : ['Birth time unknown: no Moon-sign, house, Ascendant or Midheaven claims.']),
    ...factors.filter(f => f.kind !== 'placement').map(f => `p.${f.page} · ${f.measured}`),
    ...[...(opts.dreamDates ?? [])].sort().slice(-1).map(date => `Optional owner-selected reflection: you saved a dream from ${date} for your comic. What from it is still with you? The dream's text is not included.`),
    'Astronomy Engine positions; historical time-zone conversion. Measured positions do not prove symbolic interpretations. Astrological insights provided for entertainment and self-reflection purposes only.',
  ] });
  pages.push({ n: 24, section: 'Back Cover', title: `${hero} · ${base.monthLabel}`, panels: [{ shape: 'bleed', scene: 'Dawn at the observatory.', artSlot: 'terrace' }], body: ['Zodaci AstroComic · The Midnight Signal', 'An illustrative preview, not a print-ready buyer issue.'] });
  pages[0].section = 'Cover';
  return { ...base, reader: hero, title: 'The Midnight Signal', mainEvent: 'The Hand Behind the Signal', pages, factors };
}

/** Called only with an already authorized edition chart; public and member composers never set edition identity. */
export function buildFounderComic(chart: ChartResult, edition: 'april' | 'shane' | 'zac', opts: Parameters<typeof buildComicIssue>[1]): NarrativeIssue {
  const issue = buildComicPreview(chart, opts);
  const titles = { april: 'The Relay Room', shane: 'The Midnight Signal', zac: 'The Far-Bank Receiver' };
  issue.edition = edition;
  issue.title = titles[edition];
  issue.pages[0] = { ...issue.pages[0], title: issue.title, panels: [{ ...issue.pages[0].panels[0], caption: `${issue.reader} · Private edition · Issue ${issue.issueNumber}` }] };
  return issue;
}