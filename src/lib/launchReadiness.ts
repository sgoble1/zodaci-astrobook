/** Launch-readiness rules: each check turns real system signals into Ready / Needs action / Waiting on you. */
export type CheckState = 'ready' | 'action' | 'external' | 'unknown';
export type Check = { id: string; label: string; state: CheckState; detail: string; tab?: string };

export type Signals = {
  payments: { reachable: boolean; activeSubscriptions?: number } | null;
  lulu: { configured: boolean; connected: boolean; environment: string; webhook: boolean } | null;
  admins: number | null;
  maintenance: boolean | null;
};

export function launchChecks(s: Signals): Check[] {
  const pay: Check = !s.payments ? { id: 'payments', label: 'Payment provider connection', state: 'unknown', detail: 'Could not reach the payment provider. Retry in a moment.', tab: 'stripe' }
    : s.payments.reachable ? { id: 'payments', label: 'Payment provider connection', state: 'ready', detail: `Provider reachable · ${s.payments.activeSubscriptions ?? 0} active subscriptions. Reachable isn't the same as proven — record a test purchase below.`, tab: 'stripe' }
    : { id: 'payments', label: 'Payment provider connection', state: 'action', detail: 'Live payments are not answering. Finish payment setup before launch.', tab: 'stripe' };
  const lulu: Check = !s.lulu ? { id: 'lulu', label: 'AstroBook printing (Lulu)', state: 'unknown', detail: 'Printing status could not load.', tab: 'orders' }
    : !s.lulu.configured ? { id: 'lulu', label: 'AstroBook printing (Lulu)', state: 'external', detail: 'Add your Lulu account keys to print books automatically. Orders can still be fulfilled by hand.', tab: 'orders' }
    : !s.lulu.connected ? { id: 'lulu', label: 'AstroBook printing (Lulu)', state: 'action', detail: 'Lulu keys are saved but the connection failed. Check the keys.', tab: 'orders' }
    : s.lulu.environment !== 'production' ? { id: 'lulu', label: 'AstroBook printing (Lulu)', state: 'action', detail: 'Connected to Lulu test mode — nothing is really printed yet.', tab: 'orders' }
    : !s.lulu.webhook ? { id: 'lulu', label: 'AstroBook printing (Lulu)', state: 'action', detail: 'Live printing works, but status updates from Lulu are not registered.', tab: 'orders' }
    : { id: 'lulu', label: 'AstroBook printing (Lulu)', state: 'ready', detail: 'Live printing with status updates registered. Record a printed sample below once one arrives.', tab: 'orders' };
  const admins: Check = s.admins == null ? { id: 'admins', label: 'Admin access', state: 'unknown', detail: 'Admin list could not load.', tab: 'settings' }
    : s.admins >= 1 ? { id: 'admins', label: 'Admin access', state: 'ready', detail: `${s.admins} admin account${s.admins === 1 ? '' : 's'}.`, tab: 'settings' }
    : { id: 'admins', label: 'Admin access', state: 'action', detail: 'No admin accounts found.', tab: 'settings' };
  const maint: Check = s.maintenance == null ? { id: 'maintenance', label: 'Site open to visitors', state: 'unknown', detail: 'Settings could not load.', tab: 'settings' }
    : s.maintenance ? { id: 'maintenance', label: 'Site open to visitors', state: 'action', detail: 'Maintenance mode is on — visitors see the maintenance notice.', tab: 'settings' }
    : { id: 'maintenance', label: 'Site open to visitors', state: 'ready', detail: 'Maintenance mode is off.', tab: 'settings' };
  return [pay, lulu, admins, maint,
    { id: 'email', label: 'Email sending', state: 'external', detail: 'Needs a sender domain before newsletters, digests and shipping emails can go out.', tab: 'newsletter' },
    { id: 'comic-printer', label: 'AstroComic printing', state: 'external', detail: 'Needs a printer account; print files are ready to export.', tab: 'comic' },
    { id: 'social-proof', label: 'Testimonials', state: 'external', detail: 'Add real customer quotes when you have them — none are invented.' },
  ];
}

/** Proof the owner records after doing the real thing once; dated so stale evidence is visible. */
export type ProofRecord = { date: string; note?: string };
export type ProofDef = { id: string; label: string; how: string; maxAgeDays?: number };
export const PROOFS: ProofDef[] = [
  { id: 'test-purchase', label: 'Test purchase completed', how: 'Buy one AstroBook or plan in test mode and confirm it shows as paid in Orders.' },
  { id: 'pdf-delivery', label: 'Finished PDF downloaded', how: 'Open the paid test order and download the final PDF from the member account.' },
  { id: 'print-sample', label: 'Printed sample inspected', how: 'Order one printed copy and check cover, margins and binding.' },
  { id: 'email-sender', label: 'Email sender verified', how: 'Send one test email from the branded sender domain and confirm it arrives.' },
  { id: 'security-review', label: 'Security review run', how: 'Run the security scan and resolve or explain every finding.', maxAgeDays: 90 },
];
const DAY = 24 * 60 * 60 * 1000;

/** No record → still waiting; a valid date → ready; an expired review → needs action. Unparseable dates never count as proof. */
export function proofCheck(def: ProofDef, record: ProofRecord | undefined, now = Date.now()): Check {
  const base = { id: `proof-${def.id}`, label: def.label };
  const t = record ? Date.parse(record.date) : NaN;
  if (!record || Number.isNaN(t) || t > now + DAY) return { ...base, state: 'external', detail: def.how };
  const when = new Date(t).toLocaleDateString(undefined, { dateStyle: 'medium' });
  if (def.maxAgeDays && now - t > def.maxAgeDays * DAY) return { ...base, state: 'action', detail: `Last done ${when} — older than ${def.maxAgeDays} days. Run it again.` };
  return { ...base, state: 'ready', detail: `Proven ${when}${record.note ? ` · ${record.note}` : ''}.` };
}

export function parseProofs(value: unknown): Record<string, ProofRecord> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, ProofRecord> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v && typeof v === 'object' && typeof (v as ProofRecord).date === 'string') out[k] = { date: (v as ProofRecord).date, note: typeof (v as ProofRecord).note === 'string' ? (v as ProofRecord).note!.slice(0, 200) : undefined };
  }
  return out;
}
