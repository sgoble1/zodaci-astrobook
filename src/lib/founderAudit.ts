/** Founder preservation inventory: counts from the private editions (never text), compared with the last saved snapshot. */
export interface AuditArea { area: string; edition: string; chapters: number; indexed: number; words: number; error?: string }
export interface AuditFile { area: string; file: string; present: boolean }
export interface AuditSnapshot { areas: AuditArea[]; files: AuditFile[]; checkedAt: string }

export const AREA_LABEL: Record<string, string> = { masterbook: 'April · Masterbook', library: 'April · Source library', shane: 'Shane · Edition', zac: 'Zac · Edition' };

export type Flag = 'ok' | 'lost' | 'missing' | 'unindexed' | 'new';
export interface AreaRow extends AuditArea { label: string; was?: { chapters: number; words: number }; flags: Flag[] }

/** Flags: fewer chapters or words than last snapshot ("lost"), unreadable edition ("missing"), chapters not in the index ("unindexed"). */
export function compareAreas(now: AuditArea[], before: AuditArea[] | null | undefined): AreaRow[] {
  return now.map(a => {
    const prev = before?.find(b => b.area === a.area);
    const flags: Flag[] = [];
    if (a.error) flags.push('missing');
    if (prev && (a.chapters < prev.chapters || a.words < prev.words)) flags.push('lost');
    if (a.area !== 'library' && a.indexed > 0 && a.chapters > a.indexed) flags.push('unindexed');
    if (!prev && before) flags.push('new');
    if (!flags.length) flags.push('ok');
    return { ...a, label: AREA_LABEL[a.area] ?? a.area, was: prev ? { chapters: prev.chapters, words: prev.words } : undefined, flags };
  });
}

/** Stored files that are absent now, or were present in the snapshot and have since gone. */
export function missingFiles(now: AuditFile[], before: AuditFile[] | null | undefined): { file: AuditFile; vanished: boolean }[] {
  return now.filter(f => !f.present).map(f => ({ file: f, vanished: !!before?.some(b => b.area === f.area && b.file === f.file && b.present) }));
}
