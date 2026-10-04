# Workbook clarity, chat choices, and podcast privacy

## What will change
- Give the entire April's Workbook menu group a light yellow tint and make its title a clearer yellow highlight, preserving the existing transparency.
- Add short plain-language explanations beneath technical headings and unfamiliar terms, especially across the chart, Workbook, and Other Systems pages.
- Turn “Chat about this” into a small destination menu: Shane or April, Therapy Oracle, SmarChat, or Ask the Sources. Carry the current page into the chosen conversation.
- Add a podcast privacy choice before creation: save privately or add to the shared library. Show ownership and sharing status in the podcast list, with a control to share or make private later.

## Technical details
- Reuse the existing chat routes, shared conversation creation, source-aware chat, and Therapy Oracle session flow instead of adding duplicate chat systems.
- Persist the selected podcast visibility in the existing `shared_with_space` field and keep storage access enforced by the current private-library rules.
- Preserve existing page structure and design tokens; changes remain focused on menu styling, explanatory copy, routing context, and podcast visibility.

## Verification
- Check the Workbook menu on desktop and mobile.
- Test each chat destination from a content page and confirm the page context arrives.
- Create one private and one shared podcast, confirm visibility controls, playback, and cover display.
- Confirm the build and relevant keyboard/screen-reader labels.