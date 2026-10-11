# AstroBook Public — fresh public version

April's AstroBook stays exactly as it is. This draft becomes a new public version that anyone can join. April's books, chart, family details, admin usage feed and private chats are never copied into it.

## 1. Fresh start
- Remove everything that only applies to April: her hard-coded chart, her protected book text, the password gate, the shared space limited to two hardcoded emails, the April-only page filters, and her generated plates.
- Keep the reusable parts: the chart engine (planets, houses, Chiron, house systems), the chart wheel, Other Systems math, Kua, numerology, synastry, podcasts, the media library, page creation, counselors, and Ask.
- Allow search engines on the marketing pages only. Every member page stays hidden from search.

## 2. Sign-up and birth data onboarding
- Sign up with email or Google. Onboarding is a 4-step wizard: name, birth date, birth time (with an "unknown time" option), and birthplace search (location and time zone found automatically).
- After onboarding, the chart is calculated in the browser, saved to the user's profile, and checked with the existing accuracy audit, so the user sees a data-quality score.
- A "Building your AstroBook" screen shows progress while their personal readings are written.

## 3. Personal readings made from each chart
- Each user gets the same set of pages: Sun, Moon, Rising, each planet, each house, top aspects, Nodes, Chiron, Other Systems, Timing.
- AI writes each page from that user's calculated placements only, to a fixed structure and length (for example about 600 words, with Key facts, In plain words, Daily life, Reflection questions and "Verify the claims"). Readings never invent family or life events.
- Pages are generated in a background queue and saved, so each one is written once and reused. A Regenerate button costs one credit.
- Each page gets a generated illustration made from its own sign and planet combination, so no two pages show the same picture.
- Users can still upload their own books or PDFs. Those become private sources that Ask and the page writer can quote.

## 4. Unique graphics on every grid of boxes
- Fix Explore & Discover: every box gets its own image (today several share one).
- Give every box its own graphic on all box grids: Themes, Library topics, Other Systems, Workbook modules, Planets, Houses, Signs and Instructions.
- Use a pre-made set of art: 12 signs, 10 planets, 12 houses, 7 systems and the topic images. Each box gets its picture from what it is about, so new boxes are covered automatically.

## 5. Shared spaces with invites
- Any member can create shared spaces and invite people by email. The invite email has a join link; roles are owner and member.
- Shared spaces keep all of today's features: chat, posts, Reading Together, media folders, recommendations, notes, wonderings, and comments with reactions. Access is enforced by the database through space membership, never by fixed email lists.
- Relationship pages compare two members' charts once both people agree.

## 6. Subscriptions
- Free: birth chart wheel, Big Three readings, the daily transit summary, one shared space, and 5 AI messages a month.
- Plus (monthly or yearly): every reading page, Other Systems, Timing, the Workbook, and 200 AI messages.
- Pro: unlimited readings, counselors, podcasts, page creator, unlimited shared spaces, synastry, and a printable PDF book.
- Locked content shows a blurred preview with an upgrade button. Checkout, billing and invoices are handled by the payment service (Stripe or Paddle; I'll recommend one at the start of building). Subscription status is checked by the server before any paid content is shown.

## 7. Effective homepage
- A sample chart wheel that moves on the opening screen, with "See your chart free" and a quick birth-date form.
- A "How it works" strip, sample reading previews, a counselor demo, and an Other Systems showcase.
- A pricing table, frequently asked questions, a privacy promise and an accuracy note (NASA-checked positions). Real testimonials can be added once members share them.

## 8. Organized generated content
- Each user has a "My AstroBook" library grouped into Chart, Life Areas, Systems, Timing, Created Pages, Podcasts and Uploads, with search, filters, sorting and pinning.
- Pages the user creates go into a section they choose and get a matching graphic.

## 9. April-only requests
The four counselor and chat requests in your note are for April's private site. They are not part of this public version. The Oracle Within and the Social Counselor already reply live with AI. A follow-up in April's main project can add:
- longer counselor profiles with their astrological background
- a standalone "Ask anything" chat page
- AI usage counts in the Usage feed

In the public version, every member gets their own counselors, with profiles tuned to their own chart.

## Recommendations (50)
1. Free instant chart before sign-up, then save it by signing up.
2. "Unknown birth time" mode that hides houses and Rising and says why.
3. Birth-time rectification helper (questions about life events → likely time range).
4. Daily horoscope from the user's real transits, sent by email or push notification.
5. Weekly email digest of upcoming transits.
6. Transit calendar with export to Google or Apple Calendar.
7. Retrograde and eclipse alerts tied to the user's own chart.
8. Moon-phase tracker with journaling prompts.
9. Year-ahead report (solar return) as a paid add-on.
10. Printable or PDF AstroBook as a premium export.
11. Gift subscriptions and gift reports.
12. Referral program: invite 3 friends, get a free month.
13. 7-day free trial of Plus.
14. Annual plan discount (two months free).
15. Synastry compatibility score with an explanation for each aspect.
16. Composite chart for couples.
17. Family or group view for shared spaces (everyone's Big Three side by side).
18. Shareable social cards ("My Big Three") with a link back to sign-up.
19. Install the site as a phone app (works offline).
20. Dark and light themes with a smooth switch between them.
21. Ask the Sources over the user's own uploads.
22. Voice input for the counselors.
23. Read-aloud audio for every reading page.
24. Short, Standard and Long podcast lengths, with daily podcast episodes.
25. Journal with mood tracking linked to transits.
26. Habit or ritual suggestions based on chart elements.
27. Clearly labeled "Astrology vs evidence" notes, building trust.
28. Accuracy badge showing NASA-checked positions on every chart.
29. Choice of house system remembered per user.
30. Tropical or sidereal (Vedic) zodiac toggle.
31. Multiple saved charts: friends, children, celebrities.
32. Celebrity chart comparisons ("you share Moon in Aries with…").
33. Onboarding tour with plain-language tooltips.
34. Glossary popovers on every astrology term.
35. Progress tracker: "You've explored 12 of 40 pages."
36. Badges for completing workbook modules.
37. Counselor safety layer pointing to crisis resources.
38. Clear privacy controls: download or delete all my data.
39. Admin dashboard for sign-ups, conversions, churn and AI cost per user.
40. Aggregated, anonymous product analytics, with consent.
41. A/B test the homepage headline and pricing.
42. Search-friendly public pages for each sign and planet, to bring in visitors from Google.
43. Blog or "Learn astrology" articles for search.
44. Multi-language support (Spanish first).
45. Accessibility: keyboard and screen-reader checks on every new page.
46. Fast loading: images load only when needed and readings are kept once generated.
47. Rate limits and credit caps per plan to control AI costs.
48. Customer support chat and a help center (from the Instructions registry).
49. Status emails: chart ready, invite accepted, payment receipts.
50. Terms, privacy policy, and an astrology "for entertainment and reflection" disclaimer.

## Build order
1. Fresh start and sign-up onboarding
2. Personal reading pages and art
3. Unique box graphics everywhere
4. Shared spaces and invites
5. Subscriptions and locked content
6. Homepage
7. Library organization
8. Top recommendations: 1, 2, 4, 13, 18, 19, 28, 38, 47, 50

## Technical details
- New tables: profiles (birth data and chart in JSON form), charts (several per user), generated_pages (user, page key, content, image path, version), spaces, space_members, space_invites, subscriptions, ai_usage. All of them have owner or member access rules and the required permissions. Existing shared_* tables gain a space_id column, and their access checks move to is_space_member(space_id), replacing the hardcoded email checks.
- The schema changes are prepared as additive migrations and take effect when the draft is accepted.
- New backend functions: generate-reading (default AI model, fixed outline, cites placements), generate-art (image model, stored in a private bucket), send-invite (email), payment webhook, plus a check-entitlement helper used by every paid function.
- Box art: one illustration-picking helper (`artFor(key)`) shared by all box grids.
- Usage limits are checked on the server per plan; when credits run out, users see a clear "out of credits" message (402).
