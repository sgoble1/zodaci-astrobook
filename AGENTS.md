# Navigation discovery
- Explore links to existing readings.
- Source text stays in protected-content; approved-account authentication plus password tokens are required.
- Podcasts and source uploads use library_items and private library storage with signed URLs; owners can change private/approved-shared visibility.
- Ask the Sources uses protected-loader BM25 and ask-sources for streamed cited answers.
- Podcast queue, speed and resume positions are stored per device in localStorage.

- Chart math uses astronomy-engine in astro.ts with selectable houses, cross-checking source values.
- Navigation and Instructions share one registry to keep links synchronized.
- Topics share one renderer separating facts, interpretations and protected links to avoid exposing source text.
- PDF viewer uses pdfjs-dist legacy for browser compatibility.
- Admin = user_roles table + has_role(); claim_admin() RPC grants admin to the verified owner email on sign-in (no triggers on auth schema allowed).
- Birth Chart Book uses bcb-XX protected-content entries split on the .docx Heading2 styles; src/content/birthChartBook.ts maps chart points to chapters.
- ChartWheel (src/components/chart) renders any computed chart; fixed-star contacts are derived by parsing Compendium star degrees.

- Relationships: relationships table (owner-only RLS); synastry math in src/lib/synastry.ts, Kua/Eight Mansions in src/lib/kua.ts — keeps chart math out of pages.
- April Kua stays 1 (from her Feng Shui guide) even though the standard female formula gives 8 — sources win, discrepancy shown in UI.
- The human shared space is database- and storage-enforced for exactly Shane and April's approved email accounts; never rely on client-only access checks.
- The compact private conversation feed is shared between Home and My Dashboard and must stay hidden for signed-out or unapproved accounts.
- custom_pages stores menu_group and source-ranked generated content; sidebar merges it dynamically.
- Shared recommendations and media use shared_recommendations/shared_media with generic shared_item_comments/shared_item_reactions (item_type + item_id) — one thread system for any shared item.
- make-podcast saves script→TTS WAV to private library storage and library_items so episodes appear in the normal list.
- Private edition data and plates load via account-authorized private-edition; sign-out clears memory and public bundles contain no archived payload.
- April's own pages filter passages with aprilOnly() so Shane's chart/family/home appears only on Relationship pages.
- Social Integration uses separate owner-only conversation tables and its own counselor function so its history never enters the shared chat or therapy history.
- April-focused tools must never infer named relatives, ancestry, lineage or childhood events from chart symbolism; Family & Home stays limited to verified placements and home-setting guidance.
- Private counselor chats replay the complete saved session and use one shared verified April profile; they may retain in-session corrections but must not claim hidden cross-session learning.
- Application branding uses one shared logo; printed products retain their own names.
- Generated podcast duration is a bounded request preset interpreted by make-podcast, so script length and source depth stay synchronized.
- Relationship needs derive only from saved birth facts and chart utilities, never invented biography.
- Wide tables scroll horizontally on phones to keep headings readable.
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
- Owner PDFs stay private; book checkout is blocked pending production manuscripts and printer review.
- /welcome is a separate generic-art brand page; private app routes remain unchanged.
- Newsletter requires consent, validated service-only writes and admin-only reads/deletes; signup sends no campaigns.
- Book examples are non-orderable; landing readings use separate public editorial content, never private source text.
- Public community tables stay separate from private workspaces; public reads and owner-only posting prevent private-feed exposure.
- Signed-out visitors get only public chrome in AppShell (SIGNED_OUT_PATHS); all other app routes redirect to /auth?next= — keeps member menus and private data out of signed-out views.
