# Project rules

## Planning
- roadmap.md is the sole index. launch-plan.md/.lovable/plan.md mirror launch only. Keep other plans separate; delete superseded plans, never code/audits/source knowledge.

## Privacy and access
- Private editions (April/Shane/Zac) open by account only: owner (owns_official_edition) or an owner-created edition_shares row (whole edition or single chapter, keyed by recipient email). protected-content/private-edition check can_open_edition/can_open_chapter with the caller's JWT and filter index.json to shared chapters; no passwords or device tokens. Public bundles contain no archived payload.
- private-edition retains authorized data for lazy registrations; clear retained data and setters on auth changes to prevent stale-account exposure. The /april shared report reads its payload locally (readPrivateModule) and never hydrates the app-wide store, so late responses can't refill private state.
- Private edition downloads use privateEditionLoader with the current session JWT; 401/403 become caught access states rather than failed-page exceptions, and account checks fence hydration.
- Shared chart dashboards render only authorized edition birth facts; missing access never falls back to the viewer's profile, and shared-view birth edits are blocked before any write.
- Founder classic view: member-listed routes render the member version; routes only in April's menu keep their original renderer (onlyInFullEdition), so classic never substitutes unrelated pages. Founder trail/next use the same normalized groups the sidebar renders (FounderGroupsContext).
- Edition ownership for Zac is assigned by admins in edition_access; investor access in investor_access (email-keyed, RLS admin-only); can_view_investors() checks investors. Admin role never opens another person's edition by itself.
- Admin uses user_roles + has_role(); claim_admin() grants the verified owner on sign-in. No auth-schema triggers.
- Shared spaces ('april' = April & Shane, 'zac' = Zac & Shane) are separated by space_key on every shared_* table; RLS compares it to current_shared_space() (per-user saved choice, set via set_shared_space) so client queries need no filters. Database/storage enforce access, never client-only. SharedChatFeed is hidden when signed out/unapproved, including dashboards.
- April pages use aprilOnly(): Shane chart/family/home appears only in Relationships. Never infer family/ancestry/childhood from symbolism; use verified placements/home guidance.
- Social Integration has owner-only conversations and a separate counselor; history never enters shared chat or therapy.
- Counselors replay full sessions with verified profiles; retain session corrections, never claim hidden cross-session learning.
- Personal context is owner-only/opt-in; user reports never override chart facts.
- Workspace Wonderings use separate member policies; relationship notes remain owner-only.
- Public community tables stay separate from private workspaces; public reads/owner-only posting must not expose private feeds.
- Signed-out AppShell shows public chrome only on SIGNED_OUT_PATHS, otherwise /auth?next=; no member menu/data.

## Charts and content
- Public guides use the shared NavigatedProse reader; demo plan comparisons use content/demoPlans and calculated chapter samples use sampleEdition to avoid divergent access claims or invented degrees.
- ChartWheel renders computed charts; fixed-star contacts parse Compendium star degrees.
- Live zodiac wheels share ChartProjection and global chart tokens so member, public and founder slides remain consistent without changing chart geometry. Default is the dark hero projector; NatalWheel uses the retro monitor automatically and SampleChartDemo preserves the classic pale tripod projector.
- Relationships use owner-only RLS; Needs use saved birth facts, never invented biography.
- April Kua remains source-reported 1 versus formula 8; show the discrepancy.
- Birth Chart Book uses bcb-XX protected entries split on DOCX Heading2; birthChartBook.ts maps chart points to chapters.
- Navigation, member search and Instructions share a registry; search never loads private text. Topics share a renderer separating facts, interpretations and protected links.
- custom_pages stores menu_group/source-ranked content; sidebar merges dynamically.
- Ask the Sources uses protected-loader BM25 and ask-sources for streamed cited answers.
- Source-answer clients use sourceResponse for expected HTTP denials; render errors separately and never save denials as assistant answers, so exhausted credits cannot become a page crash or fabricated history.
- Free core-theme previews use status 'preview' for the first section; paid opens rewrite fully.
- Reading failures offer retry; missing rows are not writing; freshness compares birth onboarding time.
- Claim jobs before AI; token-fence terminal writes against retries/chart changes to prevent stale publication and duplicate spend.
- Starters use one sequential per-visit queue after paid entitlement/saved birth data; stop on failure.
- blog_posts permits subscriber writes/explicit publication; drafts stay private.
- Member editorial styles preserve archives; dashboard data/reading positions are owner-scoped.
- Long markdown readings use NavigatedProse/ReadingNavigator for one consistent reader; chapter readers opt into the ReadingInsights column (facts parsed from the chapter text only, three columns only on 2xl) so the reader never claims facts the text doesn't state.
- Reading progress and observations are owner-scoped; Content Center links context and reading history without claiming generated-content provenance that is not recorded.
- Bookmark caches are owner-keyed/auth-invalidated; throw mutation errors to prevent stale exposure and false saves.

## Media and presentation
- Public AstroBook/AstroComic promotions use content/productArtwork shop samples and label illustrative imagery; retain members' composed covers and private issue content so marketing cannot substitute chart-specific output.
- Podcasts/uploads use library_items/private signed URLs; sharing requires workspace membership/authorized audio URLs.
- make-podcast saves script→TTS WAV in private library storage/library_items; bounded duration presets synchronize script length/source depth.
- Queue/speed/resume use per-device localStorage; PDF viewer uses pdfjs-dist legacy.
- Shared recommendations/media use generic shared_item_comments/reactions keyed by item_type/item_id.
- Founder illustrated showcases are showcase.json + plates in private storage, served by protected-content. Public samples (sampleEdition, sampleComic, sampleBook, demo) all use the one fictional Collector-cover reader via content/sampleBookLeaves, never a founder chart, checked by tests; openable books render plain BookFace data from lib/bookLeaves so pages, reading text and tests agree.
- Feature gates (meetsPlan/planAllows and server checks) treat Pro and Cosmic alike; Cosmic differs only in credits.
- Creator Studio designs are drawn client-side from the saved chart (lib/creations.ts) and saved as library_items kind 'creation' under {uid}/creation/, insertable only with has_paid_plan.
- Credit packs are one-time purchases recorded in credit_ledger by the verified webhook (ref = checkout session, live only); usage beyond the monthly allowance draws them down once via an ai_usage trigger.
- Developer dashboard (/developer) reads dev_items/dev_stats for admins; writes require is_developer() (Shane's emails + admin), enforced by RLS.
- Box grids use BoxArt(seed,label). One logo; print products keep names.
- /welcome stays separate/private routes unchanged. CinematicVideo: WebM/MP4, matching frame for accessibility/errors.
- Samples cannot be ordered; landing text is public. Root boundary catches lazy failures; bounded reloads precede App.

## Commerce and operations
- book_orders has owner reads/admin fulfillment/verified webhooks; clients cannot confirm payment.
- book_costing (admin-only) stores real print costs; margins fall back to BOOK_COSTING.
- /shared bypasses PublicChartFallback; SharedSpace checks membership server-side.
- Checkout validates advertised provider amounts and pins environment; dispatch excludes sandbox to prevent accidental production.
- PDFs use fresh edition manifests; freeze before checkout, finalize privately after verified payment, and authorize owner/admin downloads.
- ActivityTracker records page time/click labels/media events in activity_events (insert-own/admin-read), never typed text/private chat.
- Shane's and Zac's editions live in private storage via protected-content areas 'shane'/'zac'; can_read_*_edition() delegate to can_open_edition(). chart_shares is legacy and no longer grants edition access.
- src/lib and supabase/functions have their own AGENTS.md; read them before changing files there.
- platform_settings is admin-only; public pages read allowlisted keys via public_site_settings().
- Admin data comes only from has_role-checked RPCs/functions.

## Page metadata
- usePageMeta owns route-aware titles, descriptions, self-referencing social URLs/canonicals and indexing boundaries; member discussions remain noindex and private-subdomain exclusions are preserved. Static head remains the social-crawler fallback.
- Astral Research Authority world: place/staff/member-character registry lives in src/lib/observatory.ts and shared observatory pieces in src/components/observatory/; pages read their place from the registry so the world stays consistent.
- Current Chapter and Life Compass derive only from today's transits (src/lib/currentChapter.ts), never AI or biography, so the landing stays truthful without credits.
- DashboardMosaic is the shared dashboard opening; retain CurrentChapterPanel beneath it, with founder TVs receiving their authorized edition chart directly to prevent viewer-chart substitution.
- /forecast separates public skyToday/skyEvents bulletins from signed-in useMyBirth broadcasts; reuse CurrentChapterPanel and ForecastReel so chart privacy and deterministic timing stay consistent.
