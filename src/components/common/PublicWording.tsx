import { useEffect } from 'react';

// Public edition wording: pages originally written for April read as "you/your" for everyone else.
const RULES: [RegExp, string][] = [
  [/\bApril\s*(?:&|and)\s*Shane\b/g, 'you and the people you invite'],
  [/\bApril[’']s\b/g, 'your'],
  [/\b(for|to|with|about|of|help|helps|gives|shows|lets|tell|tells|ask) April\b/g, '$1 you'],
  [/\bApril\b/g, 'you'],
];
const fix = (t: string) => RULES.reduce((s, [r, v]) => s.replace(r, v), t).replace(/(^|[.!?]\s+)you\b/g, (_m, p) => `${p}You`).replace(/(^|[.!?]\s+)your\b/g, (_m, p) => `${p}Your`);
/** Elements marked data-keep-wording (e.g. the admin edition switch) keep their original names. */
const kept = (n: Node) => !!(n.nodeType === 3 ? n.parentElement : (n as Element)).closest?.('[data-keep-wording]');
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
