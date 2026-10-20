import { Check, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BOOK_VERSIONS, money } from '@/lib/books';

const Y = true, N = false;
/** Rows mirror BOOK_VERSIONS[].inside and editionExtras() so the table never promises more than the book contains. */
const ROWS: [string, ...(boolean | string)[]][] = [
  ['Price', ...BOOK_VERSIONS.map(v => money(v.price))],
  ['Format', ...BOOK_VERSIONS.map(v => v.trim ?? 'PDF')],
  ['Binding', 'Download', 'Paperback', 'Paperback', 'Hardcover', 'Linen hardcover'],
  ['Pages (target)', ...BOOK_VERSIONS.map(v => `${v.pages[0]}–${v.pages[1]}`)],
  ['Planet table, Big Three and aspects', Y, Y, Y, Y, Y],
  ['Your readings as chapters', Y, Y, Y, Y, Y],
  ['Birth Moon phase and rulership summary', Y, Y, Y, Y, Y],
  ['Birth-moment verse', N, Y, Y, Y, Y],
  ['Your topic readings (extra chapters)', N, N, Y, Y, Y],
  ['Birth-sky wheel and aspect grid', N, N, Y, Y, Y],
  ['Chiron, Nodes and sensitive points', N, N, Y, Y, Y],
  ['RetroGOOD retrograde chapter', N, N, Y, Y, Y],
  ['Solar return preview', N, N, Y, Y, Y],
  ['Personal letter and The Story of Your Sky', N, N, N, Y, Y],
  ['Element balance, relationship primer, North Node', N, N, N, Y, Y],
  ['Planet mythology', N, N, N, N, Y],
  ['12-month sky forecast', N, N, N, N, Y],
  ['12 affirmations', N, N, N, N, Y],
  ['Up to 3 relationship comparisons', N, N, N, N, Y],
  ['Numbered certificate page', N, N, N, N, Y],
  ['Journal pages', ...BOOK_VERSIONS.map(v => v.journal ? String(v.journal) : '—')],
  ['Delivery', ...BOOK_VERSIONS.map(v => v.ship.replace(' (US)', ''))],
];

export function VersionCompare({ orderLink = false }: { orderLink?: boolean }) {
  return <div className="overflow-x-auto rounded-lg border border-border">
    <table className="w-full min-w-[720px] text-sm">
      <thead><tr className="border-b border-border"><th scope="col" className="p-3 text-left font-medium">Compare</th>{BOOK_VERSIONS.map(v => <th key={v.id} scope="col" className="p-3 text-center font-display text-base font-normal">{v.name}</th>)}</tr></thead>
      <tbody>{ROWS.map(([label, ...cells]) => <tr key={label} className="border-b border-border last:border-0"><th scope="row" className="p-3 text-left font-normal">{label}</th>{cells.map((c, i) => <td key={i} className="p-3 text-center">{typeof c === 'string' ? c : c ? <Check className="mx-auto h-4 w-4 text-gold" aria-label="Included" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not included" />}</td>)}</tr>)}</tbody>
      {orderLink && <tfoot><tr><td />{BOOK_VERSIONS.map(v => <td key={v.id} className="p-3 text-center"><Link to={`/auth?next=${encodeURIComponent(`/books?version=${v.id}`)}`} className="text-primary underline underline-offset-4">Choose</Link></td>)}</tr></tfoot>}
    </table>
  </div>;
}
