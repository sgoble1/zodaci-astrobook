# Zodaci: Finish Every Remaining Item

Sources reviewed: the project task list, the three audit notes (navigation, marketing, experience), both archived build plans, a code scan for unfinished spots, the full test suite (275 passing), the dependency scan (clean) and earlier chat decisions.

## A. Work I can finish now

### 1. April's account (Founder Edition)
- Reorganize her side menu into clear groups by purpose: Her Chart, Life Areas and Houses, Timing and Cycles, Other Systems (Feng Shui, Kua, Numerology), Masterbook and Compendium, Shared with Shane, Workbook and Counselors. Only the order and grouping change. Every page and item stays, and her private text stays private.
- Show her personal chart title and the new glowing planet artwork on her home page, planet pages and Compendium planet tables.
- Keep the "Switch to classic view" button. Also show it in the account menu so she can find it on her phone.
- Keep April's Kua discrepancy (1 from the source, 8 from the formula) shown exactly as it is now.

### 2. Shane's account
- On the admin page, put "View April's edition", "Open in a new tab" and "Classic view" together in one clearly labelled panel.
- Show a clear label so Shane always knows whose view he is looking at.
- The classic view also switches cleanly while Shane is viewing April's edition.

### 3. Planet graphics everywhere planets appear
- Add the glowing planet spheres to Our Two Charts, Transits, the Results Deep Dive, Key Findings, the AstroBook planet chapters preview and the public sample chart on the homepage.
- Planets that move slowly through a reduced-motion setting appear without animation; no page waits on the artwork to load.

### 4. Menus and navigation follow-ups
- Check the "Opening Zodaci…" screen on My Library. If it gets stuck, fix it. If it was only a timing artifact, record that.
- Check the phone top bar after scrolling. If the bar sits mid-screen, fix it.
- Verify the menus as a regular member and signed out, at phone and desktop sizes. Record the results in the navigation notes.

### 5. Missing features found in the code
- Deep Dive says the asteroids Ceres, Pallas, Juno and Vesta are "not yet calculated". Add them from the chart engine, with regression tests within 1 degree of reference values. Turn this on only if reference values exist in the tests or you supply them. Values will never be guessed.
- The Brand page "Sky notes, coming soon" is accurate, because email sending is not set up. It stays as-is until a sender domain exists.

### 6. Quality pass
- Run the full test suite, the security scan and the dependency scan. Fix any errors they report.
- Check every changed page in the browser at phone and desktop sizes, with no errors and no sideways scrolling.

## B. Waiting on you (cannot be finished without your input)

| Item | What is needed |
|---|---|
| Automatic AstroBook printing | Lulu client key and secret |
| AstroComic physical printing | Printer account |
| Newsletters, digests, shipping emails | Email sender domain |
| Testimonials and user counts | Real customer quotes and numbers |
| Sabian symbols | A licensed source text |
| Printed delivery cost | A real print quote (currently an editable estimate) |
| Social media footer links | Your account URLs |
| April's own walkthrough of the classic view | A session in her account (or her approval to test) |

## Technical details

- April menu groups come from her private edition payload, so the regrouping happens in the side menu component by mapping group titles to new sections. It does not rewrite stored content.
- The classic view stays a presentation-only setting. Access is still decided by the database membership checks.
- The planet spheres reuse the existing planet component. Asteroids require new engine bodies, reference tests, and the chart cascade check (readings freshness, wheel, transits, compatibility, book manifests).
- The task list and navigation notes are updated as each item closes.

## Order of work

```text
1 April menu + classic view access -> 2 Shane panel -> 3 planet graphics
-> 4 navigation checks -> 5 asteroids (if references available) -> 6 quality pass
```
