# Integration, data and workflow reliability audit

This scope supplements the comprehensive UX plan. It does not replace launch plans or authorize real purchases, messages, provider charges or print dispatches.

## 1. Integration inventory and handshakes
Inventory each connection, the pages/functions using it, environment mode, credential names (presence only), authorization, request/response contract, retries, provider effects and visible outcome.

Cover Stripe memberships, credits and existing book/comic checkout; Shopify catalog/cart/order linkage and signed order webhooks; Lulu frozen-PDF fulfillment/webhooks; notify.zodaci.com confirmations, release alerts and gifts; private file uploads/downloads and signed audio; AI streaming/generation APIs; workspace-feed delivery; authentication redirects and sessions; other external calls discovered in the inventory.

Check raw-body signature verification, payload validation, ownership/entitlement checks, live versus sandbox separation, valid provider identifiers, duplicate/replayed notices and monotonic order transitions. Payment redirects never grant membership or mark orders paid. Existing server safeguards remain authoritative.

For every user-initiated call, provide pending, completed and actionable failed states. Background webhooks use safe persisted operational status/admin feedback where relevant rather than inventing a visitor toast for an unseen event. A notification failure must not masquerade as a failed verified purchase or trigger another charge.

## 2. Data contract trace
Trace UI field → query/mutation → function validation → external payload → stored result → UI readback. Check actual field names/types/nullability against the live schema before edits.

Detect missing environment configuration without logging values, unchecked HTTP status, malformed/partial responses, silent catches, stale cached data and incorrect cache identity. Invalidate affected owner-keyed caches after successful mutations; clear/fence private results on sign-out/account changes.

Bound network timeouts, cancel obsolete requests and retry only safe recoverable operations. Mutations need idempotency before automatic retry; authorization failures stop retries and offer the correct sign-in/access path. Never use invented chart facts, fake purchase outcomes or sample content as production-error fallback.

## 3. Stress matrix
Exercise rapid double-clicks on submit/save/delete; repeated requests and webhook replays; null/empty fields; very long strings and large lists; zero/negative/out-of-range numeric values; expired sessions; timeout/offline/reconnect; responses arriving out of order; account changes during generation; close/unmount and reopen while requests remain pending.

Verify busy/disabled controls immediately prevent duplicate actions, server guards prevent duplicate external effects, input constraints produce specific inline feedback, cancellation preserves intended data, and stale results cannot overwrite newer input or another account. Preserve existing leases, generation tokens, idempotency keys and credit-spend fences rather than adding competing safeguards.

Use focused tests with controlled deferred responses for races and duplicate calls. Test concrete outcomes and readback, not copies of the implementation or styling snapshots.

## 4. Multi-step journeys
Trace sign-in/next destination; birth onboarding; calculator/results; reading/context interview/refresh; book customization/preview/PDF; comic generation; gift buyer/recipient claim and isolated chart; checkout cancellation/pending/verified confirmation; upload/library/playback; shared-space selection; relevant administration.

At each step, test direct URL, back/forward, refresh, allowed skipping, validation errors, session expiry and resumed work. Define authoritative persisted state versus temporary input; do not persist sensitive drafts casually or move private context into public/browser-global storage. Identify unreachable/stuck steps, lost intermediate work and stale state before fixing them.

## 5. Production test/mock audit
Search production execution paths for hardcoded test identifiers, mock API responses, success fallbacks and sandbox-only credentials/constants. Do not delete legitimate isolated public fictional demo charts, labelled samples, astronomical benchmarks, fixtures or deliberate sandbox controls. Confirm isolation and classify each match before changing it.

## Acceptance and limits
Maintain a connection/flow matrix: observed defect or source risk; input/output contract; role; test; final UI/readback; provider result; blocker. Validate signatures, payload guards and denied access independently of visible controls. Use provider test modes for charge-bearing flows only when configured and authorized; no production purchase/email/print effect without approval.

Externally unavailable credentials, Shopify installation/registration, live email delivery, supplier proof acceptance and inaccessible founder/paid accounts are named blockers, not assumed successes. Read schema/grant/role guidance before migrations or permission changes. Deploy any changed functions and verify live responses safely before claiming integration repair.