# Other Systems, Natal Chart, Shared Podcasts, and Accessibility

## Build

1. **Make “Create a Topic & Page” unmistakable**
   - Keep it at the bottom of Begin.
   - Give the menu item a persistent semi-transparent yellow-orange glow, with a stronger accessible focus state and reduced-motion fallback.

2. **Expand Other Systems**
   - Add an Other Systems dashboard comparing recurring themes, agreements, differences, and the method behind each interpretation.
   - Add at least seven dedicated, linked systems: Vedic/Jyotish astrology, Mayan Tzolkin, Tibetan Mewa/Parkha, Japanese Nine Star Ki, Chaldean numerology, Tarot birth cards, and Celtic tree calendar.
   - Calculate what can be derived from April’s known birth data; clearly label symbolic/reflection-based material and avoid presenting it as scientific fact.
   - Add all pages to the Other Systems menu and cross-link them from the dashboard.

3. **Complete April’s real natal chart page**
   - Generate the wheel from April’s stored birth data and existing astronomy calculations.
   - Show planets by sign and house, house cusps, major aspects with orbs, and a readable aspect table.
   - Add a clean print layout that removes navigation and controls while preserving the chart, positions, and aspect details.

4. **Share generated podcasts between April and Shane**
   - Extend saved episodes with a generated cover image reference and shared-space visibility.
   - Keep audio and cover files private, using short-lived access links.
   - List shared episodes in the shared space and Podcasts page, with title, cover, playback, queue/resume controls, and ownership-safe deletion.
   - Preserve access for exactly April and the two approved Shane accounts through database/storage rules, not browser-only checks.

5. **Keyboard and screen-reader pass**
   - Walk Wonderings, Sources Reading Room, and private chat using only keyboard controls at desktop and phone sizes.
   - Fix dead links, focus order/visibility, menu and dialog focus handling, unlabeled controls, status announcements, heading/landmark structure, and minimum tap targets.
   - Verify the public Reading Room directly and the private pages with an approved session when available; document any account-only blocker rather than bypassing access controls.

## Technical details

- Reuse the existing design tokens, chart math, private storage, player, and shared-space membership functions.
- Add schema only where needed for podcast cover/shared metadata, with explicit grants, row-level access rules, and regenerated types.
- Keep generated and interpreted content April-specific; Shane appears only in relationship material.
- Add focused browser checks for chart rendering/printing, menu highlighting, dead routes, and keyboard navigation.
- Update the project roadmap and architecture notes for the new systems registry and shared-podcast data model.
