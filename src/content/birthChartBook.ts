// Links from chart points to their full chapter in "The Official Astrological Birth Chart Book"
// (Masterbook part, entry ids bcb-XX generated from the uploaded .docx).
export const BCB_CHAPTER: Record<string, { id: string; label: string }> = {
  asc: { id: 'bcb-03', label: 'Ch. 1 · Rising Sign' },
  sun: { id: 'bcb-04', label: 'Ch. 2 · Sun' },
  moon: { id: 'bcb-05', label: 'Ch. 3 · Moon' },
  mercury: { id: 'bcb-06', label: 'Ch. 4 · Mercury' },
  venus: { id: 'bcb-07', label: 'Ch. 5 · Venus' },
  mars: { id: 'bcb-08', label: 'Ch. 6 · Mars' },
  jupiter: { id: 'bcb-09', label: 'Ch. 7 · Jupiter' },
  saturn: { id: 'bcb-10', label: 'Ch. 8 · Saturn' },
  uranus: { id: 'bcb-11', label: 'Ch. 9 · Capricorn Stellium' },
  neptune: { id: 'bcb-11', label: 'Ch. 9 · Capricorn Stellium' },
  pluto: { id: 'bcb-12', label: 'Ch. 10 · Pluto' },
  northNode: { id: 'bcb-13', label: 'Ch. 11 · North Node' },
  southNode: { id: 'bcb-13', label: 'Ch. 11 · North Node' },
  chiron: { id: 'bcb-14', label: 'Ch. 12 · Chiron' },
};

/** Links shown in the wheel's detail panel for April's chart. */
export const aprilSourcesFor = (key: string) => {
  const out: { label: string; href: string }[] = [];
  const ch = BCB_CHAPTER[key];
  if (ch) out.push({ label: `Birth Chart Book — ${ch.label}`, href: `/masterbook/${ch.id}` });
  if (!['asc', 'mc', 'northNode', 'southNode'].includes(key)) out.push({ label: 'Planet page', href: `/planets/${key}` });
  return out;
};
