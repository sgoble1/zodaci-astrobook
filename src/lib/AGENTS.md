# src/lib rules

- astronomy-engine in astro.ts computes charts with selectable houses/source cross-checks; personal pages use profiles with device fallback.
- Relationship math lives in synastry.ts and kua.ts, never in pages.
- Plan names, prices, checkout IDs and price→tier mapping live only in plans.ts (server functions mirror its ID lists); one place to change pricing.
- AstroBook stage order/labels live in bookFulfillment.ts; DB guards and supabase/functions/_shared/book-delivery-rules.ts mirror PAID_STAGES so client and server agree.
- AstroComic scheduling (comicDueFor/nextIssueMonth) and issue scripts live in comic.ts; the admin queue drafts deterministically, without AI spend.
- AstroComic print geometry, art pixel sizes, prompts and preflight live in comicPrint.ts; comicPdf.ts composes proof/print PDFs from the same layout so artwork is always drawn at its printed size.
- Admin tabs are registered in adminTabs.ts (grouped, ?tab= persisted).
- Internal return links use internalDestination to preserve context without off-site redirects.
- AstroBook content is built by buildVolumes() in bookVolumes.ts (six volumes, chart-derived, readings woven in by volumeFor); BOOK_VERSIONS.inside and VersionCompare must describe exactly what it writes.
- Cover artwork variants (per trim shape, with pixel sizes) live in content/coverDesigns.ts; designVariant picks the closest shape so print PPI stays testable.
