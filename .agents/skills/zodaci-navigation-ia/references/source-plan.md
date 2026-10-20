# Document parsed from: Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx

## Page 1

Zodaci Lovable Skill: ○○○

# Table of Contents

## **Preface**

The Problem This Skill Solves · The Prime Directive · What This Skill Does

## **Section 1 — Current State Audit Methodology**

1.1 What Lovable Must Analyze Before Making Any Change

## **Section 2 — Information Architecture Principles**

2.1 The Six Core IA Rules · 2.2 The Domain Map — All 90+ Pages in 6 Domains

## **Section 3 — The New Navigation Architecture**

3.1 Desktop Navigation · 3.2 Mega-Menu Content · 3.3 Mobile Navigation · 3.4 Contextual Navigation

## **Section 4 — The Explore Hub Page**

## **Section 5 — Progressive Disclosure Rules**

5.1 What to Show and When · 5.2 Feature Gating Indicators

## **Section 6 — Domain Hub Pages**

6.1 Hub Page Standard Structure · 6.2 Hub Pages to Audit/Create

## **Section 7 — Navigation Component Implementation Plan**

7.1 Files to Create or Modify · 7.2 Navigation State Management · 7.3 Route Change Behavior

## **Section 8 — The Lovable Skill Instructions**

Skill: zodaci-navigation-audit · Skill: zodaci-navigation-verify

## **Section 9 — Content Density Management**

9.1 The Information Overload Problem · 9.2 Page-Level Density Controls · 9.3 Recommended For You System

## **Section 10 — Breadcrumb & Wayfinding System**

10.1 When to Show Breadcrumbs · 10.2 Back Navigation Behavior

## **Section 11 — Implementation Priority Order**

Phases 1-6: Architecture through Verify & Polish

## Page 2

Appendix A — Current Page → New Location Mapping (Full Table)
Appendix B — Quick Reference Decision Tree for Lovable

# Preface — The Problem This Skill Solves

Zodaci has grown organically to **90+ routed pages**, **20+ edge functions**, and dozens of features spanning natal charts, readings, AI chat, printed books, timing tools, relationship analysis, feng shui, numerology, Chinese astrology, community, academy, podcasts, and more.

The core challenge is not too many features — it is that excellent features are **buried**, navigation paths are **unclear**, and the cognitive load of the menu makes users unsure where to go next. This is an **information architecture problem**, not a content problem.

<table><tr><td>▶ The Prime Directive of This Skill<br />NEVER remove a feature, page, or route. Every existing page stays. Every route remains functional.<br />The goal is to restructure how users find and move through features — through smarter grouping, progressive disclosure, contextual navigation, and a simplified top-level menu. Features that are currently buried get surfaced. Features that are currently overwhelming in a flat menu get nested intelligently.</td></tr></table>

## What This Skill Does

- Audits the current navigation state across all components and layout files
- Groups all 90+ pages into 6 logical domains aligned with user intent
- Defines a clear 2-level navigation hierarchy (top-level nav + mega-menu panels)
- Implements progressive disclosure — show less upfront, reveal more on demand
- Builds contextual navigation (sidebar, tabs, next-step prompts) to replace flat menus

## Page 3

- Defines mobile navigation patterns separately from desktop
- Provides exact implementation code patterns for Lovable to follow

## Section 1 — Current State Audit Methodology

### 1.1 What Lovable Must Analyze Before Making Any Change

Before reorganizing anything, the agent must run a full audit across the codebase. This is non-negotiable — changes made without understanding the current state will break features and lose links.

#### Step 1 — Map All Navigation Sources

Find every place navigation links appear:

- The sticky header/navbar component <mark><u>src/components/layout/</u></mark>
- Any sidebar navigation components
- Mobile menu / hamburger menu component
- Footer links
- Dashboard quick-links or cards
- Inline "next step" CTA buttons on each page
- Breadcrumb trails

For each navigation source, document: which links are shown, what conditions govern their visibility (auth state, role, subscription level), and whether the link is mobile-visible or desktop-only.

#### Step 2 — Categorize Every Link by User Type

Every navigation item falls into one of four user contexts:

<table><tr><td>Context</td><td>User State</td><td>What They Can See</td></tr><tr><td>A — Public</td><td>Unauthenticated</td><td>Landing, About, Pricing, Blog, public topics, Academy (public sections), Demo</td></tr></table>

## Page 4

<table><tr><td>Context</td><td>User State</td><td>What They Can See</td></tr><tr><td>B — Free User</td><td>Authenticated, no purchase</td><td>Chart, Readings (limited), Masterbook (teaser), Pricing, Community</td></tr><tr><td>C — Paid User</td><td>Authenticated + order</td><td>Full chart, all readings, full Masterbook, their book editions, Workbook, Orders</td></tr><tr><td>D — Creator / Admin</td><td>Admin role</td><td>Creator dashboard, admin panel, Dispatch, data quality, Shane/April edition tools</td></tr></table>

# Step 3 — Score Each Page by Discovery Priority

For every page in <u>src/pages/</u>, assign a discovery score:

<table><tr><td>Score</td><td>Label</td><td>Reachable In</td><td>Description</td></tr><tr><td>1</td><td>PRIMARY</td><td>1 click from anywhere</td><td>Highest value user actions — must always be at the top level</td></tr><tr><td>2</td><td>SECONDARY</td><td>2 clicks</td><td>Important features for engaged users — lives in the mega-menu</td></tr><tr><td>3</td><td>TERTIARY</td><td>3 clicks</td><td>Advanced features for power users — discovered within domain hubs</td></tr><tr><td>4</td><td>UTILITY</td><td>Account menu or direct URL</td><td>Support, legal, admin — accessible without being in main navigation</td></tr></table>

# Step 4 — Identify the Current Pain Points

Look for these specific patterns in the current navigation:

- **More than 7 items** at any single navigation level (cognitive overload threshold)
- **Features of similar type** scattered across different menu sections
- **Dead ends** — pages with no "what next?" link

## Page 5

- **Orphan pages** — in <mark><u>src/pages/</u></mark> but not in any navigation
- **Duplication** — two nav items going to near-identical experiences
- **Context collapse** — admin items mixed with user items in the same menu

---

# Section 2 — **Information Architecture Principles**

## 2.1 The Six Core IA Rules for Zodaci

<table><tr><td>Rule 1 — The 7-Item Cap<br />The top-level navigation must never exceed 7 items (including the account icon). Psychological research consistently shows that working memory holds 5–9 items. For a dark, immersive app like Zodaci, 5–6 top-level items is ideal. Everything beyond 7 must be nested.</td></tr></table>

<table><tr><td>Rule 2 — Domain Grouping Over Feature Listing<br />Users think in terms of "what am I trying to do?" — not "what is the name of this feature?" Group navigation by user intent and activity domain, not by technical feature name. "Timing" (a domain) is better than listing Transits, Retrogrades, Profections, Personal Timing, and Solar Return all separately at the same level.</td></tr></table>

<table><tr><td>Rule 3 — Progressive Disclosure<br />Show the most common path. Reveal the full depth only when the user signals interest. A user should not need to see Bagua Reading, Flying Stars, and Feng Shui pages in the main menu. They should see "Other Systems" and discover these when they click in.</td></tr></table>

## Page 6

<table><tr><td>Rule 4 — Contextual Navigation Over Global Navigation<br />Not every feature belongs in the top nav. Many features are best discovered through contextual "next step" prompts within the flow. After viewing their birth chart, a user should see: "Explore your Readings →" — not a global menu item for every possible action.</td></tr></table>

<table><tr><td>Rule 5 — Mobile First Navigation Architecture<br />Design the navigation for a phone screen first. If it works in a bottom nav bar of 5 items on mobile, it works everywhere. Desktop gets to expand it. Mobile constrains it correctly.</td></tr></table>

<table><tr><td>Rule 6 — Role-Aware Menus<br />The same navigation should not appear for all user types. A free user seeing locked admin links creates confusion and mistrust. Use the user's auth context to show only what is relevant to them.</td></tr></table>

## 2.2 The Domain Map — All 90+ Pages Organized Into 6 Domains

This is the foundational architecture. Every page in Zodaci belongs to exactly one domain. These domains become the 5 main nav items (plus Account). The following six domain blocks define every page's permanent home in the new architecture.

<table><tr><td>DOMAIN 1 — MY CHART<br />|<br />Natal</td></tr></table>

## Page 7

<table><tr><td>&#x26;<br />Personal Data</td></tr></table>

<table><tr><td>Purpose: Everything derived from the user's own birth data.<br />Pages: BirthChart, Planets, PlanetDetail, Houses, HouseDetail, Aspects, StarMap, ChartCalculator, ChartElements, ChartGuide, MyChart, OurCharts, MemberChartSection, MemberStarMap, Profection, Purpose, PersonalContext, Deductions, Results<br />Discovery: PRIMARY birth chart   SECONDARY planets, houses, aspects   TERTIARY elements, guides, deductions<br />Mobile label: Chart    Icon: ◎</td></tr></table>

<table><tr><td>DOMAIN 2 — READINGS<br />|<br />AI Interpretations<br />&#x26;<br />Guidance</td></tr></table>

<table><tr><td>Purpose: Everything about receiving, reading, and exploring AI-generated interpretations.<br />Pages: MyReadings, Reading, Topic, TopicsIndex, MyTopicReading, Ask, Chat, Companion, MemberWorkbook (reading sections), PersonalTiming, RetroGood, Workbook<br />Discovery: PRIMARY My Readings   SECONDARY Topics, Ask   TERTIARY Companion, Workbook deep features</td></tr></table>

## Page 8

<table><tr><td>Mobile label: Readings    Icon: ✦</td></tr></table>

<table><tr><td>DOMAIN 3 — MY BOOK<br />|<br />The Product</td></tr></table>

<table><tr><td>Purpose: Everything related to the printed and digital AstroBook product.<br />Pages: MyMasterbook, Masterbook, MasterbookChapter, MasterbookContents, MasterbookContentsEntry, MasterbookSources, Volume2, ShaneEdition, AprilEdition, FounderTopics, Books, BookPreview, MyLibrary, MyUploads, AstroComic, MyComic<br />Discovery: PRIMARY My Masterbook, Book status   SECONDARY Chapters, Editions   TERTIARY Sources, Volume2 deep content<br />Mobile label: Book    Icon: ▣</td></tr></table>

<table><tr><td>DOMAIN 4 — EXPLORE<br />|<br />Discovery<br />&#x26;<br />Depth</td></tr></table>

## Page 9

<table><tr><td>Purpose: All expanded astrological systems, timing, relationships, and community.<br />Sub-groups:<br />•  Timing: Timeline, Transits, Retrogrades, PersonalTiming, SolarReturn<br />•  Relationships: Relationships, Compatibility, RelationshipDetail, RelationshipReading, RelationshipTimeline<br />•  Systems: FengShui, Bagua, BaguaReading, BaguaWheelPage, FlyingStars, Numerology, Chinese, Chiron, OtherSystems, Synastry<br />•  Community: Community, SharedSpace, SocialIntegration, Workspaces, Counselors, CounselorProfile, CounselorSession, Referrals<br />Discovery: PRIMARY Explore hub   SECONDARY Timing, Relationships   TERTIARY Systems, Community deep features<br />Mobile label: Explore    Icon: ⊕</td></tr></table>

<table><tr><td>DOMAIN 5 — LEARN<br />|<br />Education<br />&#x26;<br />Content</td></tr></table>

<table><tr><td>Purpose: All educational, reference, and media content.<br />Pages: AcademyHome, AcademyLesson, Blog, PublicArticle, Sources, SourceReader, Guides, Compendium, Instructions, Podcasts, PublicLibrary, PublicReader, PublicDocument, PublicThemes<br />Discovery: PRIMARY Academy, Blog   SECONDARY Sources, Guides   TERTIARY Compendium, Podcasts</td></tr></table>

## Page 10

<table><tr><td>Mobile label: Learn    Icon: ◇</td></tr></table>

<table><tr><td>DOMAIN 6 — ACCOUNT<br />|<br />Personal Management<br />&#x26;<br />Commerce</td></tr></table>

<table><tr><td>Purpose: All account management, orders, settings, and admin.<br />Pages: Dashboard, Onboarding, Orders, CheckoutReturn, Pricing, Referrals, MemberSystem, ExploreDiscover, Demo, FaqPage, PrivacyPage, TermsPage, ResetPassword, Verify, CreatorDashboard, Admin, Dispatch, DataQuality<br />Discovery: UTILITY accessible from avatar/account icon menu<br />Mobile label: Account    Icon: ◯</td></tr></table>

<mark>

<table><tr><td>▶ Public Marketing Domain (Not in Authenticated Nav)<br />Pages: LandingPage, Home, About, BrandLanding, BrandLaunch, PublicInfo — shown only before login, not in the authenticated application navigation. These pages must have their own public navigation separate from the authenticated app navigation.</td></tr></table>

</mark>

## Page 11

# Section 3 — The New Navigation Architecture

## 3.1 Desktop Navigation Structure

The top-level nav bar is sticky, contains exactly 5 domain items plus the account avatar icon, and never grows beyond this count.

<table><tr><td>[Zodaci Logo]  |  Chart  |  Readings  |  Book  |  Explore  |  Learn  |  [Account Avatar]</td></tr></table>

Each item opens a **Mega-Menu Panel** (not a narrow dropdown list) when hovered or clicked. The mega-menu is a full-width panel that shows grouped sub-items in columns.

## Mega-Menu Design Rules

- Full width of the page — never a narrow dropdown
- <mark>Dark glassmorphism background: bg- [#0D0E1A]/95 backdrop-blur-xl border-b <u>border-white/10</u></mark>
- Organized in 2–4 columns depending on the domain's content volume
- Each sub-item: icon + label + 1-line description
- "Most visited" or "New" badge on 1–2 items to draw attention to key features
- Closes on click-outside or on Escape key — keyboard accessible
- Smooth 200ms fade-in animation (CSS transition only, no JavaScript animation libraries)

## 3.2 Desktop Mega-Menu Content

### Chart Mega-Menu (2 Columns)

<table><tr><td>Left Column — "Your Chart"</td><td>Right Column — "Go Deeper"</td></tr><tr><td>◎ Birth Chart — Your natal positions at a glance</td><td>Chart Elements — Your element and modality breakdown</td></tr></table>

## Page 12

<table><tr><td>Left Column — "Your Chart"</td><td>Right Column — "Go Deeper"</td></tr><tr><td>✦ Star Map — Interactive sky at your moment of birth</td><td>Chart Guide — How to read your chart</td></tr><tr><td>Planets — All 10 planets in your chart, detailed</td><td>Profection Year — Your annual focus point</td></tr><tr><td>Houses — Your 12 houses and their cusps</td><td>Purpose &#x26; Deductions — Your chart's core themes</td></tr><tr><td>Aspects — Planetary relationships and patterns</td><td>Results — Chart pattern analysis</td></tr></table>

# Readings Mega-Menu (3 Columns)

<table><tr><td>Left — "My Readings"</td><td>Middle — "Ask &#x26; Chat"</td><td>Right — "Workbook"</td></tr><tr><td>✦ All My Readings — Your full reading history</td><td>Ask the Sources — Get cited astrological answers</td><td>My Workbook — Journal and integrate readings</td></tr><tr><td>By Topic — Browse readings by astrological theme</td><td>AI Chat — Open conversation with your chart</td><td>RetroGood — Make the most of retrogrades</td></tr><tr><td>Personal Timing — What's active in your chart now</td><td>Companion — Ongoing guidance and reflection</td><td></td></tr></table>

# Book Mega-Menu (3 Columns)

<table><tr><td>Left — "My AstroBook"</td><td>Middle — "Editions"</td><td>Right — "Extras"</td></tr><tr><td>My Masterbook — Your personalized book</td><td>Standard Edition — Core birth chart narrative</td><td>Volume II — The expanded content library</td></tr><tr><td>Chapters — Browse your book's contents</td><td>Expanded Edition — Full book with Volume II</td><td>Sources &#x26; Citations — What powers your readings</td></tr><tr><td>Book Status / Orders — Track your print order</td><td>Shane's Edition — Commentary [if unlocked]</td><td>My Library — All your saved documents</td></tr><tr><td></td><td>April's Edition — Commentary [if unlocked]</td><td>AstroComic — Your illustrated chart story</td></tr></table>

# Explore Mega-Menu (4 Columns)

## Page 13

<table><tr><td>Col 1 — "Timing"</td><td>Col 2 — "Relationships"</td><td>Col 3 — "Other Systems"</td><td>Col 4 — "Community"</td></tr><tr><td>Transits — Current planets hitting your chart</td><td>Compatibility — Compare two charts</td><td>Feng Shui — Spatial energy mapping</td><td>Community — Connect with members</td></tr><tr><td>Retrogrades — Active retrograde periods</td><td>Relationship Detail — Deep synastry</td><td>Bagua Reading — Your life areas</td><td>Shared Space — Collaborative chart work</td></tr><tr><td>Timeline — Your life's astrological arc</td><td>Relationship Reading — AI interpretation</td><td>Numerology — Number patterns</td><td>Counselors — Work with a practitioner</td></tr><tr><td>Solar Return — Your yearly chart</td><td>Relationship Timeline — Timing in relationships</td><td>Chinese Astrology — Eastern system reading</td><td>Workspaces — Group sessions</td></tr><tr><td>Personal Timing — What's most active now</td><td></td><td>More Systems →</td><td>Referrals — Share Zodaci</td></tr></table>

## Learn Mega-Menu (3 Columns)

<table><tr><td>Left — "Academy"</td><td>Middle — "Reference"</td><td>Right — "Media"</td></tr><tr><td>Astrology Academy — Structured learning paths</td><td>The Compendium — Astrological encyclopedia</td><td>Blog — Articles and insights</td></tr><tr><td>Lessons — Browse all lessons</td><td>Sources — Research library</td><td>Podcasts — Audio content</td></tr><tr><td></td><td>Guides — How-to guides</td><td>Public Library — Shared documents</td></tr><tr><td></td><td>Instructions — Platform help</td><td>Themes — Astrological theme deep-dives</td></tr></table>

## 3.3 Mobile Navigation Structure

### Bottom Tab Bar — 5 Tabs, Always Visible

TAGGED_TABLE_PLACEHOLDER_TOP_LEFT_A

<table><tr><td>[◎ Chart]  [✦ Readings]  [▣ Book]  [⊕ Explore]  [◯ Account]</td></tr></table>

## Page 14

<mark>

<table><tr><td>▶ Note on "Learn" in Mobile Navigation<br />"Learn" is accessible from the Account tab or via an Explore sub-section. Five is the absolute maximum for a mobile bottom tab bar. Exceeding this degrades usability on small screens.</td></tr></table>

</mark>

## Mobile Menu Technical Rules

- Tab bar height: <u>h-16</u> (64px), fixed at bottom with <mark><u>z-50</u></mark>
- Active tab: icon and label in <mark>amber - 300</mark>, no background highlight needed
- Inactive tab: icon and label in <mark><u>white/40</u></mark>
- Each tab tap navigates to the domain hub page OR opens a bottom sheet for that domain
- "Learn" accessible from Account tab → "Browse Learning" option

## Mobile Domain Hub Pages

<

<table><tr><td>Tab</td><td>Route</td><td>Hub Page</td><td>Action Required</td></tr><tr><td>Chart</td><td>/birth-chart</td><td>BirthChart page</td><td>Already exists — enhance with quick-access row</td></tr><tr><td>Readings</td><td>/my-readings</td><td>MyReadings page</td><td>Already exists — enhance with topic category pills</td></tr><tr><td>Book</td><td>/my-masterbook</td><td>MyMasterbook page</td><td>Already exists — enhance with progress indicator</td></tr><tr><td>Explore</td><td>/explore</td><td>ExploreDiscover page</td><td>Exists — major enhancement required (see Section 4)</td></tr><tr><td>Account</td><td>/dashboard</td><td>Dashboard page</td><td>Already exists — review and surface key actions</td></tr></table>

>

## Mobile Secondary Navigation

## Page 15

Within each domain, use **horizontal scrollable tabs** at the top of the page to navigate sub-sections.

Example for the Chart domain:

<table><tr><td>[Chart]  [Planets]  [Houses]  [Aspects]  [Star Map]  [Guide]  →</td></tr></table>

These replace deep menu nesting on mobile. The scroll indicator (→) cues the user that more items exist beyond the visible area.

## 3.4 Contextual Navigation — The "What's Next?" System

The most powerful navigation is contextual — appearing at the point of natural curiosity. Every primary page must have a "What's next?" section at the bottom or in a sidebar.

## Per-Page Next Step Definitions

<table><tr><td>Page</td><td>Next Step Prompts</td></tr><tr><td>Birth Chart</td><td>"Explore your Moon in [sign] →" · "See your current transits →" · "Start your first reading →"</td></tr><tr><td>My Readings</td><td>"Go deeper with your Companion →" · "Ask a specific question →" · "Add this to your Workbook →"</td></tr><tr><td>My Masterbook</td><td>"Preview your book →" · "See what the Expanded edition adds →" · "Explore the Sources behind your readings →"</td></tr><tr><td>Transits</td><td>"See what's coming in your Timeline →" · "Read about [most significant current transit] →" · "Check your Profection year →"</td></tr></table>

## NextStepPanel Component

```
interface NextStep {  label: string;          // "Explore your Moon in
Scorpio"  description: string;  // "See what this placement means for you"
href: string;          // "/readings?topic=moon-scorpio"  icon?: string;
// "♦"  badge?: string;          // "New" | "Popular" | "Personalized" }
function NextStepPanel({ steps }: { steps: NextStep[] }) {  return (

    

Continue exploring    
    

{steps.map((step) => (    <Link

## Page 16

key={step.href} to={step.href} className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"> 
 <span className="text-xl">{step.icon || '♦'}</span> {step.badge && (<span className="text-[10px] font-medium tracking-widest uppercase text-amber-300 bg-amber-300/10 px-2 py-0.5 rounded-full">{step.badge}</span>)} 
 
{step.label}
 
{step.description}
 
 
 ); }

# Section 4 — The Explore Hub Page

The <mark><u>ExploreDiscover</u></mark> page currently exists but must be enhanced into a true discovery hub — the gateway to Timing, Relationships, Systems, and Community. This is the **most important new page** in the reorganization.

## Explore Hub Layout Specification

<table><tr><td>Row</td><td>Content</td><td>Card Treatment</td></tr><tr><td>Hero</td><td>"There's more to your chart than the birth moment." Sub: "Timing, relationships, and other wisdom systems — all in one place."</td><td>Full-width header, no card</td></tr><tr><td>Row 1 — Timing</td><td>Left: Current Transits → "See what's active in your chart today" · Right: Retrograde Guide → "Navigate Mercury, Mars, and Saturn retrograde"</td><td>2-column card, prominent size</td></tr><tr><td>Row 2 — Relationships</td><td>Compatibility → "Compare your chart with someone else's" · Relationship Reading → "AI-interpreted synastry" · Timeline → "How astrological timing affects your connections"</td><td>3 small equal cards</td></tr></table>

## Page 17

<table><tr><td>Row</td><td>Content</td><td>Card Treatment</td></tr><tr><td>Row 3 — Other Systems</td><td>Feng Shui | Numerology | Chinese Astrology | Bagua | More...</td><td>Horizontal scroll on mobile, 5 cards on desktop</td></tr><tr><td>Row 4 — Community</td><td>Left: Connect with Members · Right: Work with a Counselor</td><td>2-column card</td></tr></table>

# Section 5 — Progressive Disclosure Rules

## 5.1 What to Show and When

<table><tr><td>Level</td><td>User State</td><td>Show</td><td>Hide</td></tr><tr><td>Level 0</td><td>Landing (not logged in)</td><td>Logo, "Begin With Your Chart" CTA, About, Pricing, Blog, Demo</td><td>Everything else</td></tr><tr><td>Level 1</td><td>New user (logged in, no chart yet)</td><td>Onboarding prompt (prominent), About, Demo. Banner: "Add your birth info to get started →"</td><td>Chart features (none yet), Book features, Readings (nothing to read yet)</td></tr><tr><td>Level 2</td><td>Chart exists (authenticated, birth data saved)</td><td>Chart domain (full), Readings domain (MyReadings, Topics, Ask), Explore (Timing, Systems), Learn, Account. Book shows Masterbook teaser + Pricing</td><td>Admin, Creator, Dispatch from main nav</td></tr><tr><td>Level 3</td><td>Paid user (has an order)</td><td>Everything in Level 2 + full Masterbook, Book status, Editions (their purchased edition). Workbook deep features, Companion full access</td><td>Admin items still hidden from main nav</td></tr></table>

## Page 18

<table><tr><td>Level</td><td>User State</td><td>Show</td><td>Hide</td></tr><tr><td>Level 4</td><td>Creator / Admin</td><td>Everything in Level 3 + Creator Dashboard, Admin Panel, Dispatch, Data Quality, Shane/April edition tools — all in Account menu ONLY</td><td>Admin tools must NEVER appear in main navigation for any role</td></tr></table>

# 5.2 Feature Gating Indicators (Not Locks — Indicators)

<table><tr><td>▶ Critical Rule — Never Hide, Always Indicate<br />When a feature exists but requires a higher access level, NEVER hide it entirely. Show it with a subtle indicator. Users should always be able to see what is possible. The difference between hiding features (bad) and indicating they unlock (good) is the foundation of a trustworthy product experience.</td></tr></table>

When a feature requires higher access: show a soft lock indicator (small, not prominent) next to the nav item or card. On hover, show a tooltip: "Available with Print Edition." On click, navigate to the feature page which shows a preview/teaser and conversion prompt.

## NavItem with Lock Indicator Pattern

```javascript
function NavItem({ href, label, locked, lockReason }: NavItemProps) {
  if (locked) {
    return (
      

        <Link to={href} className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
          {label}
          <span className="text-[10px] text-amber-300/60 bg-amber-300/10 px-1.5 py-0.5 rounded-full">
            Unlock
          </span>
        </Link>
        

          {lockReason}
        

      

    );
  }
  return <Link to={href}>{label}</Link>;
}
```

## Section 6 — Domain Hub Pages

## Page 19

# 6.1 Hub Page Standard Structure

Every domain hub follows this layout pattern. Audit each existing hub and enhance or create where missing.

<table><tr><td>Section</td><td>Content</td><td>Notes</td></tr><tr><td>Header</td><td>[Domain Name] — 1-sentence description</td><td>Full-width, domain icon prominent</td></tr><tr><td>Quick Access Row</td><td>4 icon buttons — most common actions for this domain</td><td>Horizontal row, always visible above the fold</td></tr><tr><td>Section A — Primary</td><td>2–3 cards, large format</td><td>Most important features, full descriptions</td></tr><tr><td>Section B — Secondary</td><td>3–4 cards, medium format</td><td>Important but not critical features</td></tr><tr><td>Section C — Advanced</td><td>Horizontal scroll or "More" expand</td><td>Power user features, collapsed by default</td></tr><tr><td>Contextual Banner</td><td>Personalized prompt based on user's chart data</td><td>e.g., "Your Moon is receiving a trine from Jupiter — read about it →"</td></tr></table>

## 6.2 Hub Pages to Audit and Enhance

<table><tr><td>Hub</td><td>Route</td><td>Current State</td><td>Enhancement Required</td></tr><tr><td>Chart Hub</td><td>/birth-chart</td><td>Already exists</td><td>Add Quick Access row (Planets, Houses, Aspects, Star Map as 4 icon buttons at top) and NextStepPanel at bottom</td></tr><tr><td>Readings Hub</td><td>/my-readings</td><td>Already exists</td><td>Add Topic category pills (Personal, Relationships, Timing, Career, Spiritual) and "Most relevant right now" section based on current transits</td></tr></table>

## Page 20

<table><tr><td>Hub</td><td>Route</td><td>Current State</td><td>Enhancement Required</td></tr><tr><td>Book Hub</td><td>/my-masterbook</td><td>Already exists</td><td>Add visual book progress indicator, edition status card, and chapter browser</td></tr><tr><td>Explore Hub</td><td>/explore</td><td>Exists but minimal</td><td>Major enhancement required — full layout per Section 4 specification</td></tr><tr><td>Account Hub</td><td>/dashboard</td><td>Already exists</td><td>Ensure it surfaces: order status (if ordered), next reading suggestion, chart completeness indicator, quick links to Settings, Orders, Referrals</td></tr></table>

## **Section 7 — Navigation Component Implementation Plan**

### 7.1 Files to Create or Modify

<table><tr><td>File</td><td>Action</td><td>Description</td></tr><tr><td>src/components/layout/MainNav.tsx</td><td>MODIFY</td><td>Replace flat nav links with 5-domain structure. Desktop: mega-menu panel system. Mobile: bottom tab bar. Auth-aware rendering per Section 5.1.</td></tr><tr><td>src/components/layout/MegaMenu.tsx</td><td>CREATE NEW</td><td>Full-width glassmorphism panel component. Props: domain, isOpen, onClose. Includes keyboard navigation (Arrow keys, Escape). Closes on outside click and route change.</td></tr></table>

## Page 21

<table><tr><td>File</td><td>Action</td><td>Description</td></tr><tr><td>src/components/layout/MobileTabBar.tsx</td><td>CREATE NEW</td><td>Bottom tab bar for mobile. Fixed position. 5 tabs. Uses useLocation() to determine active tab. Hides on admin pages (/admin, /dispatch, /data-quality).</td></tr><tr><td>src/components/layout/DomainSidebar.tsx</td><td>CREATE NEW</td><td>Optional persistent left sidebar for desktop on domain-specific pages. Shows domain's sub-navigation items. Only visible on md: and above. Collapsible. Width: 220px.</td></tr><tr><td>src/components/shared/NextStepPanel.tsx</td><td>CREATE NEW</td><td>The "What's next?" contextual panel. Full component code in Section 3.4.</td></tr><tr><td>src/pages/ExploreDiscover.tsx</td><td>ENHANCE</td><td>Full Explore hub page per Section 4 specification.</td></tr></table>

# 7.2 Navigation State Management

Use a lightweight nav context (React Context — not a heavy state library). This context is the single source of truth for all navigation state.

```typescript
interface NavContextValue {
  openMegaMenu: string | null; // which domain mega-menu is open
  setOpenMegaMenu: (domain: string | null) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  userContext: 'public' | 'new' | 'free' | 'paid' | 'creator' | 'admin';
}
const NavContext = createContext<NavContextValue>({});
```

The `<u>userContext</u>` value is computed from four sources, in order:

1. Is user authenticated? (`<u>supabase.auth.getUser()</u>`)
2. Has user completed onboarding? (`birth_data` exists in DB)
3. Has user made a purchase? (orders table has a <mark><u>status='paid'</u></mark> row)
4. Does user have creator or admin role? (`user_roles` table)

# 7.3 Route Change Behavior

Every route change must trigger these five actions automatically:

5. Close any open mega-menu

## Page 22

6. Close mobile menu if open
7. Scroll to top (already in the scroll behavior skill)
8. Update the active tab in the bottom tab bar
9. Update the active item in any domain sidebar

```typescript
// In MainNav.tsx - useEffect on pathname change const { pathname } =
useLocation(); useEffect(() => { setOpenMegaMenu(null);
setMobileMenuOpen(false); }, [pathname]);
```



# Section 8 — The Lovable Skill Instructions

This section is written directly as agent instructions — the format Lovable uses when executing navigation tasks. These are prescriptive steps, not guidelines.

<table><tr><td>▶ Skill: zodaci-navigation-audit<br />When Triggered: User asks Lovable to "improve navigation," "fix the menu," "reorganize the layout," "reduce overwhelm," or "clean up the information architecture."</td></tr></table>

## Step-by-Step Agent Instructions

**STEP 1** — Read this document fully before touching any code.

**STEP 2** — Audit current state. Run these searches in the codebase:
- Find all components in <mark><u>src/components/layout/</u></mark>
- Find the main navigation component (look for `<u><nav></u>` elements with sticky or fixed positioning)
- Find all navigation links (look for `<Link to="..." >` or <mark><u><NavLink></u></mark> components in layout files)
- Count the number of top-level nav items currently visible
- Identify the mobile menu implementation

Document findings in a comment block at the top of `<u>MainNav.tsx</u>` before making changes.

## Page 23

<table><tr><td>▶ STEP 3 — Do Not Remove Any Links. Only Reorganize.<br />Every existing &#x3C;Link to="..."> must remain in the new navigation. If a link is removed from the top-level nav, it must appear in the mega-menu, a domain hub, a contextual nav panel, or the Account menu. No feature disappears.</td></tr></table>

**STEP 4** — Apply the domain map. Assign every current nav link to one of the 6 domains from Section 2.2. If a link doesn't fit any domain, assign it to the nearest fit and add a code comment explaining the decision.

**STEP 5** — Implement top-level nav first. Build the 5-item top-level nav before building mega-menus. Verify it works and navigates correctly before adding mega-menu behavior.

**STEP 6** — Implement mega-menus one at a time, starting with the most feature-rich domain (Explore). Test each mega-menu before moving to the next.

**STEP 7** — Implement mobile bottom tab bar. Build the 5-tab bottom bar. Test on a 375px viewport. Verify it doesn't overlap page content by adding <mark>pb - 16</mark> to all page layouts.

**STEP 8** — Add NextStepPanel to the 5 most-visited pages: BirthChart, MyReadings, MyMasterbook, Transits, Pricing.

**STEP 9** — Verify nothing is lost. Run a final check: every route in <mark>App . t s x</mark> must be reachable via the new navigation system. Use the route inventory from the audit report as the checklist.

<table><tr><td>▶ Skill: zodaci-navigation-verify<br />When to Run: After any navigation change, before marking the task complete.</td></tr></table>

## Verification Checklist

Top-level nav has exactly 5 items + account icon (not more, not fewer)

All 90+ pages are reachable via the new navigation (check against <u>App.tsx</u> route list)

Mega-menu closes on outside click and Escape key

## Page 24

Mega-menu closes on route change

Mobile bottom tab bar shows on mobile (below md: breakpoint)

Mobile bottom tab bar hides on admin pages

Bottom tab bar does not cover page content (pb-16 or equivalent on page layouts)

Active nav item is visually indicated (active tab highlighted, active mega-menu item styled)

Auth-aware rendering: public users only see public nav, free users see free nav

Admin links only appear in Account menu for admin users

No duplicate links (same destination appearing in two places at the same nav level)

All locked features show unlock indicators, not invisible/hidden states

# Section 9 — Content Density Management

## 9.1 The Information Overload Problem — Diagnosed

The feeling of "too much content" on Zodaci comes from three specific patterns. Solve these and the experience transforms fundamentally.

<table><tr><td>Pattern</td><td>Problem</td><td>Fix</td></tr><tr><td>Flat Listing</td><td>Every item at the same visual weight. A page with 20 reading topics shown as a flat grid creates visual noise — users don't know where to start.</td><td>Introduce visual hierarchy. Feature 1–2 recommended items prominently, show the rest in a condensed list or "More" expand.</td></tr><tr><td>All-at-Once Loading</td><td>Every feature, every section, every tab is visible on page load. Users face the entire feature set before they need it.</td><td>Use tabs, accordions, and "show more" patterns to collapse secondary content. Only the primary action is immediately visible.</td></tr><tr><td>Missing Starting Points</td><td>Users don't know which of 20 reading topics is right for them, or which system to explore first.</td><td>Add a "recommended for you" or "start here" section on every hub. Use the user's chart data to surface 1–3 personally relevant recommendations.</td></tr></table>

## Page 25

# 9.2 Page-Level Density Controls

For every page with more than 8 items in a list or grid, apply one of these five density controls:

<table><tr><td>Control</td><td>Description</td><td>Best Applied To</td></tr><tr><td>A — Tabbed Organization</td><td>Group items into 3–5 categories as horizontal tabs. Only the active tab's content is visible.</td><td>Topics page → tabs: [Personal] [Timing] [Relationships] [Systems] [Spiritual]</td></tr><tr><td>B — Accordion Sections</td><td>Group items into collapsible sections. First section is open by default.</td><td>Masterbook chapters → sections: [Introduction] [Natal Chart] [Planets] [Houses] [Timing]</td></tr><tr><td>C — Progressive List</td><td>Show the first 6 items. Add a "Show more (14)" button that expands the list.</td><td>Sources library → show 6 sources, expand to all</td></tr><tr><td>D — Card + List Toggle</td><td>Show items as visual cards (large, with descriptions) or compact list (small, just titles). Default to cards for discovery.</td><td>Any content library with returning and new users</td></tr><tr><td>E — Search + Filter</td><td>Add a search input and filter chips at the top of any list with more than 12 items.</td><td>Topic readings page → search bar + filter by category</td></tr></table>

## 9.3 The "Recommended For You" System

Every hub page and content list should have a personalized recommendation section. This is the most powerful density management tool — instead of showing everything equally, surface what matters to this specific user.

### Data Points Available for Personalization

- Sun sign (from birth chart)
- Moon sign (most emotionally resonant — highest recommendation weight)
- Ascendant (most personally significant)
- Current transits (what's active right now)
- Most recent reading topic (continue the thread)

## Page 26

- Edition purchased (Standard vs. Expanded — show relevant content)
- Time since last login (returning user gets different prompt than daily active user)

# PersonalizedRecommendation Component

```javascript
function PersonalizedRecommendation({ chartData, recentActivity }: Props) {
  const topTransit = getTopTransit(chartData); // from astro.ts
  const recommendation = buildRecommendation(chartData, recentActivity);
  return (
    

      

        Recommended for you right now
      

      
### {recommendation.title}

      

        {recommendation.reason}
      

      <Link
        to={recommendation.href}
        className="text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors">
        {recommendation.cta}
      </Link>
    

  );
}
```

---

# Section 10 — Breadcrumb & Wayfinding System

## 10.1 When to Show Breadcrumbs

Users get lost in Zodaci because pages are deep — a specific Masterbook chapter has no visible path back to the chapter list. Add breadcrumbs on all pages that are 2+ levels deep within a domain.

<table><tr><td>Show Breadcrumbs On</td><td>Do Not Show On</td></tr><tr><td>Chapter pages, Planet detail, House detail, Source reader, Counselor profile and session, Academy lesson, Individual reading page</td><td>Hub pages (they are already the top of their domain), Landing and marketing pages</td></tr></table>

**Breadcrumb rules:** Maximum depth of 3 levels (Domain > Section > Item). Use chevron separators (›), not slashes. Always include an accessible <u>aria-label="Breadcrumb"</u> on the nav element.

## Breadcrumb Component

```javascript
function Breadcrumb({ crumbs }: { crumbs: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb"
      className="flex items-center gap-2 text-xs text-white/40 mb-6">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.label}>
          {i > 0 && <span aria-hidden></span>}
          {crumb.href ? (
            <Link to={crumb.href}
              className="hover:text-white/70 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

## Page 27

```javascript
) : ( <span className="text-white/70">{crumb.label}</span>
)} <React.Fragment> ))} </nav> ); } // Usage on Planet
Detail: <Breadcrumbs crumbs={[ { label: 'Chart', href: '/birth-chart' }, {
label: 'Planets', href: '/planets' }, { label: `${planet.name} in
${planet.sign}` } ]} />
</code>

## 10.2 Back Navigation Behavior

Every page that is not a hub must have a clear back navigation option — either a breadcrumb (preferred) or an explicit "← Back to [Domain]" link.

- **Placement:** Top-left of the page content area, below the header
- **Style:** text-sm text-white/50 hover:text-white/70 flex items-center gap-1
- **Behavior:** Always links to a specific route — never uses `history.back()` (which breaks on direct URL access)

---

## Section 11 — Implementation Priority Order

Execute in this exact sequence to avoid breaking the live site. Each phase is independently deployable and testable before moving to the next.

<table><tr><td>Phase 1 — Architecture (No Visible User-Facing Change Yet)<br />1.  Create NavContext with userContext computation<br />2.  Create NextStepPanel component (no pages use it yet)<br />3.  Create MegaMenu component shell (not connected to nav yet)<br />4.  Create MobileTabBar component (not visible yet)<br />5.  Audit and document all existing nav links in a comment in MainNav.tsx</td></tr></table>

## Page 28

<table><tr><td>Phase 2 — Desktop Navigation<br />1.  Replace top-level nav links with 5-domain structure in MainNav.tsx<br />2.  Connect MegaMenu to each domain tab<br />3.  Populate each mega-menu with grouped sub-links<br />4.  Test: all links work, all pages reachable<br />5.  Test: keyboard navigation (Tab, Arrow keys, Escape)</td></tr></table>

<table><tr><td>Phase 3 — Mobile Navigation<br />1.  Add MobileTabBar to the app layout (hidden on desktop via md:hidden)<br />2.  Add pb-16 to all page layouts to prevent tab bar content overlap<br />3.  Add horizontal scroll sub-nav tabs to the 5 domain hub pages<br />4.  Test on 375px, 390px (iPhone 14), 430px (iPhone 14 Pro Max) viewports</td></tr></table>

<table><tr><td>Phase 4 — Contextual Navigation<br />1.  Add NextStepPanel to BirthChart, MyReadings, MyMasterbook, Transits, Pricing<br />2.  Add Breadcrumb to PlanetDetail, HouseDetail, MasterbookChapter, AcademyLesson, SourceReader, CounselorProfile, CounselorSession<br />3.  Add "Recommended For You" panel to all 5 domain hub pages<br />4.  Add back navigation to all non-hub pages</td></tr></table>

## Page 29

<table><tr><td>Phase 5 — Content Density<br />1.  Add tabs to TopicsIndex (Personal / Timing / Relationships / Systems / Spiritual)<br />2.  Add search + filter to Sources page<br />3.  Add accordion to Masterbook chapter list<br />4.  Add "Show more" to any list with more than 8 items<br />5.  Review all pages for flat listing patterns and apply appropriate density control</td></tr></table>

<table><tr><td>Phase 6 — Verify &#x26; Polish<br />1.  Run the full verification checklist (Section 8, zodaci-navigation-verify)<br />2.  Test all 90+ routes are reachable via the new navigation<br />3.  Review on mobile, tablet, and desktop viewports<br />4.  Check auth-aware rendering for all 4 user context levels<br />5.  Final breadcrumb and back-navigation audit</td></tr></table>

## **Appendix A — Current Page → New Location Mapping**

Complete mapping of every Zodaci page to its new navigation location, menu path, and discovery level.
Use this as the authoritative checklist when verifying that no page has been lost during the reorganization.

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr></table>

## Page 30

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr><tr><td colspan="5">◎ CHART DOMAIN</td></tr><tr><td>BirthChart</td><td>Main nav</td><td>CHART</td><td>Chart > Birth Chart</td><td>PRIMARY</td></tr><tr><td>Planets</td><td>Main nav</td><td>CHART</td><td>Chart > Planets</td><td>SECONDARY</td></tr><tr><td>PlanetDetail</td><td>Not in nav</td><td>CHART</td><td>Chart > Planets > [Planet] (breadcrumb)</td><td>TERTIARY</td></tr><tr><td>Houses</td><td>Main nav</td><td>CHART</td><td>Chart > Houses</td><td>SECONDARY</td></tr><tr><td>HouseDetail</td><td>Not in nav</td><td>CHART</td><td>Chart > Houses > [House] (breadcrumb)</td><td>TERTIARY</td></tr><tr><td>Aspects</td><td>Main nav</td><td>CHART</td><td>Chart > Aspects</td><td>SECONDARY</td></tr><tr><td>StarMap</td><td>Main nav</td><td>CHART</td><td>Chart > Star Map</td><td>SECONDARY</td></tr><tr><td>ChartGuide</td><td>Buried</td><td>CHART</td><td>Chart > Chart Guide</td><td>SECONDARY</td></tr><tr><td>ChartCalculator</td><td>Not in nav</td><td>CHART</td><td>Chart > Go Deeper > Calculator</td><td>TERTIARY</td></tr><tr><td>ChartElements</td><td>Not in nav</td><td>CHART</td><td>Chart > Go Deeper > Elements</td><td>TERTIARY</td></tr><tr><td>Profection</td><td>Not in nav</td><td>CHART</td><td>Chart > Profection Year</td><td>TERTIARY</td></tr><tr><td>Purpose</td><td>Not in nav</td><td>CHART</td><td>Chart > Purpose &#x26; Deductions</td><td>TERTIARY</td></tr><tr><td>Deductions</td><td>Not in nav</td><td>CHART</td><td>Chart > Purpose &#x26; Deductions (sub)</td><td>TERTIARY</td></tr><tr><td>Results</td><td>Not in nav</td><td>CHART</td><td>Chart > Results</td><td>TERTIARY</td></tr><tr><td>OurCharts</td><td>Not in nav</td><td>CHART</td><td>Chart > Our Charts</td><td>TERTIARY</td></tr><tr><td>MemberChartSection</td><td>Not in nav</td><td>CHART</td><td>Member area (embedded)</td><td>UTILITY</td></tr></table>

## Page 31

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr><tr><td>MemberStarMap</td><td>Not in nav</td><td>CHART</td><td>Member area (embedded)</td><td>UTILITY</td></tr><tr><td colspan="5">✦ READINGS DOMAIN</td></tr><tr><td>MyReadings</td><td>Main nav</td><td>READINGS</td><td>Readings > All My Readings</td><td>PRIMARY</td></tr><tr><td>Topic</td><td>Via readings</td><td>READINGS</td><td>Readings > By Topic > [Topic]</td><td>SECONDARY</td></tr><tr><td>TopicsIndex</td><td>Not in nav</td><td>READINGS</td><td>Readings > Browse All Topics</td><td>SECONDARY</td></tr><tr><td>MyTopicReading</td><td>Not in nav</td><td>READINGS</td><td>Readings > [Reading]</td><td>SECONDARY</td></tr><tr><td>Ask</td><td>Main nav</td><td>READINGS</td><td>Readings > Ask the Sources</td><td>SECONDARY</td></tr><tr><td>Chat</td><td>Main nav</td><td>READINGS</td><td>Readings > AI Chat</td><td>SECONDARY</td></tr><tr><td>Companion</td><td>Not in nav</td><td>READINGS</td><td>Readings > Companion</td><td>SECONDARY</td></tr><tr><td>Workbook</td><td>Not in nav</td><td>READINGS</td><td>Readings > My Workbook</td><td>SECONDARY</td></tr><tr><td>RetroGood</td><td>Not in nav</td><td>READINGS</td><td>Readings > RetroGood</td><td>SECONDARY</td></tr><tr><td>PersonalTiming</td><td>Not in nav</td><td>READINGS</td><td>Readings > Personal Timing</td><td>SECONDARY</td></tr><tr><td colspan="5">▣ BOOK DOMAIN</td></tr><tr><td>MyMasterbook</td><td>Main nav</td><td>BOOK</td><td>Book > My Masterbook</td><td>PRIMARY</td></tr><tr><td>Masterbook</td><td>Via book</td><td>BOOK</td><td>Book > Masterbook</td><td>PRIMARY</td></tr><tr><td>MasterbookChapter</td><td>Via masterbook</td><td>BOOK</td><td>Book > Chapters > [Chapter]</td><td>SECONDARY</td></tr><tr><td>MasterbookContents</td><td>Via masterbook</td><td>BOOK</td><td>Book > Chapters (hub)</td><td>SECONDARY</td></tr></table>

## Page 32

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr><tr><td>MasterbookContentsEntry</td><td>Not in nav</td><td>BOOK</td><td>Book > Chapters > [Entry]</td><td>SECONDARY</td></tr><tr><td>MasterbookSources</td><td>Via masterbook</td><td>BOOK</td><td>Book > Sources &#x26; Citations</td><td>TERTIARY</td></tr><tr><td>Volume2</td><td>Not in nav</td><td>BOOK</td><td>Book > Volume II</td><td>SECONDARY</td></tr><tr><td>ShaneEdition</td><td>Not in nav</td><td>BOOK</td><td>Book > Editions > Shane</td><td>SECONDARY</td></tr><tr><td>AprilEdition</td><td>Not in nav</td><td>BOOK</td><td>Book > Editions > April</td><td>SECONDARY</td></tr><tr><td>FounderTopics</td><td>Not in nav</td><td>BOOK</td><td>Book > Editions > Founder</td><td>TERTIARY</td></tr><tr><td>Books</td><td>Main nav</td><td>BOOK</td><td>Book > Order / Status</td><td>PRIMARY</td></tr><tr><td>BookPreview</td><td>Via books</td><td>BOOK</td><td>Book > Preview</td><td>SECONDARY</td></tr><tr><td>MyLibrary</td><td>Not in nav</td><td>BOOK</td><td>Book > My Library</td><td>SECONDARY</td></tr><tr><td>MyUploads</td><td>Via dashboard</td><td>BOOK</td><td>Book > My Uploads</td><td>TERTIARY</td></tr><tr><td>AstroComic</td><td>Not in nav</td><td>BOOK</td><td>Book > AstroComic</td><td>SECONDARY</td></tr><tr><td>MyComic</td><td>Not in nav</td><td>BOOK</td><td>Book > My Comic</td><td>SECONDARY</td></tr><tr><td colspan="5">⊕ EXPLORE DOMAIN</td></tr><tr><td>Timeline</td><td>Main nav</td><td>EXPLORE</td><td>Explore > Timing > Timeline</td><td>SECONDARY</td></tr><tr><td>Transits</td><td>Main nav</td><td>EXPLORE</td><td>Explore > Timing > Transits</td><td>PRIMARY</td></tr><tr><td>Retrogrades</td><td>Main nav</td><td>EXPLORE</td><td>Explore > Timing > Retrogrades</td><td>SECONDARY</td></tr></table>

## Page 33

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr><tr><td>Compatibility</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Relationships > Compatibility</td><td>SECONDARY</td></tr><tr><td>RelationshipDetail</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Relationships > Detail</td><td>SECONDARY</td></tr><tr><td>RelationshipReading</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Relationships > Reading</td><td>SECONDARY</td></tr><tr><td>RelationshipTimeline</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Relationships > Timeline</td><td>TERTIARY</td></tr><tr><td>FengShui</td><td>Main nav</td><td>EXPLORE</td><td>Explore > Systems > Feng Shui</td><td>SECONDARY</td></tr><tr><td>Bagua</td><td>Via feng shui</td><td>EXPLORE</td><td>Explore > Systems > Bagua</td><td>TERTIARY</td></tr><tr><td>BaguaReading</td><td>Via bagua</td><td>EXPLORE</td><td>Explore > Systems > Bagua Reading</td><td>TERTIARY</td></tr><tr><td>BaguaWheelPage</td><td>Via bagua</td><td>EXPLORE</td><td>Explore > Systems > Bagua Wheel</td><td>TERTIARY</td></tr><tr><td>FlyingStars</td><td>Via feng shui</td><td>EXPLORE</td><td>Explore > Systems > Flying Stars</td><td>TERTIARY</td></tr><tr><td>Numerology</td><td>Main nav</td><td>EXPLORE</td><td>Explore > Systems > Numerology</td><td>SECONDARY</td></tr><tr><td>Chinese</td><td>Main nav</td><td>EXPLORE</td><td>Explore > Systems > Chinese</td><td>SECONDARY</td></tr><tr><td>OtherSystems</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Systems > More</td><td>TERTIARY</td></tr><tr><td>Relationships</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Relationships (hub)</td><td>SECONDARY</td></tr></table>

## Page 34

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr><tr><td>Community</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Community</td><td>SECONDARY</td></tr><tr><td>SharedSpace</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Community > Shared Space</td><td>TERTIARY</td></tr><tr><td>SocialIntegration</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Community > Social</td><td>TERTIARY</td></tr><tr><td>Workspaces</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Community > Workspaces</td><td>TERTIARY</td></tr><tr><td>Counselors</td><td>Not in nav</td><td>EXPLORE</td><td>Explore > Community > Counselors</td><td>SECONDARY</td></tr><tr><td>CounselorProfile</td><td>Via counselors</td><td>EXPLORE</td><td>Explore > Counselors > [Name]</td><td>TERTIARY</td></tr><tr><td>CounselorSession</td><td>Via counselors</td><td>EXPLORE</td><td>Explore > Counselors > Session</td><td>TERTIARY</td></tr><tr><td>Referrals</td><td>Via account</td><td>EXPLORE</td><td>Explore > Community > Referrals</td><td>TERTIARY</td></tr><tr><td colspan="5">◇ LEARN DOMAIN</td></tr><tr><td>AcademyHome</td><td>Not in nav</td><td>LEARN</td><td>Learn > Academy</td><td>PRIMARY</td></tr><tr><td>AcademyLesson</td><td>Via academy</td><td>LEARN</td><td>Learn > Academy > [Lesson]</td><td>SECONDARY</td></tr><tr><td>Blog</td><td>Main nav</td><td>LEARN</td><td>Learn > Blog</td><td>PRIMARY</td></tr><tr><td>PublicArticle</td><td>Via blog</td><td>LEARN</td><td>Learn > Blog > [Article]</td><td>SECONDARY</td></tr><tr><td>Sources</td><td>Main nav</td><td>LEARN</td><td>Learn > Sources</td><td>SECONDARY</td></tr><tr><td>SourceReader</td><td>Via sources</td><td>LEARN</td><td>Learn > Sources > [Source]</td><td>TERTIARY</td></tr></table>

## Page 35

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr><tr><td>Compendium</td><td>Not in nav</td><td>LEARN</td><td>Learn > Compendium</td><td>SECONDARY</td></tr><tr><td>Guides</td><td>Not in nav</td><td>LEARN</td><td>Learn > Guides</td><td>SECONDARY</td></tr><tr><td>Instructions</td><td>Not in nav</td><td>LEARN</td><td>Learn > Instructions</td><td>TERTIARY</td></tr><tr><td>Podcasts</td><td>Not in nav</td><td>LEARN</td><td>Learn > Podcasts</td><td>SECONDARY</td></tr><tr><td>PublicLibrary</td><td>Not in nav</td><td>LEARN</td><td>Learn > Public Library</td><td>TERTIARY</td></tr><tr><td>PublicThemes</td><td>Not in nav</td><td>LEARN</td><td>Learn > Themes</td><td>TERTIARY</td></tr><tr><td colspan="5">◯ ACCOUNT DOMAIN</td></tr><tr><td>Dashboard</td><td>Main nav</td><td>ACCOUNT</td><td>Account icon > Dashboard</td><td>PRIMARY</td></tr><tr><td>Onboarding</td><td>Auto-redirect</td><td>ACCOUNT</td><td>Automatic for new users</td><td>UTILITY</td></tr><tr><td>Pricing</td><td>Main nav</td><td>ACCOUNT</td><td>Account > Pricing / Upgrade</td><td>PRIMARY</td></tr><tr><td>Orders</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > My Orders</td><td>PRIMARY</td></tr><tr><td>CheckoutReturn</td><td>Post-checkout</td><td>ACCOUNT</td><td>Auto-redirect after checkout</td><td>UTILITY</td></tr><tr><td>MemberSystem</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > Membership</td><td>UTILITY</td></tr><tr><td>ExploreDiscover</td><td>Not in nav</td><td>ACCOUNT</td><td>→ Enhanced to Explore hub</td><td>PRIMARY</td></tr><tr><td>FaqPage</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > Help &#x26; FAQ</td><td>UTILITY</td></tr><tr><td>PrivacyPage</td><td>Footer</td><td>ACCOUNT</td><td>Footer + Account menu</td><td>UTILITY</td></tr><tr><td>TermsPage</td><td>Footer</td><td>ACCOUNT</td><td>Footer + Account menu</td><td>UTILITY</td></tr><tr><td>Demo</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > Demo / Tour</td><td>UTILITY</td></tr></table>

## Page 36

<table><tr><td>Page</td><td>Old Location</td><td>New Domain</td><td>New Menu Path</td><td>Level</td></tr><tr><td>CreatorDashboard</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > Creator (creator role only)</td><td>UTILITY</td></tr><tr><td>Admin</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > Admin (admin role only)</td><td>UTILITY</td></tr><tr><td>Dispatch</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > Dispatch (admin role only)</td><td>UTILITY</td></tr><tr><td>DataQuality</td><td>Not in nav</td><td>ACCOUNT</td><td>Account > Data Quality (admin role only)</td><td>UTILITY</td></tr><tr><td colspan="5">PUBLIC ONLY — Not in authenticated navigation</td></tr><tr><td>LandingPage</td><td>Public root</td><td>PUBLIC</td><td>Public nav only — not in authenticated app nav</td><td>UTILITY</td></tr><tr><td>Home</td><td>Public</td><td>PUBLIC</td><td>Public nav only</td><td>UTILITY</td></tr><tr><td>About</td><td>Public nav</td><td>PUBLIC</td><td>Public nav only</td><td>UTILITY</td></tr><tr><td>BrandLanding</td><td>Public</td><td>PUBLIC</td><td>Public nav only</td><td>UTILITY</td></tr><tr><td>BrandLaunch</td><td>Public</td><td>PUBLIC</td><td>Public nav only</td><td>UTILITY</td></tr><tr><td>PublicInfo</td><td>Public</td><td>PUBLIC</td><td>Public nav only</td><td>UTILITY</td></tr><tr><td>Verify</td><td>Email link</td><td>PUBLIC</td><td>Direct URL only — no nav needed</td><td>UTILITY</td></tr><tr><td>ResetPassword</td><td>Email link</td><td>PUBLIC</td><td>Direct URL only — no nav needed</td><td>UTILITY</td></tr></table>

# **Appendix B — Quick Reference Decision Tree for Lovable**

## Page 37

When asked to work on navigation or information architecture, apply this decision tree before writing a single line of code.

<table><tr><td>Is the user asking to REMOVE a page?</td></tr></table>

<table><tr><td>Refuse. Offer to reorganize instead. Explain that every page stays; only its navigation placement changes.</td></tr></table>

<table><tr><td>Is the user asking to ADD a new page?</td></tr></table>

<table><tr><td>Assign it to a domain first (Section 2.2). Add it to the correct mega-menu section. Add it to the page → domain mapping table in Appendix A. Assign a discovery level (PRIMARY, SECONDARY, TERTIARY, or UTILITY).</td></tr></table>

<table><tr><td>Is the user asking to FIX or IMPROVE the menu?</td></tr></table>

<table><tr><td>Follow Section 8 (zodaci-navigation-audit) skill instructions in order, from Step 1 through Step 9. Do not skip steps.</td></tr></table>

<table><tr><td>Is a page not findable by users?</td></tr></table>

## Page 38

<table><tr><td>Check Appendix A. If it's not in any menu, add it to its domain's TERTIARY section in the mega-menu. Also add it as a contextual next step on the most relevant upstream page.</td></tr></table>

<table><tr><td>Is the nav too long (more than 7 top-level items)?</td></tr></table>

<table><tr><td>Apply the 7-item cap rule (Section 2.1, Rule 1). Move excess items into the mega-menu or the appropriate domain hub page. Never add an 8th top-level item.</td></tr></table>

<table><tr><td>Is the mobile navigation broken or overlapping content?</td></tr></table>

<table><tr><td>Check MobileTabBar first. Verify<br />pb-16<br />is applied to all page layouts. Check that the tab bar has<br />position: fixed; bottom: 0; z-index: 50<br />.</td></tr></table>

<table><tr><td>Is a page visually overwhelming (too many items)?</td></tr></table>

## Page 39

<table><tr><td>Apply a density control from Section 9.2. Choose the control that best fits the content type: tabs for categorized content, accordion for sequential content, progressive list for large flat lists, search+filter for more than 12 items.</td></tr></table>

<table><tr><td>Does a page have no "what next?" guidance?</td></tr></table>

<table><tr><td>Add the NextStepPanel component from Section 3.4. Define 2–3 contextually relevant next steps for that specific page using the user's chart data where possible.</td></tr></table>

<table><tr><td>Is a feature visible to users who cannot access it?</td></tr></table>

<table><tr><td>Show it with an unlock indicator (Section 5.2) — never hide it entirely. A subtle "Unlock" badge and tooltip is always preferred over an invisible feature.</td></tr></table>

---

<table><tr><td>VERSION HISTORY<br />v1.0 — October 20, 2026 — Initial skill document created by Ashton following full platform audit. Based on 90+ page inventory, App.tsx routing analysis, launch-plan.md P0/P1/P2 issues, and live site inspection of zodaci.com.<br />Next review:</td></tr></table>

## Page 40

<table><tr><td>After Phase 3 (Mobile Navigation) completion. Update Appendix A with any new pages added during implementation.</td></tr></table>


### Extracted images (40):
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_1.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_10.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_11.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_12.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_13.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_14.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_15.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_16.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_17.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_18.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_19.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_2.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_20.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_21.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_22.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_23.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_24.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_25.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_26.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_27.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_28.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_29.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_3.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_30.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_31.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_32.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_33.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_34.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_35.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_36.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_37.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_38.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_39.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_4.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_40.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_5.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_6.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_7.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_8.jpg`
- `parsed-documents://20261020-213936-313071/Zodaci_Lovable_Skill_-_Navigation_Information_Architecture_Menu_Redesign_Plan.docx/images/page_9.jpg`