# src/lib rules

- astronomy-engine in astro.ts computes charts with selectable houses/source cross-checks; personal pages use profiles with device fallback.
- Relationship math lives in synastry.ts and kua.ts, never in pages.
- Plan names, prices, checkout IDs and price→tier mapping live only in plans.ts (server functions mirror its ID lists); one place to change pricing.
- AstroBook stage order/labels live in bookFulfillment.ts; DB guards and supabase/functions/_shared/book-delivery-rules.ts mirror PAID_STAGES so client and server agree.
- AstroComic scheduling (comicDueFor/nextIssueMonth) and issue scripts live in comic.ts; the admin queue drafts deterministically, without AI spend.
- Admin tabs are registered in adminTabs.ts (grouped, ?tab= persisted).
- Internal return links use internalDestination to preserve context without off-site redirects.
