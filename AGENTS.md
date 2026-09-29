
- Masterbook text lives as per-chapter markdown in public/masterbook (index.json + {id}.md), generated from the uploaded .docx; fetched on demand to keep the app bundle small.
- Podcasts and added source files use one library_items table + private "library" storage bucket with signed URLs; public read, owner-only write (workspace blocks public buckets).
- Ask the Sources: client-side BM25 retrieval over public/masterbook + public/library (extracted PDF/DOCX/PPTX text), top passages sent to the ask-sources edge function, which streams a cited answer from the AI Gateway.
- Podcast queue, speed and resume positions are stored per device in localStorage.
