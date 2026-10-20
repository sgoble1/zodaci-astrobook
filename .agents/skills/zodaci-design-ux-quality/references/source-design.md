# Document parsed from: Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx

## Page 1

# Zodaci Lovable Skills

*Design · UX · Layout · Copy · Bug Detection & Fixes · Build Quality*

<mark><u>VERSION 1.0</u></mark>

**Platform:** zodaci.com | **Stack:** React + TypeScript + Vite + Supabase + Tailwind CSS + shadcn/ui

**Prepared for:** Ashton | **Location:** Galloway, OH, United States | **Date:** Tuesday, 20 October 2026

**Classification:** Internal Working Reference — Lovable AI Agent Instructions

## Preface — How to Use This Document

This document defines the complete set of Lovable agent skills for the Zodaci platform. When Lovable is asked to make **any change** to Zodaci, it must consult the relevant section of this document before writing or editing code. Each skill section is structured around four mandatory diagnostic steps:

<table><tr><td>Step</td><td>Purpose</td><td>Output</td></tr><tr><td>DETECT</td><td>Identify what to look for in the codebase</td><td>Pattern match / grep target</td></tr><tr><td>DIAGNOSE</td><td>Determine the root cause of the issue</td><td>Named bug pattern or antipattern</td></tr><tr><td>FIX</td><td>Apply the exact implementation pattern</td><td>Code block or rule to follow</td></tr><tr><td>VERIFY</td><td>Confirm the fix is correctly applied</td><td>Test or grep to run</td></tr></table>

<table><tr><td>🔒 Prime Directive<br />When in doubt, follow the most<br />defensive, user-safe path</td></tr></table>

## Page 2

<table><tr><td>and surface the ambiguity as a comment in the code. Never silently discard an edge case.</td></tr></table>

**Platform Design Language:** Dark cosmic aesthetic — near-black backgrounds (<mark><u>#07080F</u></mark> primary), deep navy and midnight tones, glassmorphism card overlays, soft glowing gradients (gold, violet, teal), subtle star/sky animations, premium typography (serif display font for headings, clean sans-serif for body), film-reel and photo-sway animation motifs.

## Table of Contents

### **Skill 1 — Design System Enforcement**
1.1 Color Palette Rules · 1.2 Typography Scale · 1.3 Spacing & Layout Grid · 1.4 Glassmorphism Standard

### **Skill 2 — UI Component Quality**
2.1 Button Standards · 2.2 Form Field Standards · 2.3 Modal & Dialog · 2.4 Loading & Skeleton · 2.5 Empty States · 2.6 Toast & Notifications

### **Skill 3 — Layout Perfection**
3.1 Responsive Layout · 3.2 Sticky Header · 3.3 Page Transitions · 3.4 Scroll Behavior · 3.5 Chart Wheel Layout · 3.6 Z-Index Management

### **Skill 4 — Copy & Content Standards**
4.1 Voice & Tone · 4.2 Error Messages · 4.3 CTA Copy · 4.4 Pricing Copy · 4.5 Page Title & SEO · 4.6 Microcopy

### **Skill 5 — Bug Detection & Fixes**
5.1 Controlled Input Bug · 5.2 OAuth Destination Loss · 5.3 Stale Cover Preview · 5.4 Blank Screen on Lazy Load · 5.5 Admin Bypass Gap · 5.6 React Query Cache Invalidation · 5.7 Checkout Confirmation Polling

### **Skill 6 — Routing & Page Architecture**
6.1 New Route Checklist · 6.2 Orphan Page Resolution · 6.3 Multi-Export Page Files

### **Skill 7 — Performance & Code Quality**
7.1 React.memo & useMemo · 7.2 useEffect Dependency Audit · 7.3 TypeScript Strictness · 7.4 Console Log Cleanup · 7.5 Image Optimization

### **Skill 8 — Accessibility**

## Page 3

8.1 Color Contrast · 8.2 Focus Management · 8.3 Screen Reader Support

# **Skill 9 — Animation & Motion**

9.1 Film Scroll · 9.2 Photo Sway · 9.3 Star/Sky Background

# **Skill 10 — SEO Implementation**

10.1 OG Image · 10.2 Canonical Tags · 10.3 Sitemap

# **Appendix — Quick Reference Bug Checklist**

<table><tr><td>SKILL 1 — DESIGN SYSTEM ENFORCEMENT</td></tr></table>

# 1.1 Color Palette Rules

<table><tr><td>DETECT<br />Any hardcoded hex colors in component files that are not from the Zodaci design token set. Search for<br />style={{ color: '#...' }}<br />or<br />className="text-[#...]"<br />patterns. These bypass the design system.</td></tr></table>

**DIAGNOSE:** Run a grep for hardcoded hex values in <u>src/components</u> and <u>src/pages</u>. Zero results is the target. Replace all hardcoded colors with Tailwind CSS custom tokens from <u>tailwind.config.ts</u>.

**FIX — Canonical Zodaci Color Palette:**

<table><tr><td>Role</td><td>Tailwind Class</td><td>Hex Value</td><td>Notes</td></tr><tr><td>Background primary</td><td>bg-[#07080F]</td><td>#07080F</td><td>Near-black cosmos — base page background</td></tr></table>

## Page 4

<table><tr><td>Role</td><td>Tailwind Class</td><td>Hex Value</td><td>Notes</td></tr><tr><td>Background card</td><td>bg-white/5 backdrop-blur-md</td><td>white @ 5% opacity</td><td>Standard glassmorphism card</td></tr><tr><td>Background elevated</td><td>bg-white/10 backdrop-blur-lg</td><td>white @ 10% opacity</td><td>Featured or highlighted panels</td></tr><tr><td>Text primary</td><td>text-white</td><td>#FFFFFF</td><td>All main readable content</td></tr><tr><td>Text secondary</td><td>text-white/70</td><td>white @ 70%</td><td>Supporting copy, descriptions</td></tr><tr><td>Text muted</td><td>text-white/40</td><td>white @ 40%</td><td>Captions, labels — large text only</td></tr><tr><td>Accent gold (primary CTA)</td><td>text-amber-300 / bg-amber-300</td><td>#FCD34D</td><td>Primary call-to-action color</td></tr><tr><td>Accent violet (secondary)</td><td>text-violet-400 / bg-violet-500</td><td>#A78BFA / #8B5CF6</td><td>Secondary accent</td></tr><tr><td>Accent teal (data/charts)</td><td>text-teal-400</td><td>#2DD4BF</td><td>Chart highlights, data callouts</td></tr><tr><td>Border subtle</td><td>border-white/10</td><td>white @ 10%</td><td>Default card borders</td></tr><tr><td>Border active</td><td>border-amber-300/50</td><td>amber @ 50%</td><td>Focused/selected states</td></tr><tr><td>Destructive</td><td>text-red-400 / bg-red-500/20</td><td>#F87171 / red @ 20%</td><td>Error states, delete actions</td></tr></table>

<table><tr><td>VERIFY<br />grep -rn "style={{ color: '#" src/components src/pages<br />grep -rn 'text-\[#' src/components src/pages<br />Both commands must return zero results.</td></tr></table>

---

# 1.2 Typography Scale Rules

## Page 5

<table><tr><td>DETECT<br />Inconsistent font sizes, weights, or missing font hierarchy across components and pages.</td></tr></table>

**FIX — Enforce this type scale across all components:**

<table><tr><td>Role</td><td>Tailwind Classes</td><td>Usage</td></tr><tr><td>Display (hero headings)</td><td>font-serif text-5xl md:text-7xl font-light tracking-tight</td><td>Homepage hero, major landing sections</td></tr><tr><td>H1 (page titles)</td><td>font-serif text-3xl md:text-4xl font-normal</td><td>Top-level page identifier</td></tr><tr><td>H2 (section headings)</td><td>text-xl md:text-2xl font-semibold tracking-wide</td><td>Major section dividers</td></tr><tr><td>H3 (card titles)</td><td>text-base md:text-lg font-semibold</td><td>Card headers, subsections</td></tr><tr><td>Body</td><td>text-sm md:text-base font-normal leading-relaxed</td><td>All paragraph and reading content</td></tr><tr><td>Caption / label</td><td>text-xs font-medium tracking-widest uppercase text-white/50</td><td>Form labels, data labels, tags</td></tr><tr><td>Monospace (data values)</td><td>font-mono text-sm</td><td>Degrees, times, coordinates</td></tr></table>

<table><tr><td>📐 Typography Rule<br />NEVER<br />use<br />font-bold<br />on Display or H1 elements. The Zodaci brand uses<br />font-light</td></tr></table>

## Page 6

<table><tr><td>/<br />font-normal<br />for large display text. Bold is reserved for H2, H3, and UI labels only.</td></tr></table>

## 1.3 Spacing & Layout Grid

<table><tr><td>DETECT<br />Components with inconsistent padding, misaligned grids, or elements that touch container edges with no breathing room.</td></tr></table>

**FIX — Enforce spatial consistency using these canonical spacing tokens:**

<table><tr><td>Context</td><td>Classes</td></tr><tr><td>Page container (max width)</td><td>max-w-6xl mx-auto px-4 sm:px-6 lg:px-8</td></tr><tr><td>Section vertical spacing</td><td>py-16 md:py-24</td></tr><tr><td>Card internal padding</td><td>p-6 md:p-8</td></tr><tr><td>Button — standard</td><td>px-6 py-3</td></tr><tr><td>Button — compact</td><td>px-4 py-2</td></tr><tr><td>Button — hero CTA</td><td>px-8 py-4</td></tr><tr><td>Grid gap — compact</td><td>gap-4</td></tr><tr><td>Grid gap — standard</td><td>gap-6</td></tr><tr><td>Grid gap — loose</td><td>gap-8</td></tr><tr><td>Grid gap — section-level</td><td>gap-12</td></tr><tr><td>Form field spacing</td><td>space-y-4 within forms, space-y-6 between form sections</td></tr></table>

## Page 7

# 1.4 Glassmorphism Component Standard

<table><tr><td>DETECT<br />Cards or panels that use solid opaque backgrounds (e.g.,<br />bg-gray-800<br />,<br />bg-slate-900<br />) instead of the Zodaci glassmorphism treatment.</td></tr></table>

**FIX — Three canonical glass card patterns:**

<table><tr><td>Standard Glass Card<br />className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl shadow-black/20"</td></tr></table>

<table><tr><td>Elevated / Featured Card<br />className="rounded-2xl border border-amber-300/20 bg-white/8 backdrop-blur-lg shadow-2xl shadow-amber-300/5"</td></tr></table>

## Page 8

<table><tr><td>Interactive Card (with hover state)<br />className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300
  hover:bg-white/10 hover:border-white/20 hover:shadow-xl"</td></tr></table>

<table><tr><td>⛔ Critical Rule<br />NEVER<br />use solid opaque backgrounds such as<br />bg-gray-800<br />,<br />bg-slate-900<br />, or<br />bg-zinc-900<br />on cards inside the Zodaci dark theme. Always use<br />bg-white/[opacity]<br />combined with<br />backdrop-blur<br />.</td></tr></table>

<table><tr><td>SKILL 2 — UI COMPONENT QUALITY</td></tr></table>

## Page 9

# 2.1 Button Standards

<table><tr><td>DETECT<br />Buttons with incorrect styling, missing loading states, wrong sizing, or inconsistent visual hierarchy.</td></tr></table>

**FIX — The four canonical button variants:**

<table><tr><td>Primary — Main CTA (amber gold)<br />className="bg-amber-300 text-[#07080F] font-semibold px-6 py-3 rounded-full
  hover:bg-amber-200 transition-all duration-200
  shadow-lg shadow-amber-300/20 active:scale-95"</td></tr></table>

<table><tr><td>Secondary — Outlined<br />className="border border-white/20 text-white px-6 py-3 rounded-full
  hover:bg-white/10 hover:border-white/40 transition-all duration-200"</td></tr></table>

<table><tr><td>Ghost — Low Emphasis<br />className="text-white/60 hover:text-white px-4 py-2 rounded-lg
  hover:bg-white/5 transition-colors duration-200"</td></tr></table>

## Page 10

<table><tr><td>Destructive — Delete / Danger<br />className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-full
  hover:bg-red-500/20 transition-all duration-200"</td></tr></table>

## **LOADING STATE** — Required on every async button:

```
disabled={isLoading} className={cn(baseClassName, isLoading && "opacity-60 cursor-not-allowed")}  // Button content: {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {isLoading ? "Loading..." : buttonLabel}
```

<table><tr><td>📐 Button Rule<br />Every button that triggers an async action (save, fetch, generate, purchase)<br />must<br />implement the loading state pattern above. No exceptions.</td></tr></table>

---

## **2.2 Form Field Standards**

<table><tr><td>DETECT<br />Inputs that clear their value after 1 character, reset on parent re-render, are missing labels, or lack error states.</td></tr></table>

**FIX — Every form field must use this structure:**

```

  <label className="text-xs font-medium tracking-widest uppercase text-white/50">    {label}  </label>  <input
  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white    placeholder:text-white/30 focus:outline-none focus:border-amber-300/50    focus:ring-1 focus:ring-amber-300/20 transition-all duration-200"    {...register(fieldName, { required: true })}  />

## Page 11

```{errors[fieldName] && ( 
{errors[fieldName].message}
  )} 


<table><tr><td>⛔ Onboarding Description Field — Known Critical Bug<br />NEVER<br />derive a controlled input's value from a server fetch result inside a<br />useEffect<br />that fires on every render. Store form values in local<br />useState<br />. Initialize from the server<br />once only<br />using an empty dependency array<br />[]<br />.</td></tr></table>

---

## **2.3 Modal & Dialog Standards**

<table><tr><td>DETECT<br />Modals that trap scroll incorrectly, overlap navigation, lack a close affordance, or are built as custom<br />div<br />overlays.</td></tr></table>

## Page 12

# FIX — All modals must use the shadcn/ui Dialog component with these styles:

<table><tr><td>Element</td><td>Required Class / Rule</td></tr><tr><td>Overlay</td><td>bg-black/70 backdrop-blur-sm</td></tr><tr><td>Dialog panel</td><td>bg-[#0D0E1A] border border-white/10 rounded-2xl</td></tr><tr><td>Close button</td><td>Always present — X icon, top-right corner, aria-label="Close"</td></tr><tr><td>Scroll lock</td><td>Handled automatically by Radix UI DialogContent</td></tr><tr><td>Focus trap</td><td>Handled automatically by Radix UI — do not override</td></tr></table>

<table><tr><td>📐 Modal Rule<br />NEVER<br />build custom modal divs. Always use<br />shadcn Dialog<br />to guarantee accessibility compliance, focus trapping, and scroll lock behavior.</td></tr></table>

---

## 2.4 Loading & Skeleton States

<table><tr><td>DETECT<br />Pages or components that show a blank area or a lone spinner with no content shape while data is loading.</td></tr></table>

**FIX — Skeleton template (shape-matched to actual content layout):**

## Page 13

if (isLoading) return (  
  
   
   
   
 )

<table><tr><td>📐 Skeleton Rule<br />Spinners alone are<br />not acceptable<br />for content-heavy pages (charts, readings, library). Use shape-appropriate skeletons that match the actual content layout the user will see.</td></tr></table>

## 2.5 Empty State Standards

<table><tr><td>DETECT<br />Components that return<br />null<br />, an empty<br />div<br />, or render nothing when their data array is empty.</td></tr></table>

**FIX — Every list, grid, or data display requires an explicit empty state:**

if (!data || data.length === 0) return (  
  
{emptyIcon}
   
### {emptyTitle}
   
{emptyDescription}
   {ctaLabel && <Button onClick={ctaAction}>{ctaLabel}</Button>}   
 )

## Page 14

# 2.6 Toast & Notification Standards

<table><tr><td>DETECT<br />Alert dialogs used for success/error feedback, or<br />console.log()<br />calls substituting for user-facing messages. Any mutation that provides no feedback to the user.</td></tr></table>

**FIX — Use the sonner toast library (already in dependencies):**

```
// Success toast.success("Chart saved successfully") // Error
toast.error("Something went wrong. Please try again.") // Info
toast.info("Your reading is being generated...") // Async Promise (preferred for mutations) toast.promise(asyncFn(), {  loading: "Saving...",  success: "Saved!",  error: "Failed to save. Try again." })
```

<table><tr><td>⛔ Notification Rules<br />NEVER<br />use<br />window.alert()<br />.<br />NEVER<br />use<br />console.log()<br />for user-facing messages. Every mutation (save, delete, update, upload, generate) must surface a toast result to the user.</td></tr></table>

## Page 15

<table><tr><td>SKILL 3 — LAYOUT PERFECTION</td></tr></table>

# 3.1 Responsive Layout Rules

<table><tr><td>DETECT<br />Any layout that breaks on mobile (<br />&#x3C;<br />640px), tablet (640–1024px), or wide (<br />><br />1440px) screens. Fixed pixel values on padding or width that don't adapt.</td></tr></table>

**FIX — Follow the Zodaci responsive pattern at every breakpoint:**

<table><tr><td>Context</td><td>Pattern</td></tr><tr><td>General approach</td><td>Mobile-first: write base styles for mobile, override with sm:/md:/lg:</td></tr><tr><td>Navigation</td><td>Collapses to hamburger menu below md:breakpoint</td></tr><tr><td>Hero sections</td><td>Single column on mobile, side-by-side on lg:</td></tr><tr><td>Grid layouts</td><td>grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 — never skip breakpoints</td></tr><tr><td>Font sizes</td><td>Always include both variants: text-2xl md:text-4xl</td></tr><tr><td>Horizontal padding</td><td>px-4 sm:px-6 lg:px-8 — never fixed px on mobile</td></tr><tr><td>Chart wheels</td><td>max-w-[320px] mx-auto on mobile; full width up to max-w-[600px] on md:</td></tr></table>

## Page 16

# 3.2 Sticky Header Behavior

<table><tr><td>DETECT<br />Header that causes layout shift, covers interactive content, or loses its glass effect when the page is scrolled.</td></tr></table>

**FIX — Dynamic scroll-state header:**

```javascript
// Base (unscrolled state) <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07080F]/80 backdrop-blur-xl transition-all duration-300"> // After scroll - apply via className with conditional logic:
className={cn("sticky top-0 z-50 transition-all duration-300", isScrolled ? "border-b border-white/10 bg-[#07080F]/90 backdrop-blur-xl shadow-lg shadow-black/20" : "border-b border-transparent bg-transparent" )}
```

<table><tr><td>📐 Header Rule<br />The header must<br />never cover interactive content<br />. All page layouts must include a top padding equal to the header height. If header is<br />h-16<br />, the page body must begin at<br />pt-16<br />.</td></tr></table>

---

# 3.3 Page Transition Animations

## Page 17

<table><tr><td>DETECT<br />Pages that snap in abruptly without any transition, causing a jarring visual experience between routes.</td></tr></table>

**FIX — Wrap every page component in a fade-in motion wrapper:**

```html

 {/* * page content */} 

```

<table><tr><td>📐 Animation Bundle Rule<br />Use Tailwind<br />animate-in<br />utilities (tw-animate-css). Do<br />NOT<br />install framer-motion unless it is already in<br />package.json<br />. Heavy animation libraries must not be added solely for simple page transitions.</td></tr></table>

## 3.4 Scroll Behavior

<table><tr><td>DETECT<br />Pages that do not scroll to top on route navigation. Infinite scroll without a loading indicator at the bottom of the list.</td></tr></table>

## Page 18

# **FIX — Scroll-to-top on route change:**

```
// Place in App.tsx or a dedicated ScrollToTop component const { pathname } =
useLocation(); useEffect(() => {  window.scrollTo({ top: 0, behavior:
'instant' }); }, [pathname]);  // Infinite scroll bottom indicator:
{isFetchingNextPage && (  

<Loader2 className="w-6 h-6 animate-spin text-white/40" />  
 )}
```

## 3.5 Chart Wheel Layout

<table><tr><td>DETECT<br />Birth chart wheel that overflows its container, loses its 1:1 aspect ratio, or renders incorrectly on small screens.</td></tr></table>

## **FIX — Aspect-ratio-locked chart container:**


 
  <ChartWheel data={chartData} />  




<table><tr><td>Screen</td><td>Constraint</td></tr><tr><td>Mobile (&#x3C; 640px)</td><td>max-w-[320px] mx-auto</td></tr><tr><td>Desktop (≥ 768px)</td><td>Full width up to max-w-[600px]</td></tr></table>

## 3.6 Z-Index Management

<table><tr><td>DETECT<br />Components overlapping incorrectly — dropdowns hidden behind cards, tooltips clipped, modals behind the navigation header.</td></tr></table>

## Page 19

# **FIX — Enforce this canonical z-index scale:**

<table><tr><td>Layer</td><td>Z-Index</td><td>Examples</td></tr><tr><td>Background elements</td><td>z-0</td><td>Star backgrounds, decorative SVGs</td></tr><tr><td>Cards and content</td><td>z-10</td><td>Reading cards, chart panels</td></tr><tr><td>Sticky section headers</td><td>z-20</td><td>Table of contents, in-page tabs</td></tr><tr><td>Floating UI</td><td>z-30</td><td>Tooltips, dropdowns, popovers</td></tr><tr><td>Navigation header</td><td>z-50</td><td>Top nav bar</td></tr><tr><td>Modals and sheets</td><td>z-[100]</td><td>Dialog panels, bottom sheets</td></tr><tr><td>Toast notifications</td><td>z-[200]</td><td>Sonner toasts</td></tr></table>

<mark>

<table><tr><td>📐 Z-Index Rule<br />Never<br />use arbitrary z-index values above 200. If a new layering requirement emerges, document the new layer in this table before implementation.</td></tr></table>

</mark>

<table><tr><td>SKILL 4 — COPY &#x26; CONTENT STANDARDS</td></tr></table>

## 4.1 Voice & Tone Rules

<table><tr><td>DETECT<br />Copy that sounds generic, robotic, corporate, or contradicts the Zodaci brand voice. Trigger phrases: "We provide...", "Our platform...", "This feature allows you to...", or any passive-voice construction like "Readings are generated by AI."</td></tr></table>

## Page 20

**Zodaci brand voice:** Mystical but grounded. Personal and direct. Poetic without being vague. Confident without being salesy.

<table><tr><td>❌ Wrong (Generic)</td><td>✅ Right (Zodaci Voice)</td></tr><tr><td>"This feature allows you to view your birth chart."</td><td>"Your chart. Your sky. Everything written in it, decoded."</td></tr><tr><td>"We provide AI-powered astrological readings."</td><td>"Your reading is crafted from your exact birth data — the sky as it looked the moment you arrived."</td></tr><tr><td>"Get started today!"</td><td>"Begin with your chart."</td></tr><tr><td>"Our platform offers comprehensive astrology tools."</td><td>"Every planet. Every house. Every pattern — yours to explore."</td></tr><tr><td>"Error: Request failed."</td><td>"Something didn't connect — give it another moment, or try again."</td></tr></table>

---

## 4.2 Error Message Standards

<table><tr><td>DETECT<br />Raw error messages, stack traces, or technical codes shown to end users. Any<br />error.message<br />rendered directly into JSX without sanitization.</td></tr></table>

**Error copy template:** *[What happened]* — *[Simple, single action to take]*

<table><tr><td>Situation</td><td>Zodaci Error Copy</td></tr><tr><td>Chart failed to load</td><td>"Your chart couldn't load right now. Try again."</td></tr><tr><td>Reading still generating</td><td>"Your reading is still generating — check back in a moment."</td></tr></table>

## Page 21

<table><tr><td>Situation</td><td>Zodaci Error Copy</td></tr><tr><td>Save failed</td><td>"We couldn't save your chart right now. Your data is safe — try again."</td></tr><tr><td>Auth required</td><td>"This page needs you to be signed in."</td></tr><tr><td>Network error</td><td>"Something didn't connect — give it another moment, or try again."</td></tr></table>

<table><tr><td>⛔ Error Message Rules<br />Never expose<br />to end users: network error objects, database error codes, Supabase error messages, function names, or HTTP status codes. All error states must use the template above.</td></tr></table>

---

# 4.3 CTA Copy Rules

<table><tr><td>DETECT<br />Generic CTA text: "Sign Up", "Buy Now", "Learn More", "Submit", "Continue", "Download", "Generate". These are brand violations.</td></tr></table>

**FIX — Canonical Zodaci CTA copy map:**

<table><tr><td>Context</td><td>Required CTA Text</td></tr><tr><td>Primary sign-up</td><td>"Begin With Your Chart"</td></tr><tr><td>Trial / demo</td><td>"See It First" or "Preview Your Reading"</td></tr><tr><td>Purchase print book</td><td>"Order Your AstroBook"</td></tr><tr><td>Purchase digital PDF</td><td>"Get Your PDF"</td></tr></table>

## Page 22

<table><tr><td>Context</td><td>Required CTA Text</td></tr><tr><td>Generate a reading</td><td>"Read My Chart"</td></tr><tr><td>Explore features</td><td>"See What's Inside"</td></tr><tr><td>Return user login</td><td>"Welcome Back"</td></tr></table>

<table><tr><td>📐 CTA Rule<br />No CTA may be more than<br />4 words<br />unless it is a pricing context where specificity directly aids conversion (e.g., "Order Your AstroBook — $59").</td></tr></table>

---

## 4.4 Pricing Copy Standards

<table><tr><td>DETECT<br />Price displays that mix formats, use wrong amounts, lack context labels, or derive amounts from live calculations for historical orders.</td></tr></table>

**FIX — Canonical pricing display table:**

<table><tr><td>Product</td><td>Price</td><td>Required Label</td></tr><tr><td>Print Standard</td><td>$59</td><td>"Printed &#x26; Shipped to You"</td></tr><tr><td>Print Expanded</td><td>$89</td><td>"Full Edition with Volume II"</td></tr><tr><td>Digital PDF</td><td>$19.99</td><td>"Instant Download"</td></tr><tr><td>Extras (each)</td><td>$6.99</td><td>"Add-on" — max 2 per order</td></tr></table>

## Page 23

<table><tr><td>📐 Pricing Rule<br />Never show a price without its format label. Never display a price derived from a live calculation for past orders — always use the stored<br />amount_paid<br />column value from the database.</td></tr></table>

## 4.5 Page Title & SEO Copy

<table><tr><td>DETECT<br />Pages with generic, missing, or duplicated<br />&#x3C;title><br />and<br />&#x3C;meta name="description"><br />tags.</td></tr></table>

**FIX — Required Helmet block for every page:**

```html
<Helmet>  <title>{pageTitle} · Zodaci</title>  <meta name="description" content={pageDescription} />  <meta property="og:title" content={`${pageTitle} · Zodaci`} />  <meta property="og:description" content={pageDescription} />  <link rel="canonical" href={`https://zodaci.com${location.pathname}`} /> </Helmet>
```

**Canonical page title patterns:**

<table><tr><td>Page</td><td>Title</td></tr></table>

## Page 24

<table><tr><td>Page</td><td>Title</td></tr><tr><td>Home</td><td>"Zodaci · Your Chart, Readings &#x26; Printed AstroBook"</td></tr><tr><td>Birth Chart</td><td>"Your Birth Chart · Zodaci"</td></tr><tr><td>Pricing</td><td>"AstroBook Pricing · Zodaci"</td></tr><tr><td>My Readings</td><td>"My Readings · Zodaci"</td></tr><tr><td>Masterbook</td><td>"The Masterbook · Zodaci"</td></tr></table>

## 4.6 Microcopy Standards

<table><tr><td>DETECT<br />Missing helper text, confusing field labels, or placeholder text used as the<br />only<br />label on a form field. Validation messages that say "Invalid input" instead of something specific.</td></tr></table>

**FIX — All form fields require three layers of microcopy:**

1. A label **above** the field (never placeholder-only)
2. **Helper text below** for non-obvious fields (`<u>text-xs text-white/40</u>`)
3. **Specific validation messages** — not "Invalid input"

**Standard microcopy examples:**

<table><tr><td>Field</td><td>Helper Text</td></tr><tr><td>Birth time</td><td>"Enter your birth time as accurately as possible — even an approximate time helps."</td></tr><tr><td>Birth place</td><td>"City, state or country — we'll find the exact coordinates."</td></tr></table>

## Page 25

<table><tr><td>Field</td><td>Helper Text</td></tr><tr><td>Reading description</td><td>"Tell us what's on your mind. The more specific, the more resonant your reading."</td></tr></table>

<table><tr><td>SKILL 5 — BUG DETECTION &#x26; FIXES</td></tr></table>

# 5.1 React Controlled Input Bug Pattern

<table><tr><td>DETECT<br />Form fields that clear their value after typing 1 character, or that reset to the server value every time the parent component re-renders.</td></tr></table>

**DIAGNOSE:** Check if the input's `value` is set from (a) a prop that originates from a server query, OR (b) a `<u>useEffect</u>` that has that value as a dependency — causing a loop on every keystroke.

**FIX — Correct pattern (local state initialized once):**

```javascript
const [description, setDescription] = useState(''); // Initialize from server data ONCE on mount only useEffect(() => { if (serverData?.description) setDescription(serverData.description); }, []); // <-- EMPTY dependency array. Runs once only. // Controlled input: <textarea value={description} onChange={e => setDescription(e.target.value)} />
```

<table><tr><td>⛔ Anti-Pattern — Never Do This<br />// WRONG — resets on every render if serverData re-fetches
&#x3C;textarea value={serverData?.description || ''} onChange={...} /></td></tr></table>

---

# 5.2 OAuth Destination Loss Bug

## Page 26

<table><tr><td>DETECT<br />After OAuth login (Google, etc.), the user is redirected to<br />/<br />or<br />/dashboard<br />instead of the page they were originally trying to access.</td></tr></table>

## **FIX — Save and restore the intended destination:**

```javascript
// Step 1 - Before triggering OAuth, save destination localStorage.setItem(
'zodaci_redirect_after_login',  window.location.pathname +
window.location.search ); // Step 2 - Trigger OAuth
supabase.auth.signInWithOAuth({  provider: 'google',  options: {
redirectTo: window.location.origin + '/auth/callback' } }); // Step 3 - In
onAuthStateChange handler: if (event === 'SIGNED_IN') {  const redirectTo =
localStorage.getItem('zodaci_redirect_after_login') || '/dashboard';
localStorage.removeItem('zodaci_redirect_after_login');
navigate(redirectTo); }
```

## 5.3 Stale Cover Preview Bug

<table><tr><td>DETECT<br />After uploading a new book cover, the old cover image still appears in the UI — even though the upload was successful.</td></tr></table>

## **FIX — Two-part solution (cache invalidation + cache-busting URL):**

```javascript
// Part 1: Invalidate React Query cache after successful upload await
queryClient.invalidateQueries({ queryKey: ['book-cover', bookId] }); // Part
2: Append a cache-bust param to the rendered image src <img
src={`${coverUrl}?v=${Date.now()}`}  alt="Book cover preview" />

## Page 27

# 5.4 Blank Screen on Lazy Load Failure

<table><tr><td>DETECT<br />A completely blank white or dark page with no content and no error message. Browser DevTools console shows "Loading chunk [n] failed" or "Cannot find module".</td></tr></table>

**FIX — Wrap all Suspense routes in a global ErrorBoundary:**

```javascript
import { ErrorBoundary } from 'react-error-boundary'; function AppErrorFallback({ error, resetErrorBoundary }) { return ( 
 
 
💔
 
# Something shifted unexpectedly.
 
 We couldn't load this page. Your data is safe. 
 <button onClick={resetErrorBoundary} className="bg-amber-300 text-[#07080F] px-6 py-3 rounded-full font-semibold"> Try Again </button> 
 
 ); } // In App.tsx – wrap all routes: <ErrorBoundary FallbackComponent={AppErrorFallback} onReset={() => window.location.reload()} > <Suspense fallback={<PageLoadingSpinner />}> {routes} </Suspense> </ErrorBoundary>
```

---

# 5.5 Admin Bypass Gap

<table><tr><td>DETECT<br />Admin users can access paid content without passing the payment verification check — the<br />isAdmin<br />flag short-circuits the payment gate entirely.</td></tr></table>

## Page 28

# **FIX — Admin bypass must require explicit preview context and logging:**

```
// ❌ WRONG - admin bypasses payment entirely if (isAdmin) return contentResponse; // ✅ RIGHT - admin preview requires explicit context + audit log if (isAdmin && requestedContext === 'admin-preview') { await logAdminPreview(userId, contentId); // always log admin access return contentResponse; } // All users (including admin in normal browsing) must pass payment check: const order = await supabase  .from('orders') .select()  .eq('user_id', userId)  .eq('status', 'paid')  .single(); if (!order.data) return unauthorizedResponse;
```

## 5.6 React Query Cache Invalidation Checklist

After **any** mutation (save, update, delete, upload, generate), invalidate the following query keys:

<table><tr><td>Mutation Action</td><td>Query Keys to Invalidate</td></tr><tr><td>User profile change</td><td>['user-profile', userId]</td></tr><tr><td>Chart save</td><td>['birth-chart', userId]</td></tr><tr><td>Book cover upload</td><td>['book-cover', bookId]</td></tr><tr><td>Order placed</td><td>['orders', userId]</td></tr><tr><td>Reading generated</td><td>['readings', userId], ['topic-readings', userId]</td></tr><tr><td>Page content updated</td><td>['custom-pages'], ['page', pageId]</td></tr></table>

<table><tr><td>⛔ Cache Rule<br />Missing cache invalidation is one of the most common causes of stale data bugs. After<br />EVERY<br />mutation, verify all relevant queries are invalidated before marking the task complete.</td></tr></table>

## Page 29

# 5.7 Checkout Confirmation Polling

<table><tr><td>DETECT<br />The checkout success page unlocks premium content immediately on URL redirect, without verifying payment server-side. A malicious actor could navigate directly to the success URL.</td></tr></table>

**FIX — Poll the database until payment is confirmed, with a timeout:**

```javascript
const [paymentVerified, setPaymentVerified] = useState(false); const
[attempts, setAttempts] = useState(0); useEffect(() => {  const sessionId =
new URLSearchParams(location.search).get('session_id');  const interval =
setInterval(async () => {    if (attempts >= 15) { // 30-second timeout (15
* 2s intervals)    clearInterval(interval);    setError('Payment is
taking longer than expected. Check your orders page.');    return;  }
const { data } = await supabase        .from('orders')        .select('status')
.eq('stripe_session_id', sessionId)        .single();    if (data?.status
=== 'paid') {    clearInterval(interval);    setPaymentVerified(true);
queryClient.invalidateQueries({ queryKey: ['orders', userId] });  }
setAttempts(a => a + 1);  }, 2000);    return () => clearInterval(interval);
}, []); // Run once on mount
```

<table><tr><td>SKILL 6 — ROUTING &#x26; PAGE ARCHITECTURE</td></tr></table>

## 6.1 New Route Registration Checklist

When adding any new page to Zodaci, complete all six steps in order:

4. Create the file at <u>src/pages/[PageName].tsx</u>

5. Add a lazy import in <u>App.tsx</u>: <u>const PageName = lazy(() =></u>
  <u>import('./pages/PageName');</u>

6. Add the Route element: <u><Route path="/route-path" e lement={<PageName />} /> </u>

7. Add Helmet meta tags (title, description, canonical) inside the page component

8. Verify the route works by navigating to it **directly by URL**, not just via an internal link

## Page 30

9. Add to the navigation menu if the page should be user-discoverable

## 6.2 Orphan Page Resolution

<table><tr><td>DETECT<br />Files in<br />src/pages/<br />that have no registered route in<br />App.tsx<br />and no inline comment explaining their purpose.</td></tr></table>

**FIX — Resolve each orphan file as follows:**

<table><tr><td>File</td><td>Required Action</td></tr><tr><td>AprilHome.tsx</td><td>Add route /april-preview protected by aprilOnly() auth, or delete if unused</td></tr><tr><td>FounderTopics.tsx</td><td>Verify if rendered inside another page; if standalone, add route /founder/topics</td></tr><tr><td>MemberChartSection.tsx</td><td>If sub-section of Dashboard, move to src/components/dashboard/; if standalone, add route</td></tr><tr><td>MemberStarMap.tsx</td><td>Same resolution as MemberChartSection</td></tr><tr><td>MemberSystem.tsx</td><td>Same resolution as MemberChartSection</td></tr><tr><td>MemberWorkbook.tsx</td><td>Same resolution as MemberChartSection</td></tr><tr><td>PersonalTiming.tsx</td><td>Verify usage; if standalone, add route /personal-timing</td></tr></table>

## Page 31

<mark>

<table><tr><td>📐 Orphan Rule<br />No file may exist in<br />src/pages/<br />without either a registered route<br />or<br />a top-of-file comment:<br />// NOTE: Rendered as a sub-section of [ParentPage], not directly routed.</td></tr></table>

</mark>

## 6.3 Multi-Export Page Files

<mark>

<table><tr><td>DETECT<br />Files in<br />src/pages/<br />that export more than one routed component. This causes unclear ownership and import confusion.</td></tr></table>

</mark>

**FIX — Split each multi-export file into separate single-export files:**

<mark>

<table><tr><td>Current File</td><td>Exports to Split</td><td>Target Files</td></tr><tr><td>PublicLibrary.tsx</td><td>PublicLibrary, PublicReader, PublicDocument</td><td>3 separate files</td></tr><tr><td>MasterbookContents.tsx</td><td>MasterbookContents, MasterbookContentsEntry</td><td>2 separate files</td></tr><tr><td>Topic.tsx</td><td>Topic (default) + TopicsIndex (named)</td><td>Move TopicsIndex to TopicsIndex.tsx</td></tr></table>

</mark>

## Page 32

<table><tr><td>SKILL 7 — PERFORMANCE &#x26; CODE QUALITY</td></tr></table>

# 7.1 React.memo and useMemo Rules

<table><tr><td>DETECT<br />Heavy components — chart wheels, reading panels, book previews — re-rendering on every parent state change even when their own props haven't changed.</td></tr></table>

**FIX — Memoize expensive rendering components:**

```javascript
export const ChartWheel = React.memo(({ data }: ChartWheelProps) => {
  const computedPositions = useMemo(() => computePlanetPositions(data), [data]);
  // render logic
});
```

<table><tr><td>Component Type</td><td>Use React.memo?</td><td>Reason</td></tr><tr><td>Chart rendering</td><td>✅ Yes</td><td>Expensive computation, rarely changes</td></tr><tr><td>Reading content panels</td><td>✅ Yes</td><td>Large text blocks, no frequent prop changes</td></tr><tr><td>Book page previews</td><td>✅ Yes</td><td>Image-heavy rendering</td></tr><tr><td>Audio waveform displays</td><td>✅ Yes</td><td>Canvas-based, high repaint cost</td></tr><tr><td>Simple buttons / labels</td><td>❌ No</td><td>Memo overhead exceeds render cost</td></tr></table>

---

# 7.2 useEffect Dependency Audit

## Page 33

<table><tr><td>DETECT<br />useEffect<br />hooks with missing dependencies causing stale closures, or excessive dependencies causing infinite render loops.</td></tr></table>

**FIX — Apply these rules to every useEffect:**

- Mount-only effects: use `[]` dependency array explicitly
- Effects that depend on a function: wrap that function in <u>useCallback</u>
- **NEVER** include <u>setState</u> functions in dependency arrays (they are stable by React guarantee)
- <mark>eslint-plugin-react-hooks</mark> <mark>exhaustive-deps</mark> rule and resolve all warnings before commit

---

## 7.3 TypeScript Strictness

<table><tr><td>DETECT<br />any<br />types, non-null assertions (<br />!<br />), or<br />@ts-ignore<br />comments in business logic files under<br />src/lib/<br />.</td></tr></table>

## Page 34

<table><tr><td>Location</td><td>Tolerance</td><td>Rule</td></tr><tr><td>src/lib/</td><td>Zero tolerance</td><td>No any, no !, no @ts-ignore</td></tr><tr><td>src/components/</td><td>Third-party boundary only</td><td>Allowed only where a library's types are incomplete — must include a comment explaining why</td></tr></table>

**Replace every non-null assertion with optional chaining:**

```
// ❌ Wrong const name = user!.profile!.displayName; // ✅ Right const name = user?.profile?.displayName ?? 'Anonymous';
```

## 7.4 Console Log Cleanup

<table><tr><td>DETECT<br />console.log()<br />statements left in production code paths.</td></tr></table>

**FIX — Replace all console.log before any production merge:**

<table><tr><td>Type</td><td>Fix</td></tr><tr><td>Debug info</td><td>Remove entirely</td></tr><tr><td>Error reporting</td><td>Use Sentry.captureException(error)</td></tr><tr><td>Development-only</td><td>Wrap: if (import.meta.env.DEV) console.log(...)</td></tr></table>

**Add this ESLint rule to eslint.config.js:**

<mark>eslint.config.js</mark>

```javascript
'no-console': ['warn', { allow: ['warn', 'error'] }]

## Page 35

# 7.5 Image Optimization

<img src="<table><tr><td>DETECT<br />Images loaded at full resolution with no<br />width<br />/<br />height<br />constraints, no lazy loading attribute, and no explicit<br />decoding<br />hint.</td></tr></table>" alt="Table Placeholder">

**FIX — Required attributes on every image element:**

<img src={url} alt={descriptiveAlt} width={targetWidth} height={targetHeight} loading="lazy" decoding="async" className="object-cover" />

<img src="<table><tr><td>Asset Type</td><td>Size Constraint</td><td>Format</td></tr><tr><td>OG / Social image</td><td>Exactly 1200×630px</td><td>JPEG, &#x3C;200KB</td></tr><tr><td>Book covers</td><td>Max 600px width</td><td>WebP via Supabase Storage transform</td></tr><tr><td>User profile photos</td><td>Max 200×200px display</td><td>WebP preferred</td></tr></table>" alt="Table Placeholder">

<img src="<table><tr><td>SKILL 8 — ACCESSIBILITY</td></tr></table>" alt="Table Placeholder">

# 8.1 Color Contrast

## Page 36

<table><tr><td>DETECT<br />Text color combinations that fail WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt bold+).</td></tr></table>

**FIX — Zodaci dark theme critical contrast pairs:**

<table><tr><td>Text Class</td><td>Background</td><td>Contrast</td><td>Status</td></tr><tr><td>text-white</td><td>bg-[#07080F]</td><td>21:1</td><td>✅ Passes</td></tr><tr><td>text-white/70</td><td>bg-[#07080F]</td><td>~6:1</td><td>✅ Passes</td></tr><tr><td>text-white/40</td><td>bg-[#07080F]</td><td>~3:1</td><td>⚠️ Marginal — large text / decorative only</td></tr><tr><td>text-amber-300</td><td>bg-[#07080F]</td><td>~9:1</td><td>✅ Passes</td></tr><tr><td>text-white/40</td><td>bg-white/10</td><td>&#x3C;3:1</td><td>❌ FAILS — use text-white/60 minimum</td></tr></table>

---

## 8.2 Focus Management

<table><tr><td>DETECT<br />Interactive elements with no visible focus ring. Any use of<br />focus:outline-none<br />without a corresponding<br />focus-visible:<br />style that provides an alternative indicator.</td></tr></table>

**FIX — Required focus ring pattern for all interactive elements:**

## Page 37

className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080F]"

<table><tr><td>📐 Focus Rule<br />Never<br />use<br />focus:outline-none<br />in isolation. Every element that removes the default outline<br />must<br />provide a<br />focus-visible:<br />alternative.</td></tr></table>

## 8.3 Screen Reader Support

<table><tr><td>DETECT<br />Icon-only buttons with no accessible label. Decorative images with meaningful<br />alt<br />text. Interactive elements with no ARIA role or label.</td></tr></table>

**FIX — Required ARIA patterns:**

<table><tr><td>Element</td><td>Required Pattern</td></tr></table>

## Page 38

<table><tr><td>Element</td><td>Required Pattern</td></tr><tr><td>Icon-only button</td><td>&#x3C;button aria-label="Close reading">&#x3C;X />&#x3C;/button></td></tr><tr><td>Decorative image</td><td>&#x3C;img alt="" role="presentation" /></td></tr><tr><td>Informative image</td><td>&#x3C;img alt="Birth chart wheel showing Sun in Aries" /></td></tr><tr><td>Chart container</td><td>aria-label="Interactive birth chart" role="img" on the wrapper div</td></tr><tr><td>Loading state</td><td>aria-busy="true" aria-label="Loading your chart..."</td></tr></table>

<table><tr><td>SKILL 9 — ANIMATION &#x26; MOTION</td></tr></table>

# 9.1 Film Scroll Animation

<table><tr><td>DETECT<br />Film strip scroll animation that jitters, stutters, causes paint thrashing, or blocks user interaction on mobile.</td></tr></table>

**FIX — GPU-accelerated CSS-only film scroll:**

```css
.film-scroll { will-change: transform; animation: filmScroll 30s linear infinite; }
@keyframes filmScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
/* Accessibility: respect reduced motion preference */
@media (prefers-reduced-motion: reduce) { .film-scroll { animation: none; } }
```

## 9.2 Photo Sway Animation

## Page 39

<table><tr><td>DETECT<br />Photo sway animation that rotates too far, moves too quickly, or causes the containing layout to shift as the element sways.</td></tr></table>

**FIX — Constrained sway with bottom pivot:**

```css
.photo-sway { animation: sway 4s ease-in-out infinite alternate; transform-origin: center bottom; } @keyframes sway { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
```

<table><tr><td>📐 Sway Rules<br />Rotation must never exceed<br />±3 degrees<br />. Animation duration must be<br />4–6 seconds<br />. Always set<br />transform-origin: center bottom<br />so the sway pivots from a natural hanging point.</td></tr></table>

## 9.3 Star/Sky Background

<table><tr><td>DETECT<br />Star background implemented as a canvas-based particle system running on the main thread, causing GPU overdraw and frame drops during scroll or interaction.</td></tr></table>

## Page 40

# **FIX — Implementation decision tree:**

<table><tr><td>Star Type</td><td>Correct Implementation</td></tr><tr><td>Static stars (decorative background)</td><td>CSS background-image with a pre-generated PNG or compressed SVG. Zero runtime cost.</td></tr><tr><td>Interactive / animated stars</td><td>Calculate star positions in a Web Worker to keep the main thread free. Never run a particle loop on the main thread.</td></tr></table>

<table><tr><td>SKILL 10 — SEO IMPLEMENTATION</td></tr></table>

## 10.1 OG Image Implementation

**Steps to implement the missing OG image (execute in order):**

10. Create a **1200×630px** branded image: dark cosmic background (<u>#07080F</u>), Zodaci logo centered, tagline *"Your Chart. Your Story."* in amber serif font. Save as <mark><u>/public/og-image.jpg</u></mark> — target file size under 200KB.

11. Add the following tags to `<u>index.html</u>`:

<mark>
<meta property="og:image" content="https://zodaci.com/og-image.jpg"> <meta property="og:image:width" content="1200"> <meta property="og:image:height" content="630"> <meta property="og:url" content="https://zodaci.com"> <meta name="twitter:image" content="https://zodaci.com/og-image.jpg"> <meta name="twitter:card" content="summary_large_image">
</mark>

---

## 10.2 Canonical Tags Per Route

**Setup steps:**

12. Install: `<u>bun add react-helmet-async</u>`

13. Wrap `<u>App.tsx</u>` in: <mark><u><HelmetProvider>...</HelmetProvider></u></mark>

14. Add to every page component: <mark><u><Helmet><link rel="canonical"</u> <u>href={`https://zodaci.com${location.pathname}`} /></Helmet></u></mark>

## Page 41

# 10.3 Sitemap

Generate a <u>sitemap.xml</u> containing all public, indexable routes.

<table><tr><td>Include in Sitemap</td><td>Exclude from Sitemap</td></tr><tr><td>/, /about, /pricing, /books, /blog, /sources, /masterbook (public sections), /guides, /chart-guide, /topics (public), /community (public), /academy (public sections)</td><td>/admin, /dashboard, /my-*, /orders, /checkout, /auth, /reset-password, /verify</td></tr></table>

<table><tr><td>APPENDIX — Quick Reference Build Completion Checklist</td></tr></table>

Use this checklist before marking any Lovable build task as complete. Every item must be confirmed — not assumed.

<table><tr><td>🎨 Design Checks<br />•  No hardcoded hex colors outside tailwind.config.ts tokens<br />•  All cards use glassmorphism pattern (bg-white/5 backdrop-blur-md border-white/10)<br />•  All buttons have loading states and active:scale-95<br />•  All forms use label + helper text + error message pattern<br />•  Mobile layout verified at 375px viewport width</td></tr></table>

## Page 42

<table><tr><td>🖱️ UX Checks<br />•  All async actions show a loading state<br />•  All empty states have a message and a CTA<br />•  All errors show a user-friendly toast or inline message<br />•  No raw error strings or stack traces shown to user<br />•  Scroll to top fires on route change</td></tr></table>

<table><tr><td>✍️ Copy Checks<br />•  No generic CTA copy ("Sign Up", "Buy Now", "Learn More", "Submit")<br />•  All error messages follow the [what happened] — [action] pattern<br />•  All page titles include the " · Zodaci" suffix<br />•  No passive voice in hero copy<br />•  All prices include a format label</td></tr></table>

<table><tr><td>🐛 Bug Prevention Checks<br />•  Controlled inputs use local useState initialized ONCE from server (empty dep array)<br />•  Every mutation invalidates its relevant React Query cache keys<br />•  OAuth saves the redirect destination to localStorage before triggering<br />•  Checkout unlock confirmed via server polling — not URL redirect alone<br />•  Global ErrorBoundary wraps all Suspense routes in App.tsx</td></tr></table>

## Page 43

<table><tr><td>♿ Accessibility Checks<br />•  All icon-only buttons have aria-label<br />•  All images have descriptive alt text, or alt="" if purely decorative<br />•  Focus rings are visible on all interactive elements<br />•  prefers-reduced-motion is respected for all animations</td></tr></table>

<table><tr><td>⚡ Performance Checks<br />•  No console.log() in production code paths<br />•  All images use loading="lazy" with defined width and height<br />•  Heavy components (chart wheel, reading panel, book preview) wrapped in React.memo<br />•  No any types in src/lib/<br />•  All new routes are lazy-loaded via React.lazy()</td></tr></table>

---

# **Zodaci Lovable Skills — Version 1.0**

Platform: zodaci.com · Stack: React + TypeScript + Vite + Supabase + Tailwind CSS + shadcn/ui

Prepared: Tuesday, 20 October 2026, 16:50 EDT · Galloway, OH, United States

Prepared for: Ashton · Classification: Internal Working Reference — Lovable AI Agent Instructions

This document is a living reference. All rules supersede Lovable defaults where they conflict.


### Extracted images (43):
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_1.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_10.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_11.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_12.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_13.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_14.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_15.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_16.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_17.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_18.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_19.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_2.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_20.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_21.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_22.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_23.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_24.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_25.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_26.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_27.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_28.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_29.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_3.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_30.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_31.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_32.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_33.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_34.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_35.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_36.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_37.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_38.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_39.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_4.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_40.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_41.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_42.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_43.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_5.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_6.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_7.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_8.jpg`
- `parsed-documents://20261020-213923-943003/Zodaci_Lovable_Skills_-_Design_UX_Copy_Bugs_Build_Quality.docx/images/page_9.jpg`