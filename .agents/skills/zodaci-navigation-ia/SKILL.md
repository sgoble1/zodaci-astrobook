---
name: zodaci-navigation-ia
description: Audit and redesign Zodaci navigation and information architecture — header, mega-menus, mobile tab bar, sidebar, footer, Explore hub, domain hub pages, breadcrumbs, progressive disclosure, orphan pages. Use when the user asks to reorganize menus, fix findability, add a page to navigation, or verify navigation.
---

# Zodaci Navigation & IA

Prime directive: NEVER remove a page, route or feature. Restructure how people find things.

Full source plan (domain map, mega-menu content, Appendix A page→location table, decision tree): `references/source-plan.md`. Read the relevant section before editing.

## Precedence
Project rules (AGENTS.md, project knowledge, memory) win over the source plan. In particular:
- Navigation, member search and Instructions share one registry — change the registry, not hand-built lists.
- Signed-out shell shows public chrome only on SIGNED_OUT_PATHS; private items never appear signed out.
- April-only pages stay aprilOnly(); admin items never mix into member menus.
- Use semantic design tokens, not `text-white`/hex classes shown in source code samples.

## Workflow: audit (zodaci-navigation-audit)
1. Map every nav source: header, sidebar, mobile menu, footer, dashboard quick links, next-step CTAs, breadcrumbs. Note visibility conditions (auth, role, plan, founder) and mobile/desktop.
2. Classify each link by context: A Public, B Free, C Paid, D Admin/Founder.
3. Score each page in `src/pages` and App routes: 1 Primary (1 click), 2 Secondary (mega-menu), 3 Tertiary (domain hub), 4 Utility (account menu/URL).
4. Flag: >7 items at a level, scattered similar features, dead ends, orphan pages, duplicates, admin/user context collapse.
5. Write findings to `docs/navigation-audit.md` before changing code.

## Rules
- Top level ≤7 items (5–6 ideal); group by user intent into the 6 domains from the source plan.
- Progressive disclosure: deep systems (Feng Shui, Flying Stars, Bagua…) live under Explore/Other Systems.
- Gated items show a lock/plan badge, never vanish silently for signed-in members.
- Every domain has a hub page (hero, primary actions, grouped cards, next steps).
- Every page ends with a "Continue exploring" next-step block — no dead ends.
- Breadcrumbs on depth ≥2 pages; back navigation returns to the origin context.
- Route change: close mega-menu, close mobile menu, scroll to top, update active state, move focus to main.

## Workflow: verify (zodaci-navigation-verify)
Drive Playwright at 393px and 1280px, signed out and signed in (admin and non-admin when possible):
- Every route in Appendix A reachable within its target click depth.
- Mega-menu closes on outside click, Escape, and route change; keyboard operable.
- Mobile bottom tab bar visible below `md`; no horizontal overflow.
- No private/admin links visible signed out. Report results; list unverified roles.
