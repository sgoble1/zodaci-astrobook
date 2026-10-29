import { BOOK_VERSIONS } from '@/lib/books';

/**
 * Print partner matrix (UPDATES · print report). Only facts we can point to are marked verified: book specs come from
 * the Lulu product codes the print pipeline actually submits. Every partner claim we have not confirmed with a quote,
 * proof or signed account stays `verified: false` and is shown with an UNVERIFIED tag — never upgraded by guesswork.
 */
export type PartnerFact = { label: string; value: string; verified: boolean; source?: string };
export type PrintPartner = { id: string; name: string; makes: string; status: string; facts: PartnerFact[] };

const PENDING = 'Awaiting a written quote or printed proof';

export const PRINT_PARTNERS: PrintPartner[] = [
  {
    id: 'lulu', name: 'Lulu', makes: 'AstroBook print editions',
    status: 'Print files, spine and cover sizing are built in; live account keys and first printed proofs are still pending.',
    facts: [
      ...BOOK_VERSIONS.filter(b => b.format === 'print').map(b => ({
        label: b.name, value: `${b.trim} · ${b.binding} · ${b.paper}`, verified: true, source: 'Lulu product code used by our print pipeline',
      })),
      { label: 'Print resolution', value: '300 DPI artwork, 0.125 in bleed', verified: true, source: 'Lulu Book Creation Guide, enforced by our preflight' },
      { label: 'Production and delivery time', value: PENDING, verified: false },
      { label: 'Colour match on coated stock', value: PENDING, verified: false },
    ],
  },
  {
    id: 'printful', name: 'Printful', makes: 'Posters and notebooks (apparel later)',
    status: 'Chosen partner for print-on-demand posters and notebooks sold in the shop; fulfilment connection to the shop not yet confirmed.',
    facts: [
      { label: 'Poster paper stock', value: PENDING, verified: false },
      { label: 'Notebook paper and binding', value: PENDING, verified: false },
      { label: 'Unit cost per product', value: PENDING, verified: false },
      { label: 'Production and delivery time', value: PENDING, verified: false },
      { label: 'Fulfilment connected to the shop', value: 'Not yet confirmed', verified: false },
    ],
  },
  {
    id: 'stickerapp', name: 'StickerApp', makes: 'Sticker sheets',
    status: 'Chosen partner for stickers; ordering is manual until an account and quote are in place.',
    facts: [
      { label: 'Sticker material and finish', value: PENDING, verified: false },
      { label: 'Unit cost per sheet', value: PENDING, verified: false },
      { label: 'Production and delivery time', value: PENDING, verified: false },
      { label: 'Cut tolerance', value: PENDING, verified: false },
    ],
  },
];

/** How many claims across all partners are still unconfirmed. */
export const unverifiedCount = (partners: PrintPartner[] = PRINT_PARTNERS) => partners.reduce((n, p) => n + p.facts.filter(f => !f.verified).length, 0);
