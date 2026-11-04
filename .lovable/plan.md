# Regroup: Design, Theme, Images, Charts and Reading Experience First

## Where we are
Done: 1950s fonts, Blend palette, home faces hero, staff portraits and page banners, Gift Shop restyle, Sibling Bureau, first dark-projector wheel pass.

Still open (from roadmap.md), in the new priority order below. AI-credit and owner-blocked items stay listed but last.

## Track A — Charts and wheels (first)
Two looks, both 1950s, same accurate chart geometry:
1. **Projector** — dark screen, warm lamp beam from top corner, soft vignette, film grain, slow drifting dust, faint flicker (very slow, respects reduced motion). Wheel lines in cream/yellow light with gentle glow; sign ring with hand-drawn 1950s glyph set; planet glyphs as glowing slides; aspect lines as thin light threads (yellow harmonious, red tense).
2. **Ink on paper** — cream archive paper, indigo ink linework, red/yellow spot color, halftone shading, registration marks, small caption plate ("Plate No. — Natal Chart of ..."), like a 1950s science textbook.
- Rule for which look appears: projector on Current Chapter, My Chart and live/transit views; ink on paper in AstroBook reader, printable chart, workbooks and print products. A small "Projector / Paper" toggle on My Chart lets members switch.
- Apply to every wheel: NatalWheel, ChartWheel, synastry/relationship wheels, transit wheels, public sample, founder slides.
- Matching style for chart tables (placements, aspects grid): projector = lit index cards; paper = ruled ledger.

## Track B — Artwork and icon system
- New 1950s icon set (planets, signs, houses, elements, nav icons) in one consistent linework style, replacing mixed icons sitewide.
- Generate missing images: place illustrations for each observatory location, section spot art for ThemeArt boxes, empty-state art, shop category art, AstroBook/AstroComic collector visuals. No Vault Boy, mascots, fantasy or crystals.

## Track C — Text layout and reading formatting
- One type scale: Alfa Slab headings, Libre Franklin body at comfortable reading size/line length, Bebas labels, Yellowtail only for small accents.
- AstroBook reader three columns (chapters · reading · insights), collapsing on phone; long readings use the shared reader with consistent pull quotes, fact vs interpretation boxes and footnote-style source tags.
- Page-specific layouts: AstroBook product page, AstroComic, podcasts, counselors, workbooks, private editions.

## Track D — User experience
- Phone "Field Observatory" dock styling; one account/edition switcher.
- Current Chapter TV channels 01–05 from real transits with slow static change.
- Timeline Hall archive wall; Admin/Developer "Founder Command" restyle.
- Observation Log (owner-only journal, no AI); edit personal context from Current Chapter.
- Signup-first calls to action and the listed small UX bugs (podcast player overlap, onboarding return).

## Track E — Verification
Phone (393) and desktop (1280) checks signed in, full test suite, build clean, roadmap.md updated.

## Later / blocked
Shane chapter corrections, personal Issue #1/#2, Zac illustrations (AI credits); Lulu, printer, email domain, licensed Sabian text, real testimonials (owner/external).

## Technical notes
- Both chart looks share ChartProjection with a `variant: "projector" | "paper"` prop and global CSS tokens; geometry untouched, existing chart tests must still pass.
- Dust/flicker via CSS/SVG layers, paused under prefers-reduced-motion.
- Icons as one React icon module; images in src/assets.
- roadmap.md updated with these tracks as the sole index.
