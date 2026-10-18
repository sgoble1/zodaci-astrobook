# Navigation discovery
- Source text stays in protected-content; approved-account authentication plus password tokens are required.
- Podcasts/uploads use library_items and private signed URLs; owners control sharing.
- Ask the Sources uses protected-loader BM25 and ask-sources for streamed cited answers.
- Podcast queue/speed/resume are per-device localStorage.

- Chart math uses astronomy-engine in astro.ts with selectable houses, cross-checking source values.
- Navigation, member search and Instructions share the registry; member search never loads private source text.
- Topics share one renderer separating facts, interpretations and protected links to avoid exposing source text.
- PDF viewer: pdfjs-dist legacy (compat).
- Admin = user_roles table + has_role(); claim_admin() RPC grants admin to the verified owner email on sign-in (no triggers on auth schema allowed).
- Birth Chart Book uses bcb-XX protected-content entries split on the .docx Heading2 styles; src/content/birthChartBook.ts maps chart points to chapters.
- ChartWheel (src/components/chart) renders any computed chart; fixed-star contacts are derived by parsing Compendium star degrees.

- Relationships: relationships table (owner-only RLS); synastry math in src/lib/synastry.ts, Kua/Eight Mansions in src/lib/kua.ts — keeps chart math out of pages.
- April Kua stays 1 (from her Feng Shui guide) even though the standard female formula gives 8 — sources win, discrepancy shown in UI.
- Shared-space access is database/storage-enforced for exactly Shane and April; never client-only.
- SharedChatFeed stays hidden for signed-out/unapproved accounts, including member dashboards.
- custom_pages stores menu_group and source-ranked generated content; sidebar merges it dynamically.
- Shared recommendations and media use shared_recommendations/shared_media with generic shared_item_comments/shared_item_reactions (item_type + item_id) — one thread system for any shared item.
- make-podcast saves script→TTS WAV to private library storage and library_items so episodes appear in the normal list.
- Private edition data and plates load via account-authorized private-edition; sign-out clears memory and public bundles contain no archived payload.
- April's own pages filter passages with aprilOnly() so Shane's chart/family/home appears only on Relationship pages.
- Social Integration uses separate owner-only conversation tables and its own counselor function so its history never enters the shared chat or therapy history.
- April tools never infer family/ancestry/childhood from symbolism; Family & Home uses verified placements and home guidance.
- Private counselors replay full sessions using the verified profile; retain in-session corrections but never claim hidden cross-session learning.
- One app logo; print products keep own names.
- Generated podcast duration is a bounded request preset interpreted by make-podcast, so script length and source depth stay synchronized.
- Relationship needs derive only from saved birth facts and chart utilities, never invented biography.
- Usage analytics: ActivityTracker logs page time, click labels and media events to activity_events (insert-own, admin-read); never record typed text or private chat content.

- Personal chart pages compute from profiles, with device fallback, to match saved birth facts.
- Box grids use BoxArt(seed,label) for unique art.
- Personal context is owner-only and opt-in; user reports never override chart facts.
- Public podcast sharing requires workspace membership and authorized audio URLs.

- Starters use one sequential per-visit queue after paid entitlement and saved birth data; failures stop automatically.
- book_orders uses owner reads, admin fulfillment and verified webhooks; clients cannot confirm payment.
- blog_posts permits subscriber writes and explicit publication; drafts remain private.
- book-cover streams saved-chart artwork through authenticated requests; no April chart reuse.
- Workspace Wonderings use separate member policies; relationship notes stay owner-only.
- Order PDFs freeze before checkout, finalize after verified payment in service-only storage, and use owner/admin-authorized downloads.
- /welcome is a separate generic-art brand page; private app routes remain unchanged.
- Newsletter requires consent, validated service-only writes and admin-only reads/deletes; signup sends no campaigns.
- Book examples are non-orderable; landing readings use separate public editorial content, never private source text.
- Public community tables stay separate from private workspaces; public reads and owner-only posting prevent private-feed exposure.
- Signed-out: AppShell shows public chrome on SIGNED_OUT_PATHS, else redirects to /auth?next= (no member menu/data).
- Free core-theme previews: status 'preview' rows (first section); paid opens rewrite them in full.

- Member-only editorial styles preserve archived presentation; dashboard data/reading positions are owner-scoped.
- Reading failures expose retries; absent readings are not writing, and freshness compares birth onboarding time.
