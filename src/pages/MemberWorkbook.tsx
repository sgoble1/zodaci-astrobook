import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { computeChart, SIGN_KEYWORDS, type BodyPos } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { MemberAnswer } from '@/components/workbook/MemberAnswer';
import { FounderSourcePanel } from '@/components/readings/FounderSourcePanel';

const ELEMENT: Record<string, string> = { Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth', Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water' };
const ELEMENT_PRACTICE: Record<string, string> = {
  Fire: 'Move first, then decide: a 10-minute walk or workout before a hard choice burns off restlessness so the real answer can show.',
  Earth: 'Touch something real: cook, garden, tidy one drawer. Your nervous system settles through the hands, not through more thinking.',
  Air: 'Talk it out or write it out. Speaking a feeling aloud to one trusted person (or a page) turns fog into a clear sentence.',
  Water: 'Name the feeling before fixing it. Sit for two minutes, put a hand on your chest, and say "right now I feel…" before you act.',
};
const HOUSE_AREA = ['', 'self & appearance', 'money & self-worth', 'thinking & siblings', 'home & roots', 'creativity & joy', 'daily routine & health', 'partners', 'shared resources & intimacy', 'beliefs & travel', 'career & reputation', 'friends & hopes', 'rest & the inner life'];

/** Members' own workbook: every module title and exercise is derived from their calculated chart. */
export default function MemberWorkbook({ birth, focus }: { birth: MyBirth; focus?: string }) {
  const chart = useMemo(() => computeChart(toChartInput(birth)), [birth]);
  const b = (k: string) => chart.bodies.find(x => x.key === k) as BodyPos | undefined;
  const sun = b('sun'), moon = b('moon'), mercury = b('mercury'), venus = b('venus'), mars = b('mars'), saturn = b('saturn'), node = b('northNode');
  const ascSign = chart.asc != null ? ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(chart.asc / 30)] : null;
  const dominant = Object.entries(chart.elements).sort((a, b) => b[1] - a[1])[0]?.[0];
  const weakest = Object.entries(chart.elements).sort((a, b) => a[1] - b[1])[0]?.[0];
  const where = (p?: BodyPos) => p ? `${p.sign}${p.house ? `, house ${p.house} (${HOUSE_AREA[p.house]})` : ''}` : '';
  const hard = chart.aspects.filter(a => ['Square', 'Opposition'].includes(a.type)).slice(0, 3);

  const modules = [
    moon && { id: 'check-in', title: `Daily Check-in · Your ${moon.sign} Moon`, why: `Your Moon in ${where(moon)} describes what you need to feel safe: ${SIGN_KEYWORDS[moon.sign]}.`, steps: [`Rate your energy 1–10 and name one feeling.`, `Ask: "What would a ${moon.sign} Moon need right now?" — e.g. ${ELEMENT_PRACTICE[ELEMENT[moon.sign]]}`, moon.house ? `Notice how ${HOUSE_AREA[moon.house]} affected your mood today.` : 'Notice which part of your day moved your mood most.'] },
    mercury && { id: 'reframe', title: `Thought Reframe · ${mercury.sign} Mercury`, why: `Mercury in ${where(mercury)} is how your mind talks to you: ${SIGN_KEYWORDS[mercury.sign]}.`, steps: ['Write the worried thought word for word.', `Ask what evidence a fair ${mercury.sign} mind would want before believing it.`, 'Rewrite it as one kinder, truer sentence.'] },
    sun && { id: 'purpose', title: `Purpose Practice · ${sun.sign} Sun`, why: `Your Sun in ${where(sun)} is where you feel most alive.`, steps: [`List three moments this month you felt ${SIGN_KEYWORDS[sun.sign].split(', ').slice(0, 2).join(' and ')}.`, sun.house ? `Pick one small action in ${HOUSE_AREA[sun.house]} for this week.` : 'Pick one small action that feels like "you" this week.', 'At week’s end, note what changed.'] },
    venus && { id: 'love', title: `Love & Connection · ${venus.sign} Venus`, why: `Venus in ${where(venus)} shows how you give and receive care.`, steps: [`Name the last time you felt truly appreciated. Was it ${SIGN_KEYWORDS[venus.sign].split(', ')[0]}?`, 'Tell one person what makes you feel valued, in one sentence.', 'Do one thing for beauty or pleasure, just for yourself.'] },
    mars && { id: 'anger', title: `Drive & Anger · ${mars.sign} Mars`, why: `Mars in ${where(mars)} is how you assert yourself and what frustration feels like.`, steps: ['Recall a recent frustration. Where did you feel it in your body?', `A ${mars.sign} Mars does best by being ${SIGN_KEYWORDS[mars.sign].split(', ')[0]} — plan one clean, direct ask.`, 'Spend the energy physically within 24 hours.'] },
    saturn && { id: 'mastery', title: `Mastery & Fear · ${saturn.sign} Saturn`, why: `Saturn in ${where(saturn)} marks where life asks for patience and earns lasting strength.`, steps: [saturn.house ? `Write your biggest fear about ${HOUSE_AREA[saturn.house]}.` : 'Write your biggest fear about responsibility.', 'Break it into the smallest step you could take in 15 minutes.', 'Track that step daily for two weeks.'] },
    ascSign && { id: 'social', title: `Social Integration · ${ascSign} Rising`, why: `Your ${ascSign} Ascendant is the first impression others meet — ${SIGN_KEYWORDS[ascSign]}.`, steps: ['Ask a friend for three words describing how you come across.', 'Compare them to how you feel inside — where is the gap?', 'Practise one opening line that lets the inside show a little more.'] },
    node && { id: 'growth', title: `Growth Direction · North Node in ${node.sign}`, why: `The North Node in ${where(node)} points to qualities that feel unfamiliar but grow you.`, steps: [`Pick one ${node.sign} quality (${SIGN_KEYWORDS[node.sign]}) to try once this week.`, 'Notice your resistance without judging it.', 'Write what you learned.'] },
    weakest && { id: 'balance', title: `Balance · Strengthen your ${weakest}`, why: `Your chart leans ${dominant}; ${weakest} is least represented, so practices of that element can round you out.`, steps: [ELEMENT_PRACTICE[weakest], 'Do it three times this week.', 'Note any difference in sleep, mood or focus.'] },
    hard.length > 0 && { id: 'tension', title: 'Working with your inner tensions', why: 'Squares and oppositions are friction between parts of you — they are where most growth happens.', steps: hard.map(a => `${a.a} ${a.type.toLowerCase()} ${a.b} (orb ${a.orb.toFixed(1)}°): write one situation where these two needs pulled against each other, and one way to honour both.`) },
  ].filter(Boolean) as { id: string; title: string; why: string; steps: string[] }[];

  const shown = focus ? modules.filter(m => m.id === focus).concat(modules.filter(m => m.id !== focus)) : modules;
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-muted-foreground">Your workbook</div>
        <h1 className="font-display text-4xl">Exercises built from your chart</h1>
        <p className="text-muted-foreground max-w-2xl">Each module is named after a placement in your own birth chart and explains, in plain language, why that exercise fits you. Nothing here is copied from another person’s chart.</p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {shown.map((m, i) => (
          <motion.section key={m.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.05 }} className={`rounded-lg border bg-card/60 p-5 space-y-3 ${focus === m.id ? 'border-primary ring-1 ring-primary/40' : 'border-border'}`}>
            <h2 className="font-display text-xl">{m.title}</h2>
            <p className="text-sm text-muted-foreground">{m.why}</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm">{m.steps.map(s => <li key={s}>{s}</li>)}</ol>
            <MemberAnswer module={m.id} question={m.steps.join('\n')} />
          </motion.section>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Want to talk any of this through? <Link className="text-primary underline" to="/chat">Open SmartChat</Link>.</p>
      <FounderSourcePanel theme={focus === 'check-in' ? 'core-emotions' : focus === 'reframe' ? 'mind' : 'practices'} />
    </article>
  );
}
