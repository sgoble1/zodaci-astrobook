import { CAST, type ComicPanel } from '@/lib/comic';
import type { NarrativeIssue } from '@/lib/comicNarrative';

type Mission = { title: string; object: string; opening: string; request: string; result: string; closing: string; art: string };
/** Edition identity selects a fictional setting, never a personality or a private birth fact. */
const MISSIONS: Record<'april' | 'shane' | 'zac', Mission> = {
  april: { title: 'The Relay Room', object: 'relay message', opening: 'Two copies of a message arrive at the relay room. One sentence differs. The crew is waiting for an answer, but sending the easier version would leave somebody unheard.', request: 'Read that bit back to me. I want to know what we’re agreeing to.', result: 'The receiver reads the corrected sentence back. It matches. The crew can move without pretending that the first version was good enough.', closing: 'I’m glad we stopped. Being understood matters more than being quick.', art: 'drawing' },
  shane: { title: 'The Midnight Signal', object: 'signal drawing', opening: 'A new signal drawing works beautifully on paper. At the console, the lamp will not stay lit. The researcher wants to make something dependable, not defend a clever first attempt.', request: 'I still like the idea. I just need it to work when someone else uses it.', result: 'The lamp stays lit after the researcher steps away. Another pair of hands repeats the test. The drawing is no longer only an idea its maker can explain.', closing: 'That’s the part I wanted. It holds even when I’m not standing beside it.', art: 'console' },
  zac: { title: 'The Far-Bank Receiver', object: 'receiver connection', opening: 'The near-bank receiver sounds clear. Across the water, the reply breaks apart. A crossing cannot be called finished just because it works from this side.', request: 'Before we add anything, can we hear what they’re getting over there?', result: 'A reply comes from the far bank, complete this time. The crew tests both directions before packing away the spare cable. Working together has become something they can hear.', closing: 'Now ask them to send it back. I want to know it works both ways.', art: 'bridge' },
};

const OPERATIONS: Record<string, string> = {
  sun: 'sets the route marker and opens the public signal desk',
  moon: 'adjusts the shelter lamp and clears a quiet bench beside the receiver',
  mercury: 'sorts the message strips and changes the order reaching the desk',
  venus: 'sets two designs beside the available supplies, making their trade-offs visible',
  mars: 'opens the service conduit and exposes the joint carrying the load',
  jupiter: 'unfolds a wider route map and opens a spare channel',
  saturn: 'sets the load gauge and limits the next test to what the frame can hold',
  uranus: 'switches the old circuit onto an unfamiliar connection',
  neptune: 'adjusts the receiver filter so a faint second sound can be heard',
  pluto: 'opens the foundation casing and reveals the failed support beneath it',
};

export function influenceMotion(influence: NarrativeIssue['influence']): ComicPanel['motion'] {
  if (!influence?.date) return undefined; // An unmeasured motif never masquerades as a calculated event.
  if (influence.retro) return 'reconsider';
  if (influence.aspect === 'Square' || influence.aspect === 'Opposition') return 'crosscurrent';
  return 'signal';
}

/** Enrich only newly composed, already-authorized founder previews; saved buyer scripts are untouched. */
export function refineFounderStory(issue: NarrativeIssue, edition: 'april' | 'shane' | 'zac'): NarrativeIssue {
  const mission = MISSIONS[edition];
  const operator = CAST.find(c => c.key === issue.influence?.key) ?? CAST[0];
  const contactMotion = influenceMotion(issue.influence);
  const pages = issue.pages.map(page => {
    if (page.n === 1) return { ...page, title: mission.title, panels: page.panels.map(p => ({ ...p, caption: `${issue.reader} · Private edition · Issue ${issue.issueNumber}` })) };
    if (page.n >= 22) return page.n === 24 ? { ...page, body: [`Zodaci AstroComic · ${mission.title}`, ...(page.body ?? []).slice(1)] } : page;
    const factor = issue.factors.find(f => f.page === page.n);
    let panels: ComicPanel[] = page.panels.map(p => ({ ...p, balloons: p.balloons?.map(b => ({ ...b })) }));
    if (factor?.kind === 'placement') {
      const character = CAST.find(c => c.key === factor.key);
      if (character) {
        const room = panels[0].scene.replace(/^.*?works in the /, '').replace(/\.$/, '');
        const operation = OPERATIONS[factor.key] ?? 'checks the controls';
        panels[0] = { ...panels[0], scene: `${character.name} stays behind the controls in the ${room} and ${operation}.`, caption: `${character.name} ${operation}. ${factor.retro ? 'An earlier setting is restored; the crew must check what still fits.' : 'The changed equipment gives the crew a new choice.'}` };
        panels[1] = { ...panels[1], scene: `${character.name} works the equipment behind ${issue.reader}, who considers the ${mission.object}.`, balloons: panels[1].balloons?.map(b => ({ ...b, who: issue.reader })) };
        panels[2] = { ...panels[2], caption: `${issue.reader} tries the adjustment on the ${mission.object}, rather than letting the operator choose the answer.` };
        // Use verified apparent motion, not edition-name assumptions, to distinguish the action.
        panels[0].motion = factor.retro ? 'reconsider' : 'signal';
      }
    }
    if (factor?.kind === 'aspect') {
      const [a, b, relationship] = factor.key.split('/');
      const first = CAST.find(c => c.planet === a), second = CAST.find(c => c.planet === b);
      const condition = relationship === 'Square' ? 'Two working routes meet at a joint that will not fit.' : relationship === 'Opposition' ? 'The two receivers return different halves of the same message.' : relationship === 'Conjunction' ? 'Two inputs arrive on the same channel; neither can simply be muted.' : relationship === 'Trine' ? 'A spare current reaches the bench just when it is needed.' : 'A side channel opens, but it still needs somebody to connect it.';
      panels[0] = { ...panels[0], scene: `${first?.name ?? 'The operator'} and ${second?.name ?? 'the crew'} work separate controls behind the bench. ${condition}`, caption: condition, motion: relationship === 'Square' || relationship === 'Opposition' ? 'crosscurrent' : 'signal' };
      panels[1] = { ...panels[1], balloons: panels[1].balloons?.map(b => ({ ...b, who: issue.reader })) };
      panels[2] = { ...panels[2], caption: `${issue.reader} tests the ${mission.object} against both inputs. Neither operator decides the response.` };
    }
    if (page.n === 2) {
      panels = [{ ...panels[0], scene: `${operator.name} works the controls behind the ${mission.object}. ${issue.influence?.action ?? 'A lamp lights beside the unfinished work'}.`, caption: `${issue.reader} arrives at the station. ${mission.opening}`, balloons: [{ who: issue.reader, text: mission.request }], artSlot: mission.art, motion: contactMotion }];
    }
    if (page.n === 19) {
      const target = issue.factors.find(f => f.kind === 'placement' && f.key === issue.influence?.natalKey);
      const earlier = target ? pagesafe(issue, target.page)?.panels[1].balloons?.[0].text : undefined;
      panels[0] = { ...panels[0], motion: contactMotion, caption: `${operator.name} changes the equipment behind the bench. The ${mission.object} must now work under that setting, not only under the easier test.` };
      panels[2] = { ...panels[2], caption: 'The researcher returns to the earlier test with the new input left on.', balloons: earlier ? [{ who: issue.reader, text: earlier.split(/(?<=[.!?])\s/)[0] }] : undefined };
    }
    if (page.n === 20) {
      panels[0] = { ...panels[0], caption: mission.result, motion: 'signal' };
      panels[1] = { ...panels[1], balloons: [{ who: issue.reader, text: mission.closing }] };
      panels[2] = { ...panels[2], caption: 'They leave the changed input on for one more test. The repair must hold with the actual difficulty still present.' };
    }
    if (page.n === 21) panels[0] = { ...panels[0], caption: `The ${mission.object} rests beside the tools. This fictional job is finished; the researcher’s choices remain their own.`, balloons: [{ who: issue.reader, text: 'What helped? What would I do differently? I can take that with me.' }] };
    return { ...page, section: mission.title, panels };
  });
  return { ...issue, edition, title: mission.title, pages };
}

const pagesafe = (issue: NarrativeIssue, n: number) => issue.pages.find(page => page.n === n);