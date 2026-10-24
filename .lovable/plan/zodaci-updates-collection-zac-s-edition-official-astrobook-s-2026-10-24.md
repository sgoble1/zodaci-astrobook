# Zodaci: UPDATES collection, Zac's edition, Official AstroBook, store, investor page

Work runs in phases so each one can be checked before the next starts. Every new task goes into roadmap.md first.

## 1. Zac's full edition
- Zac signs in as **shane@notardex.com**. He gets the same full-edition layout as April and Shane: his own sidebar, phone menu, chapter links and Full/Classic view switch.
- His saved birth details: **July 10, 1987, 12:08 PM EDT, Mount Carmel Medical Center, Columbus, Ohio**. His chart is calculated from these details and checked against Volume I (Virgo rising 27°38′, Sun 17°52′ Cancer, Moon 11°02′ Capricorn). Any mismatch is shown, not hidden.
- Volumes I–VI from the Zac folder become his private archive. Each chapter is named after what it covers, for example "The Lighthouse: Sun in Cancer", "Mercury Retrograde, Chart Ruler" and "The Year Ahead at 39".
- **Zac's Workbook** is his own workbook with interactive prompts built from his own chapters: the Cancer stellium, the cardinal T-square, the Gemini Midheaven career section and the month-by-month year ahead. It has progress tracking and saved answers.
- His counselors, Ask the Sources, social counselor and chats all use his chart and archive. Nothing from his archive appears in April's or Shane's chats, and nothing from theirs appears in his.

## 2. Separate Masterbook passwords
- April, Shane and Zac each get their own password. Each password unlocks only that person's archive.
- You type each password into a secure form. I never see them. Any unlock already issued is cancelled when the change goes live.

## 3. April's and Shane's chapters
- April's Masterbook chapters and sources are built from her archive, so her sidebar and phone menu always list them. The list itself (titles only) is private to her account and does not need the password. Opening a chapter still does.
- Shane's full view is finished. His chapters get descriptive titles in the same style. His sidebar and phone menu list them even before unlocking.

## 4. Official AstroBook section (April, Shane, Zac)
- A new "Official AstroBook" section in each founder menu holds that person's illustrated AstroBook.
- April and Shane get their existing books. Shane also gets the Shane Illustrated October 2026 PDF. Zac gets Volumes I–VI.
- Each book has a reader, a page viewer and an order button. Each person sees only their own books.

## 5. AstroBook cover options
- Remove Blue Cosmos and Gold Aurora. Midnight Stars stays as the main cover.
- Add a new cover that uses the Midnight Stars design in a different color set.
- Add solid-color and gradient cover options that use the brand palette.
- Add any cover styles named in the UPDATES documents.

## 6. Store (Shopify)
- A new store connected through Shopify sells astrology posters, stickers, notebooks and similar goods. It has a product grid, product pages, a cart and Shopify checkout.
- Members and the public can both shop. "Store" links go in the public header and the member Explore menu.
- Product art uses the Mystic Ink style from the UPDATES style guide.
- Printing and shipping partners are taken from the print report: Printful for posters, notebooks and tees, and StickerApp for stickers. You connect those partners in Shopify yourself.

## 7. Investor page (signed-in invitees only)
- New page at /investors, open only to Zac, Shane, April and accounts an admin approves. Access is checked by the server.
- Content comes only from the documents: the product suite, the pricing in effect, the print and production plan, and the roadmap. It shows no made-up traction numbers.
- Admins can invite people and remove access.

## 8. UPDATES collection implementations
- **Reading Room:** seven articles (Big Three, Houses, Retrogrades, Moon Phases, Transits, Shadow & Breakthrough, How to Read Your Chart), each with its supplied illustration, plus the reading aids.
- **Mystic Ink style guide:** used for all new illustrations. The sample images (Gemini observatory, Leo heroine, Pisces opener) are added as site artwork.
- **AstroBook Unified Master Specification / Complete Master Document:** every open item listed in its Gap Analysis section that does not depend on an outside service. Covers the full-moon-birth correction, ranked chart patterns, the shadow-and-breakthrough library, the OpeningLetter template and re-use of readings already written for the same chart.
- **Print report:** the facts go into the admin production notes and the investor page. Anything the report marks UNVERIFIED stays marked that way.

## Technical details
- Founder identity moves from hardcoded email checks to a `founder_editions` table (user_id, edition key, archive area). It has admin-only writes and a has_role-style security-definer check. protected-content and site-password check the edition through the server, so the client never decides access.
- Each edition gets its own secret: `ARCHIVE_PASSWORD_APRIL`, `ARCHIVE_PASSWORD_SHANE` and `ARCHIVE_PASSWORD_ZAC`. Unlock tokens are tied to one area.
- Chapter title lists come from a new owner-only `private-edition` index endpoint, so menus never show "Unlock to list chapters".
- Zac's DOCX volumes are split on Heading2 into `zac-XX` protected entries. Titles are rewritten as content-descriptive labels.
- The investor page uses an `investor_access` table (RLS: approved user or admin) and an admin RPC to manage invites.
- Shopify is enabled first: you choose a new or existing store when its setup card opens. The store then uses the Shopify Storefront tools.
- Tests to add: per-edition password isolation, Zac's chart placements against Volume I, investor access rules, and that the cover list contains only allowed covers.

## Waiting on outside steps
- The three passwords, which you enter in the secure form.
- Shopify setup approval, and connecting Printful and StickerApp in Shopify.
- Zac signs in once with shane@notardex.com to create his account. His edition is then attached to it automatically.
