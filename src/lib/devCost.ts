// Build (Lovable) credit cost. One dollar rate, one snapshot; admins can override the snapshot in platform_settings.
export const DOLLARS_PER_BUILD_CREDIT = 0.35;

export type BuildCreditSnapshot = {
  periodLabel: string;
  /** Workspace credits spent in the current billing period. */
  usedThisPeriod: number;
  /** Credits left in the workspace when the snapshot was taken. */
  remaining: number;
  /** Every credit ever granted to the workspace (plans + top-ups); used − remaining gives credits spent to date. */
  grantedToDate: number;
  takenOn: string;
};

/** Read from the workspace credit balance; never live. Admin → Build costs can replace it. */
export const BUILD_CREDIT_SNAPSHOT: BuildCreditSnapshot = {
  periodLabel: 'Oct 29 – Nov 29, 2026',
  usedThisPeriod: 816,
  remaining: 139.8,
  grantedToDate: 6758.01,
  takenOn: 'Nov 6, 2026',
};

export const BUILD_COST_SETTING_KEY = 'build_credit_snapshot';

export const creditCost = (credits: number) => Math.round(credits * DOLLARS_PER_BUILD_CREDIT * 100) / 100;

export const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Credits spent to date across the workspace (granted minus what is left). */
export const spentToDate = (s: BuildCreditSnapshot) => Math.max(0, Math.round((s.grantedToDate - s.remaining) * 100) / 100);

export function buildCostLine(s: BuildCreditSnapshot = BUILD_CREDIT_SNAPSHOT) {
  return `Build credits: ${s.usedThisPeriod} used this billing period (${s.periodLabel}) = ${formatUsd(creditCost(s.usedThisPeriod))} at ${formatUsd(DOLLARS_PER_BUILD_CREDIT)}/credit; ${s.remaining} remaining (${formatUsd(creditCost(s.remaining))}). Snapshot ${s.takenOn}.`;
}

/** Open build work with a rough credit estimate each, so the cost to finish can be shown. Estimates, not quotes. */
export type OpenWorkItem = { id: string; label: string; credits: number; blockedBy?: string };
export const OPEN_WORK: OpenWorkItem[] = [
  { id: 'reader-3col', label: 'Three-column AstroBook reader and member page layouts', credits: 18 },
  { id: 'context-engine', label: 'Context editing from Current Chapter and the full personal-context tool', credits: 14 },
  { id: 'founder-art', label: 'Founder illustrations and menu polish (Gaps 4–6, 12, 44, 46)', credits: 16 },
  { id: 'member-pages', label: 'Restyle Learn, Compatibility, sign-in, Counselors, Readings, Retrogrades, Community', credits: 22 },
  { id: 'content', label: 'More articles, Demo finish and full Forecast Center', credits: 16 },
  { id: 'a11y', label: 'Accessibility pass, page titles and the remaining checks', credits: 10 },
  { id: 'comics', label: 'Personal AstroComic Issue #1 and Issue #2', credits: 40, blockedBy: 'AI credits for writing and drawing' },
  { id: 'shane', label: 'Shane’s 63 corrected Masterbook chapters', credits: 45, blockedBy: 'AI credits; runs through Shane’s account' },
];

export const openWorkCredits = (items: OpenWorkItem[] = OPEN_WORK) => items.reduce((n, i) => n + i.credits, 0);

/** Validate an admin-entered snapshot; returns null when any figure is missing or negative. */
export function parseSnapshot(v: unknown): BuildCreditSnapshot | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const num = (k: string) => (typeof o[k] === 'number' && Number.isFinite(o[k]) && (o[k] as number) >= 0 ? (o[k] as number) : null);
  const used = num('usedThisPeriod'), rem = num('remaining'), granted = num('grantedToDate');
  if (used === null || rem === null || granted === null) return null;
  const text = (k: string) => (typeof o[k] === 'string' && (o[k] as string).trim() ? (o[k] as string).trim().slice(0, 60) : null);
  return { usedThisPeriod: used, remaining: rem, grantedToDate: granted, periodLabel: text('periodLabel') ?? BUILD_CREDIT_SNAPSHOT.periodLabel, takenOn: text('takenOn') ?? BUILD_CREDIT_SNAPSHOT.takenOn };
}
