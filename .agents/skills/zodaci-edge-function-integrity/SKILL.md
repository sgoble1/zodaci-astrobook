---
name: zodaci-edge-function-integrity
description: Audit and change Zodaci backend functions safely and run the cascading-fix protocol — CORS, auth, input validation, payments webhook idempotency, checkout price validation, ask-sources, private-edition manifests, make-podcast limits, topic-readings jobs, pre-deploy checklist. Use when editing any backend function, schema, price map, platform setting, or anything with downstream consumers.
---

# Zodaci Function Integrity & Cascade Protocol

Source spec (Sections B, C, E.1, E.3): `references/source-vol2.md`. Read `supabase/functions/AGENTS.md` first.

## Precedence
Project rules win over source samples: checkout validates advertised amounts and pins environment; clients never confirm payment; claim jobs before AI and token-fence terminal writes; admin only via has_role-checked RPCs/functions; PDFs freeze before checkout. Plan prices come only from `src/lib/plans.ts` and its server mirror.

## B.1 audit checklist (every function)
1. Shared CORS headers; OPTIONS handled.
2. JWT verified in code where required; role checked server-side.
3. Every input field validated; 400 on bad input.
4. Correct status codes on every error path; no secrets or stack traces in responses.
5. Idempotency for webhooks (record event id before processing).
6. Timeouts, size limits and cleanup on failure (podcast, art, PDFs).
7. AI model choice and limits documented in AGENTS.md.

## Cascade rule (C.1) — deploy-blocking
After ANY change to calculations, schema, function contract, routes, price map, settings or content values: find every consumer (`rg` the symbol/table/function name across `src` and `supabase/functions`), check each against the C.2 trigger matrix in the reference, fix them in the same turn, and list what was checked in the reply.

## Verify
- Deploy changed functions; call them with curl for success, bad input, signed-out and non-admin cases.
- Check function logs for errors.
- Run related tests and the E.1 pre-deploy list (build clean, routes registered, RLS on new tables, no console errors).
