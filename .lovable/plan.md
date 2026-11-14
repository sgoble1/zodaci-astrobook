# Part 30: Implementation Reference v3, delivered in ordered slices

## Your Shopify question
You don't need to approve anything with me. If you write the product descriptions directly in Shopify, the shop shows them on its own: it reads Shopify live and refreshes about every 15 minutes. I'll mark "Rewritten product descriptions" as done by the owner in Shopify. Shopify sign-in is then only needed if you later want me to read the listings, for example to check them for consistency.

## How the work is ordered
Each slice is finished, tested and checked in the browser before the next one starts. After every slice, both documents are updated in the same order: the master resource (new Part 30) and your reference copy (v4, .md and PDF), along with the feature list, which the investor page and developer dashboard read, the developer log and the roadmap.

### Slice 0: Documents first
- Add Part 30 with this slice list and the Shopify decision to the master resource, and make reference v4 (v3 plus Part 30).
- Change "Rewritten product descriptions" to "Owner writes these in Shopify" and remove its Shopify sign-in blocker.

### Slice 1: Compatibility cards, option A (Observatory index cards)
- Cream archive-paper cards with hand-cut corners.
- The placement pair as a slab-serif heading, a label-font line for the aspect, and reading text at relaxed line height.
- Three columns on desktop, one on phones, roomy padding, large tap areas, and a slow lift on hover that respects reduced motion.
- Only the card presentation changes. Scores, calculations and links stay exactly the same.

### Slice 2: 15-point accuracy check (investor trust)
- Expand the regression tests to the 15 checked points: Sun to Pluto, Node, Ascendant, Midheaven, retrograde flags and house cusps.
- Use only reference values already stored in the project. Where a value is missing, I'll list it and ask you for Astrodienst or AstroSeek figures rather than invent them.

### Slice 3: Admin launch checklist (finish)
- Live checks for payments, print, privacy and content, with an export.
- It reads the same feature list, so the checklist, investor page and developer dashboard always agree.

### Slice 4: One-question personal context flow (finish)
- One question at a time, saved answers shown as chips, a skip option, and the owner's eyes only.
- Answers never override chart facts.

### Slice 5: Profection wheel
- A turnable 12-spoke wheel on /profection showing the current year's house and its ruler, calculated from the saved chart.
- Same 1950s projector look as the zodiac wheels.

### Slice 6: Four Pillars and Lo Shu grid views
- Visual pillars and a 3x3 grid built from the member's own saved chart.
- April's personal pillars stay on her private page only.
- Kua shows the source-reported versus formula difference wherever it applies.

### Slice 7: Retrograde Radar tone setting
- A Gentle, Direct or Strategic wording choice, saved per member.
- Only the wording changes, never the dates.

### Slice 8: Long chapter list speed
- The 382-chapter index draws only the rows on screen. Search and links stay the same.

### Slice 9: Investigation stamps and community pen names
- "Confidential" and "Verified" stamps on case files, from recorded status only.
- Community posts under a chosen handle with a placement badge, never a real name.

### Slice 10: Founder document check on /developer
- Upload a founder document privately and compare word, chapter and file counts with the saved snapshot. Founder text is never shown or stored outside private storage.

### Slice 11: Cassette podcast player
- A 1950s cassette look on the existing player. Queue, speed and resume behave as now.

### Slice 12: Later or waiting on you (listed, not built)
- Ephemeris page and Famous Charts. Famous Charts needs sourced birth data.
- Optional move of lesson addresses under Learn.
- Zodaci Social.
- Shopify orders on My Orders: waits on a store-owned Shopify admin app.
- Receipt emails: wait on a verified email domain.
- Lulu print automation: waits on production credentials and a proofed sample.
- Comic printing: paused by you.
- Licensed asteroids and Sabian Symbols: wait on licensing.
- Reviewed placement library: waits on your review and AI credits.

## Checks for every slice
- Tests for each rule it touches.
- Phone and desktop screenshots, signed out and signed in.
- A clean build before moving on.

## Technical notes
- Card styling uses the existing design tokens and corner utility only.
- Profection, pillar and Lo Shu math stays in src/lib, with tests.
- Pages only display results.
- Tone choice is saved per owner and wording comes from lib.
- The chapter list uses a lightweight windowing approach, with no heavy library added.
- The document check uses the existing founderAudit counts.
