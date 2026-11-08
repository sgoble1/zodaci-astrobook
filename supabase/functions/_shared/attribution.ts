/**
 * Placement attribution: every personality or life-pattern claim in a generated reading must name the chart
 * placement it comes from. Shared by the reading writers and tested in src/lib/attribution.test.ts.
 */
export const ATTRIBUTION_RULE = 'Every sentence that makes a claim about the reader’s personality, tendencies or life patterns must name the specific placement it comes from, for example: "You tend to process feelings privately before sharing them — this comes from your Moon in Capricorn in the 4th house." Use the placements listed above only, and leave out the house when the birth time is unknown. Never make a claim without naming its source placement.';

const CLAIM = /\byou(?:'re|’re| are)? (?:tend to|often|may|might|are likely to|likely|usually|probably|naturally)\b/i;
const SOURCE = /\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|chiron|node|nodes|lilith|rising|ascendant|descendant|midheaven|mc|ic|house|houses|ruler|stellium|aspect|conjunct|conjunction|square|trine|opposition|sextile|quincunx|aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|life path|day master|kua)\b/i;

/** Sentences outside headings, questions and lists of practices that make a "you tend to…" claim without naming a placement. */
export function unattributedClaims(markdown: string): string[] {
  const out: string[] = [];
  let skip = false;
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (/^#{1,6}\s/.test(line)) { skip = /reflection|question|practice|journal prompt/i.test(line); continue; }
    if (skip || !line) continue;
    for (const s of line.split(/(?<=[.!?])\s+/)) {
      if (s.trim().endsWith('?')) continue;
      if (CLAIM.test(s) && !SOURCE.test(s)) out.push(s.trim());
    }
  }
  return out;
}

/** One-line note for a writer's result when some claims are missing their placement. */
export const attributionNote = (n: number) => n > 0 ? `Quality check: ${n} ${n === 1 ? 'sentence' : 'sentences'} may need placement attribution.` : '';
