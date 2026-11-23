# Results and publications focus — Nov 23, 2026

- Welcome now brings interactive chart results forward, retains the Cartographer/faces/publication slides, replaces the merchandise slide and gift-shop panel, and links directly to AstroBook and AstroComic.
- Public and member navigation, search/Instructions and next-step destinations no longer promote keepsakes or miscellaneous merchandise. Existing URLs and provider catalog/orders remain intact; the keepsake URL is an unlisted utility.
- Store and direct product details use the same publication-only predicate. No Shopify titles, photos, stock or prices were changed. Publication shelves do not render sticker/bag departments.
- Ephemeris, chart calculator and shared profection/BaZi/solar-return/motion workbench use warm-paper field-log styling, fine brass rules, teal measurements/controls and terracotta actions. Calculation code, authorization and chart geometry are unchanged.
- General illustration wrappers share soft duotone and organic apertures. All book/comic products, covers, spreads, interior plates and actual catalog photography remain full color; custom uploads and reading text are untouched. Product imagery retains complete rectangular archival framing.

## Verification

172 Vitest suites / 1,415 tests pass, including publication visibility and registry regressions. Automatic preview compilation reports build OK.

Playwright checked welcome, Learn, About, Ephemeris, Store, AstroBook and AstroComic at 1280 and 393px; mobile navigation contains no keepsake/shop destination and does contain comics. Ephemeris month/planet filters updated the measured table. AstroBook opened to a full-color, unclipped spread at both widths. Signed-in review account's saved chart, dashboard, BaZi, Solar Return and Shapes/Motion rendered at 393px after dismissing the existing welcome tour. No observed page errors or horizontal overflow.

The live catalog loaded publication titles successfully but some reloads remained delayed; the existing retry flow is retained. A text search across whole product cards also matched merchandise words in a description, not a merchandise listing title. Tests classify by product title/type and explicitly reject stickers, posters, mugs, totes, notebooks and scrolls.

Founder-only access and real checkout/email/print transactions were not exercised or changed. Duotone is a site presentation treatment, not a rewrite of downloadable print assets.
