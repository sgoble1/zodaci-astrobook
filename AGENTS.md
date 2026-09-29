
- Masterbook text lives as per-chapter markdown in public/masterbook (index.json + {id}.md), generated from the uploaded .docx; fetched on demand to keep the app bundle small.
- Podcasts and added source files use one library_items table + private "library" storage bucket with signed URLs; public read, owner-only write (workspace blocks public buckets).
