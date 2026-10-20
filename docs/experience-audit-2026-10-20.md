# Zodaci experience and ecosystem audit

Direction: preserve Zodaci’s cinematic Digital Sanctuary and editorial reading experience. Connect discovery, sign-in, chart, reading, saved position and purchase return without mixing personal archives or inventing fulfillment readiness.

## Journey and evidence

| Role/state | Step | Evidence | Outcome / next action |
|---|---|---|---|
| Visitor | Discovery | Live `/index` redirects to `/welcome`; Academy, pricing, Compatibility and AstroComic render | Explore chart requires sign-in; demo stays public |
| Visitor | Sign-in | Live sign-in return links keep chosen annual Pro and original chapter destination | Signup mode opens account creation; normal sign-in opens Welcome back |
| Visitor | Private sources | Live `/read` and chapter link show Private reading room, not archived content | Sign in, then password gate; server still decides approved access |
| Free returning member | First useful result | Live saved chart dashboard and Big Three reading, with actual profile and content | Read, jump to sections, bookmark, return |
| Free returning member | Reading persistence | Added section bookmark, reloaded, confirmed saved state, then removed test bookmark | Owner-scoped saved state; no AI writing initiated |
| Free returning member | Save failure | Simulated rejected bookmark POST visibly reports failure | No false success; user may retry |
| Free returning member | Shared space | Live non-member account shows Your workspaces, no founder feed | Open an authorized invitation |
| Free returning member | Administration | Live `/admin?tab=upload` renders workspace, no upload button/file input | Edit owned saved sections and relationships only |
| Approved founder / admin | Private chapters and tools | Source inspected; current signed-in account and requester’s minted session are regular member, no password available | Full admin/founder walkthrough remains unverified |
| Paid/Cosmic | Purchase and generation | Existing rule tests pass; no paid session exercised this turn | Real payment, paid-return proof and AI writing not verified |

## Repaired findings

| Severity | Finding and impact | Correction | Acceptance evidence |
|---|---|---|---|
| High | Global bookmark cache could reuse a previous account’s list | Owner-keyed cache, auth invalidation, stale-request fencing and owner filters | Three store regressions; live save/reload/remove |
| Medium | Bookmark writes ignored errors and could announce false success | Throw write errors into caller recovery | Rejected save visibly reports failure |
| Medium | Pricing/signup and checkout dropped non-topic return destinations | Shared same-origin destination validation; preserve original next through signup | Destination regression tests; live annual-plan signup link inspected |
| Medium | Chapter readers lacked consistent phone navigation and robust recovery | Shared reader supports h2/h3, unique anchors, code-fence exclusion; retry and cancel stale loads | Parser tests; real member reading jumps/bookmarks on desktop and phone |
| Medium | `/index` did not identify a useful starting page | Redirect to public welcome | Live final URL and heading confirmed |
| Medium | Non-admin upload panel contradicted approved document plan | Upload tab admin-only, member defaults to Edit sections | Admin-tab regression; live member URL check |
| Low | Archive script called itself digital comic copy | Rename action Read issue plan | Source checked; illustrated PDF not claimed complete |
| Low | Community guidelines bypassed its availability switch | Same feature gate as community index | Source checked, not a security boundary |
| Low | Failed cinematic poster disappeared despite supplied fallback | Keep matching poster first, use supplied local image when unavailable | Live reduced-motion image loaded at 1536px; screenshot checked, no page errors |

## Validation scope

- 185 tests pass across 29 files; preview reports build OK.
- Public welcome, pricing, AstroComic and protected-reading gate reflow at 320, 393, 768 and 1440px without horizontal overflow.
- Real saved member reading tested at 1280×1800 and 393×690 with reduced motion; section link updates URL; save survives reload; test save removed.
- No browser page errors in completed runs. First-visit tour hid background controls during early attempts; final reading interactions used returning-member state.
- No payment, email, print order, new chart save, AI generation, role grant or publication performed.
- Public gate checks do not certify database policies. No fresh deep security audit completed this turn.

## Remaining release gates and external dependencies

- Every admin tab and approved April/Shane chapter read: authorized admin/founder session and content password needed.
- AstroComic is a deterministic 24-page script/issue plan, not a finished illustrated book. Production needs per-issue artwork, funded generation, printer specification and private authorized PDF pipeline. Printer credentials alone do not finish it.
- Automatic Lulu quote/order/tracking: supplier account/API credentials and tested print specifications.
- Newsletter/digests/shipping email: verified sender domain and delivery proof.
- Real card purchase and paid/Cosmic return/generation: authorized test purchase and appropriate session; untouched this turn.
- Sabian text: licensed source. Social accounts, real testimonials and usage counts: owner-provided verified facts.
- Combined upgrade plan is historical scope; old launch-plan prices/check counts are historical evidence, not current price authority. Current plan/edition modules remain authoritative.

## Small next experiments

- Return-to-reading after upgrade: preserve the destination, measure completed return clicks; do not initiate bulk writing or spend without member intent.
- Unified chapter reader: measure section use and resume success; bookmarks remain owner-only and source content stays protected.
- Finished comic pilot: one authorized subscriber issue before monthly scale, measuring artwork review time, page validation and authorized PDF download; needs funded art and printer specification.