
- Masterbook text lives as per-chapter markdown in public/masterbook (index.json + {id}.md), generated from the uploaded .docx; fetched on demand to keep the app bundle small.
- Podcasts and added source files use one library_items table + private "library" storage bucket with signed URLs; public read, owner-only write (workspace blocks public buckets).
- Ask the Sources: client-side BM25 retrieval over public/masterbook + public/library (extracted PDF/DOCX/PPTX text), top passages sent to the ask-sources edge function, which streams a cited answer from the AI Gateway.
- Podcast queue, speed and resume positions are stored per device in localStorage.

- Natal/Ba Zi math lives in src/lib/astro.ts (astronomy-engine, Porphyry houses); it cross-checks the PDF values rather than replacing them.
- In-app PDF viewer uses the pdfjs-dist legacy build, because the modern build needs very new browser APIs.
- Admin = user_roles table + has_role(); claim_admin() RPC grants admin to the verified owner email on sign-in (no triggers on auth schema allowed).
- Birth Chart Book lives in public/masterbook as bcb-XX entries split on the .docx Heading2 styles; src/content/birthChartBook.ts maps chart points to chapters.
- ChartWheel (src/components/chart) renders any computed chart; fixed-star contacts are derived by parsing Compendium star degrees.

- Relationships: relationships table (owner-only RLS); synastry math in src/lib/synastry.ts, Kua/Eight Mansions in src/lib/kua.ts — keeps chart math out of pages.
- April Kua stays 1 (from her Feng Shui guide) even though the standard female formula gives 8 — sources win, discrepancy shown in UI.
- The human shared space is database- and storage-enforced for exactly Shane and April's approved email accounts; never rely on client-only access checks.
- The compact private conversation feed is shared between Home and My Dashboard and must stay hidden for signed-out or unapproved accounts.
