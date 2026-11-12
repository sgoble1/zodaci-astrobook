import { useEffect } from 'react';

// Public edition wording: pages originally written for April read as "you/your" for everyone else.
// The month is never the person: "April 16, 1989", "16 April", "April 2027" and month lists keep the word.
const MONTH = /\b(?:January|February|March|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/;
const PERSON = String.raw`(?<!\d[\s,.-]*)\bApril\b(?![\s,.-]*\d)`;
const RULES: [RegExp, string][] = [
  [new RegExp(String.raw`${PERSON}\s*(?:&|and)\s*Shane\b`, 'g'), 'you and the people you invite'],
  [new RegExp(String.raw`${PERSON}[’']s\b`, 'g'), 'your'],
  [new RegExp(String.raw`\b(for|to|with|about|of|help|helps|gives|shows|lets|tell|tells|ask) ${PERSON}`, 'g'), '$1 you'],
  [new RegExp(PERSON, 'g'), 'you'],
];
/** Rewrites April-specific wording to "you"; dates, month lists and date pickers keep the month name. */
export const fix = (t: string) => MONTH.test(t) ? t : RULES.reduce((s, [r, v]) => s.replace(r, v), t).replace(/(^|[.!?]\s+)you\b/g, (_m, p) => `${p}You`).replace(/(^|[.!?]\s+)your\b/g, (_m, p) => `${p}Your`);
/** Elements marked data-keep-wording (e.g. the admin edition switch) keep their original names. */
const kept = (n: Node) => !!(n.nodeType === 3 ? n.parentElement : (n as Element)).closest?.('[data-keep-wording], option, time, select');
const ATTRS = ['aria-label', 'title', 'alt', 'placeholder'];

function walk(root: Node) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const v = n.nodeValue;
    if (v && v.includes('April') && !kept(n)) n.nodeValue = fix(v);
  }
  if (root instanceof Element) root.querySelectorAll('*').forEach(el => ATTRS.forEach(a => { const v = el.getAttribute(a); if (v?.includes('April')) el.setAttribute(a, fix(v)); }));
}

export function PublicWording() {
  useEffect(() => {
    walk(document.body);
    if (document.title.includes('April')) document.title = fix(document.title);
    const obs = new MutationObserver(ms => ms.forEach(m => {
      if (m.type === 'characterData') { if (m.target.nodeValue?.includes('April') && !kept(m.target)) m.target.nodeValue = fix(m.target.nodeValue); }
      else m.addedNodes.forEach(n => (n.nodeType === 3 ? n.nodeValue?.includes('April') && !kept(n) && (n.nodeValue = fix(n.nodeValue!)) : walk(n)));
    }));
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, []);
  return null;
}
