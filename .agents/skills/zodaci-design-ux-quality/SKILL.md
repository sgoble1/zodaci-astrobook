---
name: zodaci-design-ux-quality
description: Enforce Zodaci design, UX, layout, copy, accessibility, motion, SEO and code quality, and hunt known bug patterns (controlled inputs, OAuth destination loss, stale cover preview, lazy-load blank screen, admin bypass, cache invalidation, checkout polling). Use for any UI change, polish pass, bug sweep or quality audit.
---

# Zodaci Design, UX & Build Quality

Source spec (Skills 1–10 + bug checklist appendix): `references/source-design.md`. Each section follows DETECT → DIAGNOSE → FIX → VERIFY; follow that order.

## Precedence — critical
The source uses literal classes like `text-white`, `bg-[#07080F]`, `text-amber-300`. In this project use the semantic tokens in `src/index.css`/`tailwind.config.ts` mapped to the Digital Sanctuary palette (bg #07080F, surface #0D1028, violet #8B5CF6, gold #D4A853, text #E8E0F0, muted #A89EC0, blue #3B82F6). Fonts: DM Serif Display headings, Fira Sans body. No decorative numeric eyebrows. Animations extremely slow, respect reduced motion. Memory wins on conflict.

## Checks
1. Design: grep for hardcoded hex/`text-white`/`bg-black` in `src/components` and `src/pages`; replace with tokens. Display/H1 never bold.
2. Components: shadcn Button/Dialog; inline field errors; shape-matched skeletons; empty states with a next action; toasts for outcomes.
3. Layout: no overflow at 393px; sticky header offset for anchors; scroll-to-top on route change; one z-index scale; ChartWheel square and responsive.
4. Copy: warm, precise voice; errors say what happened + what to do; specific CTA verbs; unique page titles.
5. Bugs (5.1–5.7): rg for each pattern; root boundary catches lazy failures; OAuth keeps `next`; caches owner-keyed and invalidated on auth change.
6. Routing: new routes registered, reachable by direct URL, added to the nav registry.
7. Quality: effect deps, no stray console.log, typed code, lazy images with dimensions.
8. Accessibility: WCAG AA contrast, visible focus ring, labels/aria on icon buttons.

## Verify
Playwright screenshots at 393px and 1280px of changed pages, console errors checked, related tests run, build log clean. Report anything unverified.
