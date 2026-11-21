import type { StaffId } from '@/lib/observatory';
import { StaffPortrait } from './StaffPortrait';
/** A staff member working quietly in the background of a header or divider. Decorative only. */
export function CastOperator({ id, className = '' }: { id: StaffId; className?: string }) {
  return <span aria-hidden="true" className={`cast-operator absolute ${className}`}><StaffPortrait id={id} size={88} /></span>;
}
