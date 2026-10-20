# Zodaci Upgrade: one combined build from all 12 documents

## Decisions (from your answers)
- **Look:** switch to the Redesign document's "Digital Sanctuary" palette (#07080F, #0D1028, #8B5CF6, #D4A853, #E8E0F0, #A89EC0, #3B82F6). The fonts stay DM Serif Display and Fira Sans unless the Redesign type system says otherwise. Saved design notes get updated to match.
- **Plans:** adopt the documents' plans: Free, **Pro $9/mo** and **Cosmic $19/mo**, with annual prices. Current Full Access and Creator subscribers keep what they have (grandfathered into Pro/Cosmic features). Visible credit balance and tier gating.
- **AstroBook:** 5 versions printed through **Lulu**: Digital $24.99, Pocket, Classic $59.99, Signature Hardcover $97, Collector's Linen $149. Lulu's real costs are checked before prices go live, at about a 40% margin.
- **AstroComic:** full monthly printed comic subscription: $14.99/mo, $149.99/yr, $18.99 single issue.

## Where the documents disagree, and how this plan settles it
- Master Build says OpenAI and Resend keys. The plan uses the built-in AI and the built-in email instead, with no extra keys.
- There are three different demo personas (Jules Harbor, Olivia Chen, a doc persona). Keep Jules Harbor for /demo and use Olivia Chen for the AstroBook sample book.
- Testimonials and social proof stay as empty slots until you provide real ones. Nothing gets invented.
- April's and Shane's private editions, the shared space and the privacy rules stay exactly as they are. Nothing from the documents can expose them.
- Printer: Pixartprinting is retired for new orders. Existing orders finish as they are.

## Phases (each ends with tests, a full walk-through and a security check)

### Phase 1: Fix confirmed bugs (Admin, Debug Report, Site Audits)
- Admin: Retry buttons wired up on Growth and Funnel, Activity filters actually applied, subscriptions shown, the default tab depends on role, non-admins no longer see the upload panel, and confirmation popups replace browser alerts.
- Debug Report: critical and high items (PE/RG/UI/TECH codes). Phone/tablet/desktop layout checks. Chart anomalies: full-moon birth, anaretic degrees, stellium, bucket shape, grand trine, T-square, grand cross.
- Site audits: the 15 numbered issues, including the SEO and page-loading mismatch.

### Phase 2: New look and site structure (Redesign, Deep Guide, Website Audit)
- New palette and design settings sitewide, plus a single-row main menu (no more 11-link double row) and one main call to action on the homepage.
- Homepage rebuilt in this order: Hero with personalization hook, value props, Reading Room preview, How It Works, plans teaser, AstroBook callout, email capture with an incentive, footer. The disclaimer moves out of the middle of the page.
- Pricing page: monthly/annual toggle, three plan cards, FAQ, compare table. Public preview page. Page meta, structured data, sitemap and robots for every page.

### Phase 3: Plans, credits and results (Master Build, Results & Readings, AI Content Architecture)
- New Pro/Cosmic products with monthly and annual prices in checkout, existing subscribers mapped across, and the server checks entitlements.
- Credit ledger: signup bonus, a monthly allowance per plan and a visible balance. Every AI action draws credits from it on the server.
- Deterministic deduction engine for Western, Chinese, Numerology and Feng Shui (no AI), including the 15 new deductions.
- Results page with progressive disclosure, TierGate locked previews and upgrade nudges.
- AI cost reduction: shared cached prompt for the chart context, a reusable content library, report assembly from saved pieces, and the style guide rules (second person, specific, no social-media astrology voice).

### Phase 4: RetroGOOD and the Perception Engine (RetroGOOD spec, MOD-001 to MOD-011)
- Retrograde detection, tiers, patterns and the RetroGOOD page.
- Perception Engine: pattern modules, significance ranking, narrative assembly and tone calibration, all fed from the chart calculation that's already checked.
- Shane x April synastry internal feature (MOD-011), visible only to the two of them.

### Phase 5: AstroBook 2.0 (AstroBook Plan, Expanded Masterplan)
- Five-version picker and comparison, "What's Inside", story section, demo/preview, 10-question FAQ.
- Hero live customizer: name, birth date and a live cover preview.
- Free Cosmic Teaser lead magnet: email in exchange for a short chart teaser.
- Chapter breakdown tabs and the full chapter plan (houses 1-12, etc.) used for the manuscript. Covers designed for each version.
- **Lulu:** price quotes, print-ready files sized per version, automatic print order after verified payment, and status/tracking pulled back into Orders.
- Olivia Chen sample book. Dashboard demo content for Free, Pro and Cosmic.

### Phase 6: AstroComic (AstroComic document)
- Product page, plus checkout for monthly, annual and single issue, with renewals and cancellations handled.
- Planet character bible and the "Celestial Noir" style. Monthly 24-page issue generated from the subscriber's chart and that month's transits (text plus images).
- Subscriber pages: issue archive, shipping address, pause/skip.
- Admin queue: approve the issue, export the print-ready PDF, mark it printed and shipped, add tracking. Printing goes through the printer named in the document, by hand unless that printer has an ordering API.

### Phase 7: Admin expansion (Admin document)
- New tabs: Newsletter Manager, April's Account Monitor (activity only, never her private text), AI Credit Ledger, Audit Log, Platform Settings, Stripe overview. Plus admin search, the enhanced Growth/Activity/Orders/Marketing tabs, the restructured tab layout and the global control checklist.

### Phase 8: Growth extras (Expanded Masterplan 6.1-6.10, Master Build)
- Installable app (PWA), referral program, compatibility score, email digests (once a sender domain is set up), Academy/learning hub.
- International: Spanish as a later step.

## What you need to provide (blocks specific steps, not the whole build)
- **Lulu account and API keys** (Phase 5, automatic print orders).
- **AstroComic printer choice and account** (Phase 6 printing).
- **Email sender domain** (newsletter, digests, shipping emails).
- **Real testimonials** (optional).
- **AI credits:** comic issues and reading generation use them.

## Technical details
- New tables (owner-scoped RLS plus GRANTs): credit_ledger, credit_balances, audit_log, platform_settings, newsletter_campaigns, lulu_print_jobs, comic_subscriptions, comic_issues, comic_characters, referrals, teaser_leads. Roles stay in user_roles/has_role().
- has_paid_plan() is extended to map pro/cosmic plus the legacy full/creator plans. Plan logic lives in a single module with unit tests: prices, limits, credit allowances and grandfathering.
- Edge functions: lulu-quote, lulu-order, lulu-webhook, comic-generate, comic-webhook handling inside payments-webhook, credits are debited inside existing AI functions before the AI call (claim-then-spend), teaser-generate (rate-limited).
- Deterministic engines (deductions, RetroGOOD, perception patterns) live in src/lib, with tests against Shane's and April's verified placements.
- Each phase ends with Vitest, a Playwright walk-through signed in as admin and as a test member, a security scan, and a roadmap.md update.
- Memory updates: palette, plan names and prices, book versions/prices, printer.
