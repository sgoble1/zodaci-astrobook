# Home slideshow: fix slide 1 layout, match slide 2 colours, phone-friendly

## What's wrong now (seen in screenshots at your 950px preview and at phone size)
- **Slide 1 (the Cartographer woman):** at mid-size screens she drops below the fold and looks small. The headline breaks mid-word ("UNDERSTA / ND"), and the Map Key box squeezes the left side. On a phone she sits above the headline and the layout works, but the image is cropped tight.
- **Slide 2 (faces looking up):** the illustration has warm brown and teal tones. The other slides use the Blend palette (archive cream, deep indigo, shop yellow, shop red, brass).
- The slide controls cover the artwork on slide 2 at mid-size screens.

## Changes
1. **Slide 1, a two-column layout:**
   - The woman becomes the dominant figure, filling about 55% of the slide height on the left, with the projected zodiac wheel above her pointing hand.
   - The headline, script line, three lines and buttons sit on the right.
   - The Map Key becomes a slim strip under the text on large screens and is hidden below 1024px, so it never crowds the woman.
   - The headline scales with screen width and never breaks inside a word.
2. **Slide 1 on phones:** the woman and wheel stay on top at a taller, uncropped height, with the text below. Buttons are full-width, and the text has room above the slide controls.
3. **Slide 2 colours:** I'll re-tint the faces artwork to the Blend palette: indigo sky, cream skin highlights, yellow stars and brass planets. I'll do this as an edited copy of the same image, so the composition and faces stay the same, and add a light indigo overlay so it sits with slides 1 and 3. The original file stays in the project.
4. **Slide controls:** they move into a fixed bar under the slide on every size, so they no longer cover any artwork.
5. **What stays the same:** the slide order (Cartographer, faces, Take the Sky Home), all copy, the Yellowtail subheading, the slow animations, and the "Take the Sky Home" slide.

## How I'll check it
Screenshots of every slide at 393, 768, 950 and 1280 widths. I'll confirm there's no sideways scrolling, no words split, the woman is fully visible and nothing is covered by the controls.

## Technical details
- I'll edit the `ChartMapSlide` and `LookUpSlide` layout and their CSS in the landing styles, using the existing tokens only.
- The headline uses `clamp()` sizing with `hyphens: none` / `overflow-wrap: normal`.
- The slide 2 image is edited with the image editor into a new file in `src/assets`; the original is kept.
