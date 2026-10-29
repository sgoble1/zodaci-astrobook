# Project rules

## Planning
- roadmap.md is the sole index. launch-plan.md/.lovable/plan.md mirror launch only. Keep other plans separate; delete superseded plans, never code/audits/source knowledge.

## Privacy and access
- Private editions (April/Shane/Zac) open by account only: owner (owns_official_edition) or an owner-created edition_shares row (whole edition or single chapter, keyed by recipient email). protected-content/private-edition check can_open_edition/can_open_chapter with the caller's JWT and filter index.json to shared chapters; no passwords or device tokens. Public bundles contain no archived payload.
- private-edition retains authorized data for lazy registrations; clear retained data and setters on auth changes to prevent stale-account exposure. The /april shared report reads its payload locally (readPrivateModule) and never hydrates the app-wide store, so late responses can't refill private state.
- Founder classic view: member-listed routes render the member version; routes only in April's menu keep their original renderer (onlyInFullEdition), so classic never substitutes unrelated pages. Founder trail/next use the same normalized groups the sidebar renders (FounderGroupsContext).
- Zac's edition and investor access are granted by admins in edition_access/investor_access (email-keyed, RLS admin-only); checks run in can_read_zac_edition()/can_view_investors().
- Admin uses user_roles + has_role(); claim_admin() grants the verified owner on sign-in. No auth-schema triggers.
- Database/storage enforce Shane/April shared access, never client-only. SharedChatFeed is hidden when signed out/unapproved, including dashboards.
- April pages use aprilOnly(): Shane chart/family/home appears only in Relationships. Never infer family/ancestry/childhood from symbolism; use verified placements/home guidance.
- Social Integration has owner-only conversations and a separate counselor; history never enters shared chat or therapy.
- Counselors replay full sessions with verified profiles; retain session corrections, never claim hidden cross-session learning.
- Personal context is owner-only/opt-in; user reports never override chart facts.
- Workspace Wonderings use separate member policies; relationship notes remain owner-only.
- Public community tables stay separate from private workspaces; public reads/owner-only posting must not expose private feeds.
- Signed-out AppShell shows public chrome only on SIGNED_OUT_PATHS, otherwise /auth?next=; no member menu/data.

## Charts and content
- ChartWheel renders computed charts; fixed-star contacts parse Compendium star degrees.
- Relationships use owner-only RLS; Needs use saved birth facts, never invented biography.
- April Kua remains source-reported 1 versus formula 8; show the discrepancy.
- Birth Chart Book uses bcb-XX protected entries split on DOCX Heading2; birthChartBook.ts maps chart points to chapters.
- Navigation, member search and Instructions share a registry; search never loads private text. Topics share a renderer separating facts, interpretations and protected links.
- custom_pages stores menu_group/source-ranked content; sidebar merges dynamically.
- Ask the Sources uses protected-loader BM25 and ask-sources for streamed cited answers.
- Free core-theme previews use status 'preview' for the first section; paid opens rewrite fully.
- Reading failures offer retry; missing rows are not writing; freshness compares birth onboarding time.
- Claim jobs before AI; token-fence terminal writes against retries/chart changes to prevent stale publication and duplicate spend.
- Starters use one sequential per-visit queue after paid entitlement/saved birth data; stop on failure.
- blog_posts permits subscriber writes/explicit publication; drafts stay private.
- Member editorial styles preserve archives; dashboard data/reading positions are owner-scoped.
- Long markdown readings use NavigatedProse/ReadingNavigator for one consistent reader.
- Bookmark caches are owner-keyed/auth-invalidated; throw mutation errors to prevent stale exposure and false saves.

## Media and presentation
- Podcasts/uploads use library_items/private signed URLs; sharing requires workspace membership/authorized audio URLs.
- make-podcast saves script→TTS WAV in private library storage/library_items; bounded duration presets synchronize script length/source depth.
- Queue/speed/resume use per-device localStorage; PDF viewer uses pdfjs-dist legacy.
- Shared recommendations/media use generic shared_item_comments/reactions keyed by item_type/item_id.
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
- Shane's edition: private storage via protected-content area 'shane', gated by can_read_shane_edition()/chart_shares.
- src/lib and supabase/functions have their own AGENTS.md; read them before changing files there.
- platform_settings is admin-only; public pages read allowlisted keys via public_site_settings().
- Admin data comes only from has_role-checked RPCs/functions.

## Page metadata
- usePageMeta owns route-aware titles, descriptions, self-referencing social URLs/canonicals and indexing boundaries; member discussions remain noindex and private-subdomain exclusions are preserved. Static head remains the social-crawler fallback.
