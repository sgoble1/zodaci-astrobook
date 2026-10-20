import { it } from 'vitest';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { computeChart } from './astro';
import { buildComicIssue } from './comic';
import { panelPlan } from './comicPrint';
import { composeComicPdf, fontMeasure } from './comicPdf';
it('dump', async () => {
  const chart = computeChart({ date: '1992-03-14', time: '07:23', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles', placeLabel: 'Portland, OR', placeSource: 'geocoded', houseSystem: 'placidus' });
  const issue = buildComicIssue(chart, { reader: 'Olivia Chen', month: new Date(Date.UTC(2026, 10, 1)), issueNumber: 1 });
  const fontBytes = new Uint8Array(readFileSync('src/assets/fonts/manuscript.ttf'));
  const plan = panelPlan(issue, await fontMeasure(fontBytes));
  writeFileSync('/tmp/comic/plan.json', JSON.stringify(plan.map(s => ({ key: s.key, width: s.width, height: s.height }))));
  const art = new Map();
  plan.forEach((s, i) => { const f = `/tmp/comic/${s.key}.jpg`; if (existsSync(f) && i % 3 !== 1) art.set(s.key, { bytes: new Uint8Array(readFileSync(f)), width: s.width, height: s.height }); });
  const { bytes } = await composeComicPdf({ issue, fontBytes, art, mode: 'proof' });
  writeFileSync('/tmp/comic/proof.pdf', bytes);
  console.log('panels', plan.length, 'art', art.size, 'bytes', bytes.length);
}, 60000);
