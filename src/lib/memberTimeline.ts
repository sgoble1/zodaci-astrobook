import type { ChartResult } from '@/lib/astro';
import { lifeCycles, type CycleEvent } from '@/lib/lifeCycles';

/**
 * A member's own Timeline Hall: the real cycle dates in their chart (returns, squares, oppositions), marked as
 * passed, current (within about a year either side of today) or ahead. Nothing here is biography — only timing.
 */
export type TimelineStatus = 'passed' | 'now' | 'ahead';
export type TimelineRow = CycleEvent & { status: TimelineStatus; year: number };

const YEAR = 365.2422 * 86400000;

export function timelineStatus(date: Date, now: Date): TimelineStatus {
  const d = date.getTime() - now.getTime();
  if (Math.abs(d) <= YEAR) return 'now';
  return d < 0 ? 'passed' : 'ahead';
}

export function memberTimeline(chart: ChartResult, now: Date = new Date()): TimelineRow[] {
  return lifeCycles(chart).map(e => ({ ...e, status: timelineStatus(e.date, now), year: e.date.getUTCFullYear() }));
}

/** The row to open first: the current cycle if there is one, otherwise the next one ahead, otherwise the last. */
export function openingRow(rows: TimelineRow[]): TimelineRow | undefined {
  return rows.find(r => r.status === 'now') ?? rows.find(r => r.status === 'ahead') ?? rows[rows.length - 1];
}
