# Zodaci — Completion Plan (week of Oct 24–31)

Covers everything still open from this week's chat plus the new shop catalog. Work runs in the order below; items waiting on something outside our control are listed at the end.

## 1. Replace the shop with the new catalog (44 products)
Remove the current posters/stickers/notebooks and load the catalog exactly as written (names, descriptions, prices):
- **Core Collection:** Constellation Wall Poster $28, Zodiac Sticker Sheet $9, Linen Zodiac Notebook $24, Pocket Almanac Journal $16
- **Apparel & Home:** Constellation Tee $34, Celestial Fleece Sweatshirt $58, Constellation Mug $22, Zodiac Wheel Tote $26
- **Sign Editions** for Aries, Taurus, Leo, Scorpio, Sagittarius, Pisces — each with Poster $28, Tee $34, Sticker Sheet $9, Linen Notebook $24, Mug $22, Tote $26
- Each product gets a fuller description (materials, size, care) built from the catalog line, a product photo in the dark Zodaci style, tags (collection, sign, type) and sizes for tees/sweatshirts (S–XXL).
- Store page gains filters for Collection, Sign and Type; "Recommended for your chart" shows the signed-in member's Sun/Moon/Rising sign editions.
- Catalog footer says "Astral Goods" — products will be sold under the Zodaci name unless you say otherwise.

## 2. View switching and accounts (Shane)
- One account switcher in one place (replaces the three current switches): My edition, April's exact view, Zac's exact view, Member preview.
- "View as" shows the other person's own chart on My Chart / Dashboard, read-only, checked by the server.
- Shared Spaces button opens two separate workspaces: April & Shane, Zac & Shane. Zac gets his own; April and Zac never see each other's.

## 3. Admin and navigation fixes
- Group the 20 admin tabs into sections (People, Content, Shop & Orders, Production, Money, Developer).
- Developer link opens without a full page reload; register the 5 missing pages; update the podcasts plan-lock test.
- Mobile tab highlight on sub-pages; sign-up-first buttons; Community sign-in returns you to where you were.

## 4. Zac and Shane content
- Zac workbook: replace the informal "dad" letter with a proper 33/6 Life Path section.
- Brother chart comparison hub for Shane & Zac (Sun square, Moon trine, Rising pairing), in both accounts.
- Accurate illustrations for Zac's topics; Zac's official AstroComic uses his own art, cover, 3D preview and summary everywhere it appears.
- Official sections: April and Zac see only their own Masterbook and AstroComic; Shane sees all three.

## 5. AstroComic
- Issue #1 for sale becomes the buyer's own first issue, made from their chart (the demo stays a sample only).
- Issue #2 "The Crucible of Aspects" with full script and preview pages.
- Comic shop with sizes, page counts, delivery estimate (print 3–5 days + shipping 5–7 days); fix the Issue #1 title/link mismatch.

## 6. Brand and home page
- Refresh the home page top section and artwork to the silver serif and quiet buttons.
- Mystic Ink style guide pieces (palette, 12-sign guide, prompt builder) in admin.

## 7. AstroBook depth and spec rules
- Add house-ruler aspects and decan chapters to raise page counts toward targets (Digital 60–80, Linen 200–250).
- Unified Spec rules: lunar-phase birth, Yod, significance ranking, Shadow & Breakthrough library, opening letter; keep readings when birth facts are unchanged.
- Full purchase-flow check for AstroBook and AstroComic.

## 8. Checks
- Tests for each rule (prices, privacy, view isolation, workspace access); phone and desktop browser checks; verification checklist doc; roadmap updated.

## Waiting on you or outside services
- Shane's chapter corrections and new AI art/descriptions — need AI credits topped up.
- Resend and Google Search Console — need the connect cards accepted in this workspace; email domain DNS.
- Lulu account, comic printer, licensed Sabian text, real testimonials.
- Shop images/variants go live in Shopify once connected in this workspace.

## Technical details
- Catalog seeded via Shopify batch delete + batch create (44 products, variants for apparel sizes); product images generated per type/sign and attached.
- Store filters read Shopify tags `collection:*`, `sign:*`, `type:*`; chart recommendations use saved placements.
- Switcher state in one context consumed by AppShell, AccountButton, Admin; server reads via `can_open_edition`.
- Workspaces keyed by pair id with membership RLS; `/shared/april`, `/shared/zac`.
