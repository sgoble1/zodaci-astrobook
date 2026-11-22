# Zodaci UX overhaul: baseline and coverage

## Evidence status
- Source-confirmed: public header already has four pillars; member navigation, Instructions and search use the shared registry. Member/founder shells already have breadcrumbs, next steps and account-aware menus. Extend these rather than replacing them.
- Source-confirmed: public breadcrumbs currently recognize only one-segment Academy/Learn/reading-room/theme detail paths, leaving other nested public journeys without the same shared coverage.
- Source-confirmed: public dropdown destinations have no explicit current-page styling; some mobile links and breadcrumb targets are smaller than the requested 44px target.
- Source-confirmed: shared Dialog/Sheet controls use Radix dismissal and focus management, but their close controls are small; Dialog has no default viewport-height constraint, and Sheet opening takes 500ms.
- Source-confirmed: stepped film specks, projector flicker, grain and gate movement remain in global CSS. Film specks currently jump from invisible to 0.9 opacity and back in a narrow interval.
- Source-only risks: all destructive paths, async forms, loading/empty/error states, contrast pairs and overlay exceptions still need a complete inventory. Do not describe them as universally broken or fixed.
- Browser observation: initial fresh 375px visits to /coming-soon, /demo, /pricing and /astrobook remained blank during the short baseline capture, with no H1/main and no pageerror. These are NOT successful reflow checks; diagnose loading/network/startup before relying on screenshots.
- Source-confirmed after the follow-up request: `personalPreview.ts` fixes the primary book at 28 numbered faces and `prosePage` selects one bounded face from topic prose. Fuller chapters must paginate the substantive source content instead of relaxing fonts or filling space. Full-book edition coverage and saved source chapters remain authoritative.

## Navigation context map
| Surface | Context | Existing behavior | Required verification |
|---|---|---|---|
| PublicHeader / footer | Public or signed-in visiting public pages | Four pillars, account link, Radix mobile sheet | Page/section active state, 44px links, route-change dismissal, public-only disclosure |
| MemberHeader / mobile tabs | Signed-in member | Registry-based domains, gates, account-only administration | Parent section remains active on nested destinations; keyboard and touch navigation |
| WayfindingTop / NextStepPanel | Signed-in member | Breadcrumbs, domain tabs, saved-chart prompt, next steps | Every detail path gets a useful stable parent; no duplicate chrome |
| Founder sidebar / trail / next | Authorized edition owner/shared viewer | Edition-specific normalized groups and account restrictions | Authorized titles only; same trail/menu/next grouping; no chart substitution |
| Search / Instructions | Member, authorized founder titles | Shared destination registry | Correct active context and direct-link recovery; no private-text indexing |

## Journey checklist
First visit → product/tool/sample → sign-in → birth details → first chart → reading/book → library/return → support.

For each applicable page, record role, input, outcome, pending/empty/error/retry state, parent destination and next action. Include order pending/cancelled/confirmed states without changing payment verification or making a real purchase.

## Severity and release gates
1. Blocking: blank startup, inaccessible content, data loss, clipped readers, unusable mobile controls.
2. High: missing dismissal/confirmation/retry, lost navigation context, unreadable contrast/focus.
3. Polish: spacing, action hierarchy, headings, copy and animation calibration.

Verification must use rendered pages, not redirects, loading shells or empty captures. Report role/edition access and external transaction limits explicitly. No unrelated roadmap item becomes completed through this audit.