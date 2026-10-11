# Navigation discovery
- Keep Explore & Discover as a curated link hub over existing pages rather than duplicating interpretation content, so updates remain consistent.


- Masterbook and extracted-source text is bundled only with the protected-content function and fetched through short-lived password unlock tokens; never restore public static copies.
- Podcasts and added source files use one library_items table + private "library" storage bucket with signed URLs; podcast owners choose private or approved shared-space visibility and may change it later.
- Ask the Sources: client-side BM25 retrieval over the protected content loader, with top passages sent to the ask-sources function for a streamed cited answer.
- Podcast queue, speed and resume positions are stored per device in localStorage.

- Natal/Ba Zi math lives in src/lib/astro.ts (astronomy-engine; Placidus houses by default to match the sources, with Porphyry, Whole Sign and Equal selectable); it cross-checks the PDF values rather than replacing them.
- Main navigation and the clickable Instructions guide share one registry so feature links and help stay synchronized.
- Library learning topics use the shared Topic renderer with separate chart facts, labeled editorial interpretations, and protected source links, so new readings do not duplicate or expose source text.
- In-app PDF viewer uses the pdfjs-dist legacy build, because the modern build needs very new browser APIs.
- Admin = user_roles table + has_role(); claim_admin() RPC grants admin to the verified owner email on sign-in (no triggers on auth schema allowed).
- Birth Chart Book uses bcb-XX protected-content entries split on the .docx Heading2 styles; src/content/birthChartBook.ts maps chart points to chapters.
- ChartWheel (src/components/chart) renders any computed chart; fixed-star contacts are derived by parsing Compendium star degrees.

- Relationships: relationships table (owner-only RLS); synastry math in src/lib/synastry.ts, Kua/Eight Mansions in src/lib/kua.ts — keeps chart math out of pages.
- April Kua stays 1 (from her Feng Shui guide) even though the standard female formula gives 8 — sources win, discrepancy shown in UI.
- The human shared space is database- and storage-enforced for exactly Shane and April's approved email accounts; never rely on client-only access checks.
- The compact private conversation feed is shared between Home and My Dashboard and must stay hidden for signed-out or unapproved accounts.
- Created pages live in custom_pages (menu_group = sidebar section title) and are written by the generate-page function from BM25-ranked source passages; the sidebar merges them in so new pages need no code changes.
- Shared recommendations and media use shared_recommendations/shared_media with generic shared_item_comments/shared_item_reactions (item_type + item_id) — one thread system for any shared item.
- Podcast creation runs in the make-podcast function (script → TTS WAV → private library bucket → library_items kind 'podcast') so new episodes appear in the normal podcast list.
- Illustration plates are generated images in src/assets/plates, swapped in for plate descriptions at render time by withPlates(); the protected text itself is unchanged.
- April's own pages filter passages with aprilOnly() so Shane's chart/family/home appears only on Relationship pages.
- Social Integration uses separate owner-only conversation tables and its own counselor function so its history never enters the shared chat or therapy history.
- April-focused tools must never infer named relatives, ancestry, lineage or childhood events from chart symbolism; Family & Home stays limited to verified placements and home-setting guidance.
- Private counselor chats replay the complete saved session and use one shared verified April profile; they may retain in-session corrections but must not claim hidden cross-session learning.
- AstroBook branding uses one shared logo component across desktop and mobile so the identity remains consistent at every viewport.
- Generated podcast duration is a bounded request preset interpreted by make-podcast, so script length and source depth stay synchronized.
- Relationship needs and coincidences are derived at render time only from saved birth facts and shared chart utilities, preventing invented biography.
- Wide data tables keep a stable readable width and scroll horizontally on phones instead of compressing headings into vertical text.
- Usage analytics: ActivityTracker logs page time, click labels and media events to activity_events (insert-own, admin-read); never record typed text or private chat content.
