---
name: zodaci-marketing-growth
description: Write and implement Zodaci marketing and growth work — conversion flow, homepage hero, pricing page, FAQ, email sequences, SEO content, referrals, social sharing, community growth, analytics metrics. Use for public-page copy, pricing presentation, funnels, emails, share buttons or growth features.
---

# Zodaci Marketing & Growth

Source spec (Section D): `references/source-vol2.md`.

## Precedence — critical
The source document contains example prices and names (e.g. "Print Standard $59", "Digital PDF $19.99") that do NOT match the business. Always use project memory: plans, AstroBook five versions and AstroComic prices from `mem://business/*` and `src/lib/plans.ts`. Site is Zodaci; AstroBook is only the printed book. Never fabricate testimonials, reviews, user counts or quotes — use placeholders and ask the owner.

## Rules
- Four-stage flow: Discover → Try (free chart/preview) → Convert (plan/book) → Retain (readings, community, comic). Every public page has one clear next step.
- Hero: specific outcome headline, one primary CTA, one secondary; no generic AI phrasing.
- Pricing: explicit edition/format labels, itemized totals, refund policy (7-day first payment), FAQ incl. birth-data security, unknown birth time, refunds, shipping.
- Emails: only once a sender domain exists; otherwise report it as blocked.
- SEO: unique title/description per page, canonical, one H1, structured data where honest.
- Referrals/sharing: never expose private chart data in share payloads; public chart shares are opt-in.
- Analytics: use activity_events rules (no typed text/private chat).

## Verify
Browser-check changed public pages signed out at 393px and 1280px; confirm prices on page match `plans.ts`.
