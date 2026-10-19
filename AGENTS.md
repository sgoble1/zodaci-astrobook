# Project rules

## Planning
- roadmap.md is the sole active index. launch-plan.md and .lovable/plan.md mirror only the launch plan. Keep other plans separate; delete superseded plans, never code/audits/source knowledge.

## Privacy and access
- protected-content requires approved-account authentication and password tokens. Public bundles contain no archived payload.
- private-edition loads authorized data/plates; session-versioned hydration clears immediately on auth changes to prevent stale-account exposure.
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
- astronomy-engine in astro.ts computes charts with selectable houses/source cross-checks; personal pages use profiles with device fallback.
- ChartWheel renders computed charts; fixed-star contacts parse Compendium star degrees.
- Relationships use owner-only relationships RLS, synastry.ts and kua.ts; keep math outside pages. Needs use saved birth facts/utilities, never invented biography.
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

## Media and presentation
- Podcasts/uploads use library_items/private signed URLs with owner-controlled sharing. Public podcast sharing requires workspace membership/authorized audio URLs.
- make-podcast saves script→TTS WAV in private library storage/library_items; bounded duration presets synchronize script length/source depth.
- Queue/speed/resume use per-device localStorage; PDF viewer uses pdfjs-dist legacy.
- Shared recommendations/media use shared_recommendations/shared_media plus generic shared_item_comments/shared_item_reactions keyed by item_type/item_id.
- Box grids use BoxArt(seed,label). One logo; print products keep names.
- /welcome stays separate/private routes unchanged. CinematicVideo: WebM/MP4, matching frame for accessibility/errors.
- Samples cannot be ordered; landing text is public. Root boundary catches lazy failures; bounded reloads precede App.

## Commerce and operations
- book_orders has owner reads/admin fulfillment/verified webhooks; clients cannot confirm payment.
- book_costing (admin-only) stores real print costs; margins fall back to BOOK_COSTING.
- /shared bypasses PublicChartFallback; SharedSpace checks membership server-side.
- Checkout validates advertised provider amounts and pins environment; dispatch excludes sandbox to prevent accidental production.
- PDFs use fresh edition manifests; freeze before checkout, finalize privately after verified payment, and authorize owner/admin downloads.
- Checkout leases serialize orders; provider amount reconciliation and refund/dispute holds protect fulfillment.
- book-cover streams saved-chart artwork through authenticated requests; never reuse April’s chart.
- Newsletter requires consent/validated service-only writes/admin-only reads and deletes; signup sends no campaigns.
- ActivityTracker records page time/click labels/media events in activity_events (insert-own/admin-read), never typed text/private chat.
