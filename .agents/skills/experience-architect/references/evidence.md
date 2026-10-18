# Evidence and evaluation

These are established references, not proof of a latest trend or guaranteed conversion lift. Recheck updates when recency matters.

- Navigation discoverability: https://www.nngroup.com/articles/hamburger-menus/ — keep frequent destinations visible; use a labeled secondary menu.
- Progressive disclosure: https://www.nngroup.com/articles/progressive-disclosure/ — reveal specialized depth without hiding price, limitations, or recovery actions.
- Type scale: https://design-system.service.gov.uk/styles/type-scale/ — consistent heading/body/control hierarchy and relative sizing.
- Accessibility: https://www.w3.org/WAI/WCAG22/Understanding/ — reflow, contrast, focus, keyboard operation, target size, input errors and motion. Distinguish AA requirements from AAA recommendations.
- Forms: https://design-system.service.gov.uk/get-started/labels-legends-headings/ — clear questions, associated labels, coherent steps.
- Checkout friction: https://baymard.com/research-articles/make-guest-checkout-prominent — evidence for guest checkout where product/security rules permit it. Never remove an existing identity requirement without authorization.

## Audit output

For each finding record: role and state; journey step; observed evidence; user impact; severity; proposed correction; dependencies; acceptance check. Mark source-only suspicions as unverified. Separate bugs from opportunities and external blockers.

For each product recommendation record: unmet need; smallest useful experiment; member benefit; cost/privacy implications; success signal; whether approval is required. Never invent prices, testimonials, provider integrations, credit budgets or conversion forecasts.

## Validation matrix

Cover signed-out, free, paid, creator and administrator states where present. Verify first visit, return visit, empty, loading, partial, stopped, failed and completed states. Test authorization independently from visible locks.

Cover narrow 320px reflow, common phone sizes, tablet and wide desktop; 200% text enlargement; keyboard focus/escape/return focus; reduced motion; long labels; charts and PDF rendering. Use screenshots of relevant elements and observable final state, not screenshots alone, to verify interactions.

For commerce check selected product, full total, payment cancellation, pending/verified payment, fulfillment and authorized download. Never submit a real payment, send an email or place a print order without the necessary user authorization. Use sandbox/test flows and report unverified external steps.