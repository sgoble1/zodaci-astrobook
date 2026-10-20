# Document parsed from: Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx

## Page 1

ZODACI PLATFORM · LOVABLE AI AGENT REFERENCE · DOCUMENT 2 OF 2

# Zodaci Lovable Skills — Vol. 2

*Chart Accuracy · Calculations · Edge Functions · Cascading Fixes · Marketing & Growth*

<table><tr><td>Version</td><td>1.0 — Initial Release</td></tr><tr><td>Date</td><td>October 20, 2026</td></tr><tr><td>Platform</td><td>zodaci.com</td></tr><tr><td>Stack</td><td>React + TypeScript + astronomy-engine + Supabase Edge Functions + Stripe</td></tr><tr><td>Prepared by</td><td>Ashton — Zodaci Platform Lead, Galloway, OH</td></tr><tr><td>Audience</td><td>Lovable AI Agent — working reference, all instructions are binding</td></tr><tr><td>Status</td><td>ACTIVE — Living Reference Document</td></tr></table>

## Preface — How to Use This Document

This document governs three major capability domains for the Lovable agent working on Zodaci. Every instruction herein is specific, actionable, and binding. When a rule conflicts with a simpler shortcut, follow the rule. When a rule is silent on an edge case, apply the closest analogous rule and document your reasoning in a code comment.

<table><tr><td>📋 THREE ACTIVE DOMAINS<br />Domain</td></tr></table>

## Page 2

<table><tr><td>Name<br />Scope<br />A<br />Astrological Accuracy<br />All natal, transit, return, and progressed chart calculations for Shane, April, and every user-generated chart. Verification is mandatory against Astrodienst and AstroSeek before any code change ships.<br />B<br />Edge Function Integrity<br />Every Supabase Edge Function must satisfy the audit checklist in Section B.1. All downstream consumers of a modified function must be automatically checked for breakage.<br />C / D<br />Marketing &#x26; Growth<br />All copy, conversion flows, email sequences, SEO content, referral mechanics, and growth loop implementations follow the standards in Section D.</td></tr></table>

<table><tr><td>⚠ CASCADING FIX RULE — APPLIES TO ALL DOMAINS<br />Whenever any calculation, schema, function, routing table, price map, or content value is changed, the agent MUST immediately run the full cascade check defined in Section C before marking the task complete. No change is isolated. Every change has downstream effects. Failure to run the cascade check is a deploy-blocking defect.</td></tr></table>

## Page 3

# **Table of Contents**

## **Section A — Astrological Calculation Accuracy**

A.1 — <u>Calculation Engine: astronomy-engine</u>

A.2 — <u>Shane's Chart Reference Data & Verification Protocol</u>

A.3 — <u>April's Chart Reference Data & Verification Protocol</u>

A.4 — <u>House Cusp Calculation Verification (Placidus)</u>

A.5 — <u>Aspect Calculation Rules</u>

A.6 — <u>Retrograde Detection</u>

A.7 — <u>Transit Calculation Rules</u>

A.8 — <u>Solar Return & Progressed Chart Rules</u>

## **Section B — Edge Function Integrity**

B.1 — <u>Edge Function Audit Checklist</u>

B.2 — <u>_shared/cors.ts Standard</u>

B.3 — <u>payments-webhook Integrity Rules</u>

B.4 — <u>create-checkout Server-Side Price Validation</u>

B.5 — <u>ask-sources Function Rules</u>

B.6 — <u>private-edition Manifest Freeze Protocol</u>

B.7 — <u>make-podcast Timeout & Cleanup</u>

B.8 — <u>topic-readings Job Integrity</u>

## **Section C — Cascading Fix Protocol**

C.1 — <u>The Cascade Rule</u>

C.2 — <u>Cascade Check Matrix</u>

C.3 — <u>Cascade Verification Script</u>

## **Section D — Marketing & Growth Skills**

D.1 — <u>Conversion Flow Architecture (4 Stages)</u>

D.2 — <u>Homepage Hero Copy & Structure</u>

## Page 4

D.3 — Pricing Page Optimization

D.4 — Email Marketing Skill

D.5 — SEO Content Strategy

D.6 — Referral Program Implementation

D.7 — Social Sharing

D.8 — Community Growth

D.9 — Analytics & Growth Metrics

**Section E — Quality Assurance Protocols**

E.1 — Pre-Deploy Checklist

E.2 — Chart Accuracy Regression Test

E.3 — Edge Function Integration Test

**Appendix — Calculation Reference Tables**

Zodiac Sign Longitude Ranges · Planet Glyphs & Keys · Kua Number Formula · Flying Stars Formula

<table><tr><td>DOMAIN A — ASTROLOGICAL ACCURACY</td></tr></table>

## Section A — Astrological Calculation Accuracy

All planetary and angular position calculations displayed anywhere on zodaci.com must be computed via <mark>astronomy-engine</mark> and verified against authoritative ephemeris sources before deployment. This section defines the exact standards, verification workflows, and tolerances for every chart type the platform supports.

### A.1 — Calculation Engine: **astronomy-engine**

Zodaci uses the **astronomy-engine** npm package (v2.1.19) for all planetary position calculations. This library implements the VSOP87 planetary theory and is accurate to within 1 arcsecond for modern

## Page 5

dates. No other calculation library may be used as the primary engine without a documented migration plan reviewed by Ashton.

<table><tr><td>🚫 NEVER USE THE FOLLOWING<br />•  Simplified sun-sign-only calculations<br />•  Hardcoded planet degree tables<br />•  Date-only calculations — birth time is required for accurate house cusps<br />•  UTC conversion without proper timezone offset — always use the birth city's historical UTC offset at the birth date, not the current offset<br />•  Any manual epoch adjustments on top of astronomy-engine output (the library uses J2000 internally)</td></tr></table>

<table><tr><td>✅ ALWAYS USE THIS PATTERN<br />import * as Astronomy from 'astronomy-engine';
// Correct pattern for a geocentric ecliptic body position:
const date = new Date(birthDateTimeUTC);
const body = Astronomy.GeoVector(Astronomy.Body.Mars, date, true); // aberration=true
const ecliptic = Astronomy.Ecliptic(body);
const longitude = ecliptic.elon; // 0–360 degrees (ecliptic longitude)
const latitude = ecliptic.elat;  // ecliptic latitude (positive = north of ecliptic)</td></tr></table>

Key parameter notes:

- <mark><u>aberration = true</u></mark> — always enable aberration correction for apparent positions
- <mark>All <u>GeoVector</u></mark> calls use **geocentric** coordinates — never heliocentric for natal chart work
- <mark>The <u>date</u></mark> parameter must always be a JavaScript <u>Date</u> object in **UTC** — convert before calling

## Page 6

- For the Ascendant and Midheaven (MC), use <mark>Astronomy.HorizontalFromVector</mark> combined with RAMC calculation — these require geographic lat/lon

## A.2 — **Shane's Chart Reference Data & Verification Protocol**

<

<table><tr><td>📌 DATA SOURCE RULE<br />Shane's birth data lives in src/lib/myBirth.ts. Never hardcode birth date, time, or location values anywhere else in the codebase. Always import from the canonical source. Any file that duplicates these values creates a synchronization failure point.</td></tr></table>

>

Every time `<u>src/lib/astro.ts</u>` or any calculation dependency is modified, the following 15-point verification must be run against two authoritative sources: **Astro.com (Astrodienst)** and **AstroSeek.com**. Both must agree with the computed values within tolerance.

## **Shane's Chart — 15-Point Verification Checklist**

<

<table><tr><td>#</td><td>Point</td><td>Tolerance</td><td>Special Notes</td></tr><tr><td>1</td><td>Sun — sign &#x26; degree</td><td>±1°</td><td>Least sensitive to time errors</td></tr><tr><td>2</td><td>Moon — sign &#x26; degree</td><td>±1°</td><td>Highly sensitive to birth time (moves ~0.5°/hour)</td></tr><tr><td>3</td><td>Ascendant — sign &#x26; degree</td><td>±1°</td><td>Changes ~1° per 4 minutes — most time-sensitive point</td></tr><tr><td>4</td><td>Midheaven (MC) — sign &#x26; degree</td><td>±1°</td><td>Sensitive to time and geographic location</td></tr><tr><td>5</td><td>Mercury — sign &#x26; degree</td><td>±1°</td><td>Check retrograde status</td></tr><tr><td>6</td><td>Venus — sign &#x26; degree</td><td>±1°</td><td>Check retrograde status</td></tr><tr><td>7</td><td>Mars — sign &#x26; degree</td><td>±1°</td><td>Check retrograde status</td></tr><tr><td>8</td><td>Jupiter — sign &#x26; degree</td><td>±1°</td><td>Slow-moving; rarely off by more than 0.1°</td></tr><tr><td>9</td><td>Saturn — sign &#x26; degree</td><td>±1°</td><td>Check retrograde status</td></tr></table>

>

## Page 7

<table><tr><td>#</td><td>Point</td><td>Tolerance</td><td>Special Notes</td></tr><tr><td>10</td><td>Uranus — sign &#x26; degree</td><td>±1°</td><td>Very slow — rarely off unless epoch error</td></tr><tr><td>11</td><td>Neptune — sign &#x26; degree</td><td>±1°</td><td>Very slow — rarely off unless epoch error</td></tr><tr><td>12</td><td>Pluto — sign &#x26; degree</td><td>±1°</td><td>Very slow; verify via Astrodienst extended chart</td></tr><tr><td>13</td><td>Chiron — sign &#x26; degree</td><td>±1°</td><td>Not native to astronomy-engine — requires custom asteroid ephemeris (see note below)</td></tr><tr><td>14</td><td>North Node — sign &#x26; degree</td><td>±1°</td><td>Zodaci uses Mean Node, not True Node — confirm system matches</td></tr><tr><td>15</td><td>All 12 house cusps</td><td>±0.5°</td><td>Placidus system required — verify system in astro.ts matches reference</td></tr></table>

# **If Any Position Is Off By More Than Tolerance:**

1. **Check UTC conversion** — was the local birth time correctly converted using the historical timezone at the birth location? (Not the current DST offset — the offset at the birth date.)

2. **Check house system** — confirm Placidus is in use, not Equal House, Koch, or Whole Sign.

3. **Check epoch handling** — astronomy-engine uses J2000 internally; confirm no manual epoch adjustment is layered on top.

4. **Check Chiron ephemeris** — astronomy-engine does not include Chiron natively. Verify the custom asteroid ephemeris file is present, loaded correctly, and covers the birth date range.

5. **Check Mean vs. True Node** — if North Node is off, confirm the calculation uses Mean Node (not True Node). Both are valid astrologically but they differ by up to 1.5°.

## A.3 — April's Chart Reference Data & Verification Protocol

## Page 8

<mark>

<table><tr><td>📌 DATA SOURCE RULE<br />April's birth data lives in its dedicated canonical data source within src/lib/. Never hardcode April's birth values anywhere else. Always import from the canonical source file.</td></tr></table>

</mark>

Apply the same 15-point verification protocol as Shane's chart (Section A.2). April's chart has additional verification points due to the expanded asteroid and Arabic Part inclusions in the April Edition:

<table><tr><td>#</td><td>Additional Verification Point</td><td>Tolerance</td><td>Notes</td></tr><tr><td>16</td><td>Juno — sign &#x26; degree</td><td>±1°</td><td>Requires asteroid ephemeris (MPC data or Swiss Ephemeris asteroid files)</td></tr><tr><td>17</td><td>Vesta — sign &#x26; degree</td><td>±1°</td><td>Requires asteroid ephemeris</td></tr><tr><td>18</td><td>Pallas — sign &#x26; degree</td><td>±1°</td><td>Requires asteroid ephemeris</td></tr><tr><td>19</td><td>Ceres — sign &#x26; degree</td><td>±1°</td><td>Requires asteroid ephemeris</td></tr><tr><td>20</td><td>Part of Fortune — degree &#x26; sign</td><td>±1°</td><td>See formula below — verify Day vs. Night chart detection</td></tr></table>

## **Part of Fortune Calculation**

<table><tr><td>📐 PART OF FORTUNE FORMULA<br />Day Chart (Sun above horizon — Sun in houses 7–12):<br />PoF = (ASC + Moon − Sun) mod 360<br />Night Chart (Sun below horizon — Sun in houses 1–6):<br />PoF = (ASC + Sun − Moon) mod 360</td></tr></table>

## Page 9

<table><tr><td>Day/Night detection rule: A Day Chart has the Sun in houses 7 through 12 (above the horizon). A Night Chart has the Sun in houses 1 through 6 (below the horizon). This detection must use the actual house position of the natal Sun — not a simplified "Sun above horizon" azimuth check. Verify that the detection logic correctly identifies April's chart type and applies the matching formula.</td></tr></table>

# **A.4 — House Cusp Calculation Verification (Placidus)**

Zodaci uses the Placidus house system for all natal and derived chart house cusps. Placidus requires three inputs that must all be sourced correctly:

- **Geographic latitude and longitude** — use the birth city's geographic coordinates (not magnetic, not city center approximations — use the specific coordinates stored in the birth data canonical source)

- **Birth time in UTC** — converted from local birth time using the historical timezone offset at the birth date

- **Obliquity of the ecliptic** — must be computed by astronomy-engine for the birth date; never use the fixed value 23.437° (it changes slowly over centuries)

## **Common Placidus Errors — Check Each One After Any Calculation Change**

<table><tr><td>Error Type</td><td>Description</td><td>How to Detect</td><td>Fix</td></tr><tr><td>Intercepted signs ignored</td><td>In Placidus, some houses span more than one sign; some signs appear in two houses simultaneously</td><td>Compare chart wheel rendering against Astrodienst — intercepted signs should appear inside the house with no cusp marker</td><td>Ensure rendering logic handles signs that have no cusp of their own; display them as intercepted in the chart wheel UI</td></tr><tr><td>Polar latitude breakdown</td><td>Placidus cannot be computed for latitudes above ~65°N or below ~65°S</td><td>Test with a birth location at latitude 66°N or higher — system should not crash or return invalid cusps</td><td>Implement a fallback to Equal House (or Whole Sign) for extreme latitudes, with a visible UI notice: "Placidus is unavailable at this latitude. Equal House system applied."</td></tr><tr><td>Southern hemisphere mirroring</td><td>Common bug: house order is reversed for </td><td>Test with a birth location in Sydney or Buenos </td><td>House numbering is NOT mirrored; Ascendant is </td></tr></table>

## Page 10

<table><tr><td>Error Type</td><td>Description</td><td>How to Detect</td><td>Fix</td></tr><tr><td></td><td>southern hemisphere births</td><td>Aires — Ascendant should still be on the left (east) of the chart wheel, not right</td><td>always House 1 regardless of hemisphere</td></tr><tr><td>House cusp tolerance exceeded</td><td>Any cusp off by more than 0.5° from Astrodienst output</td><td>Run Section E.2 regression test after each change</td><td>Re-check RAMC computation and obliquity value</td></tr></table>

# A.5 — Aspect Calculation Rules

The following aspects and orbs are the canonical standard for all natal, transit, synastry, and composite charts on Zodaci. Do not change orb values without a documented brand decision.

<table><tr><td>Aspect</td><td>Symbol</td><td>Angle</td><td>Orb — Planets</td><td>Orb — Lights (Sun/Moon)</td><td>Category</td></tr><tr><td>Conjunction</td><td>☌</td><td>0°</td><td>±8°</td><td>±10°</td><td>Major</td></tr><tr><td>Opposition</td><td>☍</td><td>180°</td><td>±8°</td><td>±10°</td><td>Major</td></tr><tr><td>Trine</td><td>△</td><td>120°</td><td>±8°</td><td>±10°</td><td>Major</td></tr><tr><td>Square</td><td>□</td><td>90°</td><td>±8°</td><td>±10°</td><td>Major</td></tr><tr><td>Sextile</td><td>⚹</td><td>60°</td><td>±6°</td><td>±8°</td><td>Major</td></tr><tr><td>Quincunx (Inconjunct)</td><td>⚻</td><td>150°</td><td>±3°</td><td>±3°</td><td>Minor</td></tr><tr><td>Semi-Sextile</td><td>∠</td><td>30°</td><td>±2°</td><td>±2°</td><td>Minor</td></tr><tr><td>Semi-Square</td><td>∠</td><td>45°</td><td>±2°</td><td>±2°</td><td>Minor</td></tr><tr><td>Sesquiquadrate</td><td>□</td><td>135°</td><td>±2°</td><td>±2°</td><td>Minor</td></tr></table>

## **Applying vs. Separating Aspects**

Every aspect must be classified as **applying** (planets moving toward exact) or **separating** (moving away from exact). This determination uses planetary velocity direction:

```
// Applying vs. separating detection function isAspectApplying(body1: Astronomy.Body, body2: Astronomy.Body, date: Date, aspectAngle: number): boolean {
  const dt = 24 * 3600 * 1000; // 24 hours in ms
  const lonNow1 = getEclipticLongitude(body1, date);
  const lonNow2 = getEclipticLongitude(body2, date);
  const lonNext1 = getEclipticLongitude(body1, new Date(date.getTime() + dt));
  const lonNext2 = getEclipticLongitude(body2, new Date(date.getTime() + dt));
  const diffNow = normalizeAngle(lonNow1 - lonNow2);
  const diffNext =

## Page 11

```javascript
normalizeAngle(lonNext1 - lonNext2);    const deltaToExactNow = Math.abs(diffNow - aspectAngle);    const deltaToExactNext = Math.abs(diffNext - aspectAngle);    return deltaToExactNext < deltaToExactNow; // closer
tomorrow = applying }
**Aspect Detection Function**

```javascript
function getAspect(lon1: number, lon2: number, aspectAngle: number, orb: number): number | null {    let diff = Math.abs(lon1 - lon2);    if (diff > 180) diff = 360 - diff;    const delta = Math.abs(diff - aspectAngle);    if (delta <= orb) return delta; // returns degrees from exact - 0 = exact aspect    return null;            // no aspect within orb }
function <u>normalizeAngle(angle: number): number {    return ((angle % 360) + 360) % 360;</u>
}
```

## A.6 — Retrograde Detection

A planet is retrograde when its apparent geocentric ecliptic longitude is decreasing over time (apparent motion reversal from Earth's perspective).

```javascript
<u>function isRetrograde(body: Astronomy.Body, date: Date): boolean {    const t1</u> = new Date(date.getTime() - 86400000); // 24 hours before    const t2 = new Date(date.getTime() + 86400000); // 24 hours after    const lon1 = getEclipticLongitude(body, t1);    const lon2 = getEclipticLongitude(body, <u>t2);    // Handle 0°/360° wraparound    let delta = lon2 - lon1;    if (delta ></u> <u>180) delta -= 360;    if (delta < -180) delta += 360;    return delta < 0; //</u> Negative delta = retrograde (decreasing longitude) }
```

<table><tr><td>⚠ HIGH-SEVERITY ACCURACY BUG<br />Displaying a retrograde badge on a direct planet, or a direct label on a retrograde planet, is a high-severity accuracy defect that must be fixed before any deployment. For every retrograde displayed in Shane's or April's chart, cross-check the retrograde period against: (1) Astro.com extended chart data, (2) Café Astrology retrograde calendar. Sun and Moon are never retrograde — if the code returns retrograde for either, there is a calculation bug.</td></tr></table>

## A.7 — Transit Calculation Rules

Transits are the current (or queried) date's planetary positions compared against natal chart positions.
Transit accuracy is as visible to users as natal accuracy — errors here are immediately noticeable.

## Transit Orb Rules

- Use the same orb table as natal aspects (Section A.5) for planet-to-planet transits

## Page 12

- Transits to the **Ascendant** and **MC**: tighter orb of ±2° (these angles are the most time-sensitive)
- Transit ingresses (planet entering a new sign): exact-degree events — display at 0° of new sign, no orb applies

## Triple Transit Rule (Retrograde)

<table><tr><td>📐 TRIPLE TRANSIT — REQUIRED IMPLEMENTATION<br />When a transiting planet is retrograde or will station retrograde before leaving an orb, it may aspect a natal point three times: (1) direct approach, (2) retrograde pass, (3) direct pass after stationing direct. All three passes must be computed and individually displayed in the transit timeline. A transit sequence that shows only one hit when three are occurring is an accuracy defect.</td></tr></table>

## **Transit Accuracy Verification — Run After Any astro.ts Change**

Compare today's planetary positions computed by `astro.ts` against:

6. Astro.com → "Current Planets" table (free, no login required)
7. AstroSeek → "Planets Today" page

If any position differs by more than 1°, the live transit calculation is broken. Fix immediately — do not deploy.

## **A.8 — Solar Return & Progressed Chart Rules**

### **Solar Return**

- Computed for the year when the transiting Sun returns to its exact natal longitude (±0.01° precision)
- **Location:** Use the person's *current* location at the time of the solar return — not the birth location. The UI must clearly state which location was used and allow the user to change it
- **Year start:** The solar return year begins at the exact moment of Sun's return — not January 1st

## Page 13

- Solar return house cusps and planet positions are calculated for that exact moment at the selected location

# **Secondary Progressions (Progressed Chart)**

<table><tr><td>📐 SECONDARY PROGRESSION METHOD: DAY-FOR-A-YEAR<br />•  1 day after birth = 1 year of life<br />•  Progressed date = birth date + age in days (where age in days = number of years of life)<br />•  Progressed Sun: ~0.9856°/day × age in years = progressed Sun longitude<br />•  Progressed Moon: fastest progressed body — advances ~13.5°/month (varies by orbital position)<br />•  Progressed Ascendant: advances approximately 1° per year but varies significantly by latitude — compute rigorously, do not approximate</td></tr></table>

Verify progressed Moon position for Shane and April against Astro.com's "Progressed Chart" output.
Tolerance: ±1°. If the progressed Moon is off, the most likely cause is an incorrect progressed date (verify the day-for-a-year count) or an incorrect birth time.

<table><tr><td>DOMAIN B — EDGE FUNCTION INTEGRITY</td></tr></table>

# **Section B — Edge Function Integrity**

<u>supabase/functions/</u> must satisfy all requirements in this section.
The audit checklist in B.1 must be run before and after any modification. All functions share the CORS standard in B.2 and the error-response wrapper pattern below.

## Page 14

# B.1 — Edge Function Audit Checklist

Run this full checklist for EVERY function before and after modification:



<table><tr><td>#</td><td>Check</td><td>Applies To</td><td>Pass Condition</td></tr><tr><td>1</td><td>CORS headers present</td><td>All functions</td><td>Every response includes the headers from _shared/cors.ts</td></tr><tr><td>2</td><td>OPTIONS preflight handled</td><td>All functions</td><td>req.method === 'OPTIONS' returns null body with CORS headers and status 200</td></tr><tr><td>3</td><td>Stripe webhook secret validation</td><td>payments-webhook only</td><td>stripe.webhooks.constructEventcalled before any processing</td></tr><tr><td>4</td><td>JWT verification</td><td>All user-facing functions</td><td>Authorization: Bearer [token]header verified via supabase.auth.getUser()</td></tr><tr><td>5</td><td>Input validation</td><td>All functions</td><td>All required parameters checked before any processing; returns 400 with descriptive error if missing</td></tr><tr><td>6</td><td>Error response shape</td><td>All functions</td><td>Every error path returns { error: string } JSON with appropriate HTTP status code</td></tr><tr><td>7</td><td>Token budget enforced</td><td>All AI-calling functions</td><td>max_tokens parameter set on every AI call — no unbounded generation</td></tr><tr><td>8</td><td>Timeout guard present</td><td>Functions calling external services</td><td>AbortSignal.timeout() or equivalent wraps all external calls (AI, Stripe, TTS)</td></tr><tr><td>9</td><td>Sandbox guard</td><td>Functions that trigger dispatch</td><td>Checks event.livemode before any real-world fulfillment action</td></tr><tr><td>10</td><td>Idempotency</td><td>payments-webhook, job functions</td><td>Event ID or job ID checked for prior processing before executing again</td></tr></table>

## Standard Function Wrapper Pattern

```javascript
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try { // 2. Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders });
    }
    // 3. Parse and validate input
    const body = await req.json();
    if (!body.requiredField) {
      return new Response(JSON.stringify({ error:

## Page 15

```html
'Missing requiredField' }), {                status: 400, headers: corsHeaders,
});   }  // 4. Business logic here  // 5. Return success  return
new Response(JSON.stringify({ success: true, data: result }), {  status:
200,      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});   } catch (err) {      console.error('[function-name]', err);  return
new Response(JSON.stringify({ error: 'Internal server error' }), {
status: 500, headers: corsHeaders,      });  } });
```

# B.2 — _shared/cors.ts Standard

This file is imported by **all functions**. It must exist at `supabase/functions/_shared/cors.ts`.

Never copy-paste CORS headers inline — always import from this file.

```typescript
// supabase/functions/_shared/cors.ts  const allowedOrigins = [
'https://zodaci.com',  'https://zodaci-astrobook.lovable.app', ]; export
function getCorsHeaders(req: Request): HeadersInit {  const origin =
req.headers.get('Origin') || '';  const corsOrigin =
allowedOrigins.includes(origin) ? origin : allowedOrigins[0];  return {
'Access-Control-Allow-Origin': corsOrigin,      'Access-Control-Allow-
Headers': 'authorization, x-client-info, apikey, content-type',      'Access-
Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',  }; } // Static
version (for functions that do not need dynamic origin matching) export const
corsHeaders = {  'Access-Control-Allow-Origin': 'https://zodaci.com',
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey,
content-type',  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT,
DELETE', };
```

<table><tr><td>📋 ORIGIN RULE<br />In production (ENVIRONMENT=production), only https://zodaci.com is allowed. In preview/development environments (Lovable preview URL), also allow https://zodaci-astrobook.lovable.app. The dynamic getCorsHeaders() export handles this automatically. Use getCorsHeaders(req) in new functions; the static corsHeaders export is retained for backward compatibility only.</td></tr></table>

# B.3 — payments-webhook Integrity Rules

<table><tr><td>🔒 HIGHEST SECURITY CRITICALITY — READ BEFORE MODIFYING<br />The payments-webhook function is the most security-critical function in the platform. Any modification that removes or weakens the Stripe signature check, disables the idempotency guard, </td></tr></table>

## Page 16

<table><tr><td>or bypasses the sandbox check is a critical security defect. Never modify this function without running all checks below and having the changes reviewed.</td></tr></table>

# **Rule 1 — Stripe Signature Verification (Must Be First Operation)**

```javascript
const body = await req.text(); // MUST be raw text - not req.json()
const sig = req.headers.get('stripe-signature');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
let event: Stripe.Event;
try {
  event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
} catch (err) {
  console.error('[payments-webhook] Signature verification failed:', err.message);
  return new Response('Invalid signature', { status: 400 }); // No CORS needed - Stripe doesn't care
}
```

# **Rule 2 — Required Event Handlers**

All five handlers below must be present. If any is missing, the function is incomplete:

<table><tr><td>Event Type</td><td>Required Action</td></tr><tr><td>checkout.session.completed</td><td>Create order record in DB, set status='paid', trigger fulfillment if event.livemode is true</td></tr><tr><td>charge.refunded</td><td>Set order status='refunded', revoke content entitlement for the affected order</td></tr><tr><td>payment_intent.payment_failed</td><td>Set order status='failed', trigger user notification (email or in-app)</td></tr><tr><td>customer.subscription.deleted</td><td>Revoke subscription access in user_profiles, set subscription_status='cancelled'</td></tr><tr><td>invoice.payment_succeeded</td><td>Extend subscription period in user_profiles, update subscription_expires_at</td></tr></table>

# **Rule 3 — Sandbox Guard (Must Appear Before Any Dispatch)**

```javascript
const isLiveMode = event.livemode;
if (!isLiveMode) {
  console.log('[payments-webhook] Sandbox event received - skipping fulfillment dispatch');
  return new Response(JSON.stringify({ received: true, dispatched: false }), { status: 200 });
} // Only real orders reach below this line
```

# **Rule 4 — Idempotency Guard (Must Appear Before Processing)**

```javascript
// Check for duplicate event
const existing = await supabase
  .from('webhook_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .single();
if (existing.data) {
  console.log('[payments-webhook] Duplicate event - skipping:', event.id);
  return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
} // Insert BEFORE processing to prevent race conditions on concurrent calls await

## Page 17

supabase.from('webhook_events').insert({ stripe_event_id: event.id,
event_type: event.type, processed_at: new Date().toISOString(), });

# B.4 — create-checkout Server-Side Price Validation

<table><tr><td>⚠ NEVER TRUST CLIENT-SUPPLIED PRICES<br />The frontend may supply a product key, but the server-side function must always look up the canonical price from PRICE_MAP. Any request that supplies a price amount directly must be rejected.</td></tr></table>

```typescript
const PRICE_MAP: Record<string, { amount: number; label: string }> = {
  'print-standard': { amount: 5900, label: 'Print Standard AstroBook' },  //
  $59.00  'print-expanded': { amount: 8900, label: 'Print Expanded AstroBook'
},  // $89.00  'digital-pdf': { amount: 1999, label: 'Digital PDF
AstroBook' },      // $19.99 'extra-shane': { amount: 699, label:
'Shane Edition Add-on' },      // $6.99 'extra-april': { amount: 699,
label: 'April Edition Add-on' },      // $6.99 };  // Validation - runs
before any Stripe API call const requestedItems = body.items as Array<{
productKey: string; quantity: number }>; if (!requestedItems?.length) {
return errorResponse('No items specified', 400); } for (const item of
requestedItems) {  if (!PRICE_MAP[item.productKey]) {    return
errorResponse(`Unknown product key: ${item.productKey}`, 400);  }  if (!
Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 3) {
return errorResponse('Quantity must be an integer between 1 and 3', 400);  }
}
```

<table><tr><td>📋 PRICE CONSISTENCY RULE<br />These prices must match exactly in: (1) PRICE_MAP in create-checkout, (2) the Pricing page UI, (3) the order confirmation page, and (4) any marketing copy that mentions prices. When prices change, update all four locations atomically and run the full cascade check (Section C.2, PRICE_MAP trigger).</td></tr></table>

# B.5 — ask-sources Function Rules

The ask-sources function combines BM25 keyword search with AI generation for cited answers. It is the primary AI-powered Q&A interface for the platform.

## **Token Budget — Hard Limit**

```typescript
const response = await openai.chat.completions.create({   model: 'gpt-4o-
mini',
      // Document model choice in AGENTS.md   messages:
```

## Page 18

buildMessages(query, chunks), max_tokens: 800, // Hard ceiling - NEVER exceed 1200 for ask-sources temperature: 0.3, // Low temperature = factual, consistent output });

## **BM25 Retrieval — Chunk Count Rule**

Before passing context to the AI, retrieve exactly **top 5 source chunks** via BM25. Do not retrieve fewer (misses context) or more (exceeds context window and wastes tokens).

## **Citation Format**

Every AI-generated sentence that references source material must include the source ID in the structured response so the frontend can render a citation link. The response shape must be:

```json
{ "answer": "string", "citations": [ { "sourceId": "string", "title": "string", "excerpt": "string", "url": "string" } ] }
```

## **Streaming Response Headers**

```javascript
return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }, });
```

## **B.6 — private-edition Manifest Freeze Protocol**

The manifest freeze prevents mid-checkout content changes from corrupting in-progress orders. Once a manifest is frozen, it is immutable. To update content, a new manifest version must be created.

```javascript
// FREEZE - called when checkout is initiated await
supabase.from('edition_manifests') .update({ frozen_at: new Date().toISOString(), frozen_by: userId, frozen_version: manifest.version, }) .eq('id', manifestId) .is('frozen_at', null); // Only freeze if not already frozen - prevents double-freeze // GUARD - before PDF generation, verify manifest is frozen const { data: manifest } = await supabase .from('edition_manifests') .select('*') .eq('id', manifestId) .single(); if (!manifest?.frozen_at) { return errorResponse('Manifest not frozen - PDF generation refused', 400); } // DATABASE ENFORCEMENT - add this trigger to migrations: // CREATE OR REPLACE FUNCTION prevent_frozen_manifest_update() // RETURNS TRIGGER AS $$ // BEGIN // IF OLD.frozen_at IS NOT NULL THEN //     RAISE EXCEPTION 'Cannot modify a frozen manifest (frozen_at: %)', OLD.frozen_at; //  END IF; //  RETURN NEW; // END; // $$ LANGUAGE plpgsql; // // CREATE TRIGGER enforce_manifest_immutability // BEFORE UPDATE ON edition_manifests // FOR EACH ROW EXECUTE FUNCTION prevent_frozen_manifest_update();
```

## **B.7 — make-podcast Timeout & Cleanup**

```javascript
const SCRIPT_MAX_CHARS = 5000; const FUNCTION_TIMEOUT_MS = 50000; // 50 seconds (Edge Functions hard limit ~60s) // Input validation - check before any expensive operation if (!script || typeof script !== 'string') { return errorResponse('script is required and must be a string', 400); } if (script.length > SCRIPT_MAX_CHARS) { return errorResponse('Script too
```

## Page 19

```
long (${script.length} chars). Maximum allowed: ${SCRIPT_MAX_CHARS}`, 400
); } // Timeout guard const controller = new AbortController(); const
timeoutId = setTimeout(() => controller.abort(), FUNCTION_TIMEOUT_MS); try {
const ttsResult = await generateTTS(script, { signal: controller.signal });
clearTimeout(timeoutId);  // Upload to Supabase Storage with 30-day TTL
metadata  const filePath = `podcasts/${userId}/${Date.now()}.mp3`;  await
supabase.storage.from('podcasts').upload(filePath, ttsResult.audio, {
contentType: 'audio/mpeg',  metadata: {  expires_at: new
Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),  user_id:
userId,  },  });  return new Response(JSON.stringify({ url: filePath,
duration: ttsResult.duration }), {  status: 200, headers: {
...corsHeaders, 'Content-Type': 'application/json' },  }); } catch (err) {
clearTimeout(timeoutId);  if (err.name === 'AbortError') {  return
errorResponse('TTS generation timed out - try a shorter script', 504);  }
throw err; // Re-throw unexpected errors to trigger the catch wrapper }
```

# **B.8 — topic-readings Job Integrity**

## **Duplicate Job Prevention — Atomic Claim**

```
// Atomic job claim using SELECT FOR UPDATE SKIP LOCKED (via RPC) const {
data: claimedJob, error: claimError } = await
supabase.rpc('claim_reading_job', {  p_user_id: userId,  p_topic_id:
topicId, });  // Return 202 if already being processed (not an error - tell
client to poll) if (!claimedJob) {  return new Response(
JSON.stringify({ status: 'already_processing', message: 'Reading is being
generated' }),  { status: 202, headers: corsHeaders }  ); }
```

## **Failure State Write-Back — Always Write to DB**

```
try {  const result = await generateReading(jobData);  await
supabase.from('topic_readings').update({  status: 'complete',  content:
result.text,  citations: result.citations,  completed_at: new
Date().toISOString(),  tokens_used: result.usage.total_tokens,
}).eq('id', jobId);  return new Response(JSON.stringify({ status:
'complete' }), {  status: 200, headers: corsHeaders,  }); } catch (err)
{  // Always write failure - never let a job hang in 'processing' state
await supabase.from('topic_readings').update({  status: 'failed',
error_message: err.message || 'Unknown generation error',  failed_at: new
Date().toISOString(),  }).eq('id', jobId);  // Return 200 so
Supabase/webhook orchestrator does NOT retry automatically  // The frontend
reads 'failed' status and shows a retry button to the user  return new
Response(JSON.stringify({ status: 'failed', error: err.message }), {
status: 200, headers: corsHeaders,  }); }
```

<table><tr><td>DOMAIN C — CASCADING FIX PROTOCOL</td></tr></table>

## Page 20

# Section C — Cascading Fix Protocol

## C.1 — The Cascade Rule

<mark>

<table><tr><td>⚠ MANDATORY — NO EXCEPTIONS<br />Whenever any of the following 10 trigger events occur, the agent MUST run the full cascade check (Section C.2) before marking any task complete. "I only changed one line" is not a valid reason to skip the cascade check. Every change has downstream effects.</td></tr></table>

</mark>

<table><tr><td>#</td><td>Trigger Event</td><td>Cascade Priority</td></tr><tr><td>1</td><td>Any change to src/lib/astro.ts (planet calculation logic)</td><td>Critical</td></tr><tr><td>2</td><td>Any change to src/lib/myBirth.ts or April's birth data source</td><td>Critical</td></tr><tr><td>3</td><td>Any change to a Supabase Edge Function</td><td>High</td></tr><tr><td>4</td><td>Any change to PRICE_MAP</td><td>High</td></tr><tr><td>5</td><td>Any database schema change (new column, rename, new table, dropped column)</td><td>High</td></tr><tr><td>6</td><td>Any change to AI model name or token budget in any function</td><td>Medium</td></tr><tr><td>7</td><td>Any change to Stripe product IDs</td><td>High</td></tr><tr><td>8</td><td>Any change to edition manifest or chapter list</td><td>High</td></tr><tr><td>9</td><td>Any change to routing table in App.tsx</td><td>Medium</td></tr><tr><td>10</td><td>Any change to platform_settings or public_site_settings()</td><td>Medium</td></tr></table>

## Page 21

# C.2 — Cascade Check Matrix

## **TRIGGER 1: astro.ts Changed**

**Check immediately:**

- ChartWheel component renders correctly with updated positions (visual test)
- Aspects page shows correct aspect list (compare against reference)
- Transits page shows correct current transit positions (compare against Astro.com)
- Solar Return and Progressed Chart values remain valid
- <mark>useChartData</mark> All pages consuming the <mark>useChartData</mark> hook — search codebase for <mark>useChartData</mark> and test each consumer
- Shane's 15-point verification (Section A.2)
- April's 20-point verification (Section A.3)

## **TRIGGER 2: Birth Data Changed (Shane or April)**

- All 15 natal positions (Section A.2/A.3)
- All aspect computations
- All house cusps
- All transit overlays using the affected natal chart
- Edition manifest for the affected person — chapter content that references their chart data
- <mark>content/volume2.ts</mark> Any hardcoded chart references in <mark>content/volume2.ts</mark> or other content files (search for hardcoded planet signs/degrees)
- PDF generation output for the affected edition (render a test PDF)

## **TRIGGER 3: Edge Function Modified**

- CORS headers — run B.1 audit checklist item 1
- JWT verification present — B.1 item 4
- Input validation covers all fields — B.1 item 5

## Page 22

- All error paths return correct HTTP status codes
- All frontend hooks (<u>useQuery</u> / <u>useMutation</u>) that call this function — search for the function name in <mark><u>src/</u></mark> and verify each consumer still receives the same response shape
- If response shape changed: update TypeScript types AND all consuming components

**TRIGGER 4: PRICE_MAP Changed**
- <mark><u>/pricing</u></mark> displays correct amounts
- <mark><u>create-checkout</u></mark> function uses the new prices
- <mark><u>admin-stripe-overview</u></mark> shows correct margins
- Checkout confirmation page displays correct amounts
- Any marketing copy that mentions prices (hero sections, email sequences, meta descriptions)
- <mark><u>launch-plan.md</u></mark> or equivalent planning docs — update price references

**TRIGGER 5: Database Schema Changed**
- All Supabase queries that <mark><u>SELECT</u></mark> from the affected table — search <mark>.from( '[tableName]' )</mark> across entire codebase
- All TypeScript interfaces and types that mirror the schema
- RLS policies on the affected table — verify they still work as intended
- Add a migration file to <mark><u>supabase/migrations/</u></mark> even for minor changes
- Admin views that display the table
- All edge functions that read from or write to the table

**TRIGGER 6: AI Model or Token Budget Changed**
- All functions that call AI: <mark>ask-sources</mark>, <mark>topic-readings</mark>, <mark>therapy-chat</mark>, <mark>social-counselor</mark>, <mark>workspace-audio</mark>, <mark>creator-studio</mark>, <mark>generate-page</mark>, <mark>make-podcast</mark>
- Run a test prompt through the changed function and verify response quality
- Update cost estimates in <mark><u>admin-stripe-overview</u></mark> if model pricing differs
- Update <mark><u>AGENTS.md</u></mark> to document the new model name and token budget

## Page 23

# **TRIGGER 7: Stripe Product IDs Changed**

- <mark><u>create-checkout</u></mark> price map
- <mark><u>customer-portal</u></mark> function
- <u>payments-webhook</u> event handlers
- <mark><u>admin-stripe-overview</u></mark> dashboard
- All checkout UI flows that reference product keys
- Existing <mark><u>orders</u></mark> table rows that reference old product keys — a data migration may be needed

# **TRIGGER 8: Edition Manifest or Chapter List Changed**

- Expanded edition must include all Standard chapters PLUS all Volume II chapters — verify this invariant
- Do NOT modify any manifest that has <mark>frozen_at</mark> set — create a new version instead
- PDF generation order — verify chapters render in the correct sequence
- Book preview pages — verify preview shows correct chapter list
- Masterbook contents page and <mark><u>/my-masterbook</u></mark> route

# **TRIGGER 9: App.tsx Routing Changed**

- Update <mark><u>sitemap.xml</u></mark> for any new or removed public routes
- Update all navigation menus that link to affected routes
- Search entire codebase for <mark><u><Link to="..."></u></mark> and plain string paths referencing changed routes
- Update <mark><u>AGENTS.md</u></mark> route documentation
- Update any deep links in marketing emails or blog posts
- Set SEO canonical tags on new public routes

# **TRIGGER 10: platform_settings or public_site_settings() Changed**

## Page 24

- Verify the <mark><u>public_site_settings()</u></mark> RPC allowlist includes all intended public keys and excludes all admin-only keys
- Test with an anonymous Supabase client — confirm only allowed keys are returned
- Test with an authenticated admin client — confirm admin keys are accessible
- All components reading from this table — search <mark>platform_settings</mark> in <mark><u>src/</u></mark>

## C.3 — **Cascade Verification Script**

After completing a cascade check, document findings in a structured comment at the top of the primary modified file:

```
/** * CASCADA CHECK - [YYYY-MM-DD] - [Developer/Agent] *
-----------------------------------------------
* Trigger: [Exact description of what changed] * Checked: [List of all systems/files verified] * Fixed: [Any secondary fixes applied as a result] * Remaining: [Any deferred items and the reason for deferral] * Verified: [Name of person or CI test that confirmed the fix] */
```

This comment is the audit trail for cascading changes. Do not omit it. If the change is in a function file that does not support multi-line comments, create a <mark><u>CHANGELOG.md</u></mark> entry in the function's directory.

---

<table><tr><td>DOMAIN D — MARKETING<br />&#x26;<br />GROWTH SKILLS</td></tr></table>

## Section D — **Marketing & Growth Skills**

### D.1 — **Conversion Flow Architecture (4 Stages)**

The Zodaci conversion funnel has four clearly defined stages. Any UI change must preserve all four stages. Adding friction in any stage must be justified and approved.

## Page 25

<table><tr><td>Stage</td><td>Name</td><td>Entry Points</td><td>Goal</td><td>Primary KPI</td><td>Target</td></tr><tr><td>1</td><td>Discovery</td><td>Google search, social shares, referral links, direct URL</td><td>Visitor understands the product and feels brand resonance</td><td>Time on page; scroll depth</td><td>>2 min; >70% scroll</td></tr><tr><td>2</td><td>Activation</td><td>"Begin With Your Chart" CTA → /auth → /onboarding → /birth-chart</td><td>Chart generated within 5 minutes of first landing</td><td>Onboarding completion rate</td><td>>60%</td></tr><tr><td>3</td><td>Engagement</td><td>/birth-chart → /my-readings → /topic/:id → /my-masterbook</td><td>User engages with ≥3 readings before leaving</td><td>Readings per session</td><td>>3 avg</td></tr><tr><td>4</td><td>Conversion</td><td>/pricing → create-checkout → Stripe → CheckoutReturn</td><td>User purchases Print Standard, Expanded, or Digital PDF</td><td>Checkout completion rate</td><td>>40% of pricing visits</td></tr></table>

# Stage 2 — Friction Points to Eliminate

- **Auth errors** — fix immediately; they block the entire funnel. Auth failure is always a P1 bug
- **Onboarding field validation errors** — use inline real-time validation (on blur or keystroke), never submit-time errors that clear the form
- **Birth time uncertainty** — add "I don't know my exact birth time" option that sets time to 12:00 PM and renders the chart with a visible disclaimer: "Chart generated with noon birth time. House cusps and Moon sign may be approximate."

# Stage 3 — Engagement Mechanics (Must Be Implemented)

- Personalized planet descriptions on <mark><u>/birth-chart</u></mark> — never generic zodiac content; always reference the user's specific placement
- "Your Moon in [Sign]" callouts that feel personal and specific to the user
- Progress indicators: "You've explored 4 of 12 houses"

## Page 26

- Suggested next topic after each reading completes — use the user's chart to suggest the most relevant adjacent topic

# D.2 — Homepage Hero Copy & Structure

The homepage (/) must follow this exact 6-section structure. Never deviate from this order or omit a section without a documented brand decision reviewed by Ashton.

<table><tr><td>Section</td><td>Name</td><td>Content Rules</td><td>CTA</td></tr><tr><td>1</td><td>Hero (above fold)</td><td>Headline: "Your chart is a map. We made it a book." — never change without brand review. Subheadline: brief, poetic, specific. Visual must load in &#x3C;2s.</td><td>"Begin With Your Chart" → /auth (single CTA, no navigation clutter)</td></tr><tr><td>2</td><td>Social Proof</td><td>Dynamic chart count from DB (or floor of 10,000+). 2–3 testimonials: one line each, first name + city only.</td><td>None — social proof section has no CTA</td></tr><tr><td>3</td><td>Product Overview</td><td>Three columns: "Your Chart" / "Your Readings" / "Your Book." Icon + headline + 2-sentence description per column.</td><td>Each column links to its feature page</td></tr><tr><td>4</td><td>Editions</td><td>Standard vs. Expanded visual cards (not a table on mobile). Price displayed clearly with format label.</td><td>"See Pricing" → /pricing</td></tr><tr><td>5</td><td>Sample Preview</td><td>2–3 real book page screenshots with chapter titles visible.</td><td>"See what's inside" → /books/:id/preview</td></tr><tr><td>6</td><td>Footer CTA</td><td>Headline: "Your story is already written. Read it." — repeat of brand positioning.</td><td>"Begin With Your Chart" → /auth (repeat of Stage 1 CTA)</td></tr></table>

# D.3 — Pricing Page Optimization

**Must-Have Elements (All Required — No Exceptions)**

## Page 27

- Price for each tier with format label: Print Standard $59 · Print Expanded $89 · Digital PDF $19.99

- Feature comparison list for each tier — what each one includes, in bullet format

- Shipping information (US domestic timelines, international availability) — visible **before** checkout, not after

- "What's in the Expanded edition?" — expandable/accordion section with full chapter list

- Sample pages from each edition (real screenshots)

- Satisfaction language — only if a written policy exists and has been confirmed by Ashton

- FAQ section — minimum 7 questions (see list below)

- Social proof — testimonials and number of books shipped

<table><tr><td>🚫 NEVER ON THE PRICING PAGE<br />•  A price without a format label (Print / Digital / Expanded)<br />•  A "starting at" claim without explaining what the starting tier includes<br />•  Shipping costs hidden until after checkout begins<br />•  Different prices than those in PRICE_MAP — pricing page and checkout must always match<br />•  Generic button text: "Submit," "Click Here," "Buy Now" without product context</td></tr></table>

## Required FAQ Questions

8. How long does shipping take?

9. Can I order for someone as a gift?

**10.** What's the difference between Standard and Expanded?

**11.** Is my birth data stored securely?

**12.** What if I don't know my exact birth time?

## Page 28

13. Can I get a refund?

14. Do you ship internationally?

# D.4 — **Email Marketing Skill**

## **Transactional Email Standards**

<table><tr><td>Trigger</td><td>Subject Line</td><td>Content Rules</td></tr><tr><td>First login / account created</td><td>"Your chart is ready."</td><td>Include birth chart Sun/Moon/Rising summary + first recommended reading link</td></tr><tr><td>Order confirmed</td><td>"Your AstroBook is on its way."</td><td>Order summary, format, shipping timeline, book preview link</td></tr><tr><td>Reading generated</td><td>"Your [topic] reading is ready."</td><td>First 2 sentences of the reading as teaser + deep link to full reading</td></tr><tr><td>Password reset</td><td>"Reset your Zodaci password"</td><td>Plain, functional — no marketing copy. Link expires in 1 hour.</td></tr><tr><td>Chart shared with user</td><td>"[Name] shared a chart with you on Zodaci"</td><td>Sharer's first name, brief description, direct link to the shared chart</td></tr></table>

## **Marketing Email Sequence (New User, No Purchase After 7 Days)**

<table><tr><td>Day</td><td>Type</td><td>Focus</td><td>CTA</td></tr><tr><td>Day 1</td><td>Welcome</td><td>Chart summary — Sun, Moon, Rising</td><td>Explore your readings</td></tr><tr><td>Day 3</td><td>Educational</td><td>"Did you find your Moon sign?" — soft education, no hard sell</td><td>Explore Moon readings</td></tr><tr><td>Day 7</td><td>Product Education</td><td>"Your AstroBook — what's inside" — show sample pages</td><td>See sample reader</td></tr><tr><td>Day 14</td><td>Conversion</td><td>"Your chart is waiting to be printed" — direct with pricing</td><td>View pricing → /pricing</td></tr><tr><td>Day 30</td><td>Re-engagement</td><td>"A lot can happen in a month. What's your current transit?"</td><td>Check my transits</td></tr></table>

## Page 29

# Email Design Rules — All Emails

- Dark background: <mark><u>#07080F</u></mark> — white text — match the brand palette
- Single column, max-width 600px
- Single CTA per email — no competing buttons
- Unsubscribe link required in every marketing email footer (CAN-SPAM / GDPR compliance)
- From name: **Zodaci** — never "noreply" or a raw email address as display name
- From email: <mark><u>hello@zodaci.com</u></mark> — must be DKIM-verified before any send
- Plain text version required alongside every HTML version
- Verify <mark>brand-news letter</mark> edge function is configured and sending from the correct domain

## D.5 — SEO Content Strategy

### **Blog Post Requirements (Every Post Must Include)**

- Minimum 1,000 words of original content
- H1 that includes the primary keyword (e.g., "What Your Moon Sign Means in Your Birth Chart")
- JSON-LD Article schema with: <mark>datePublished, dateModified, author, description</mark>
- Internal links to: <mark>/birth-chart</mark> (1 link), <mark>/pricing</mark> (1 link), <mark>/topics</mark> (1 link minimum)
- At least one link to another existing blog post (internal link graph)
- OG image: 1200×630px, branded, includes post title text
- Meta description: 150–160 characters, includes primary keyword
- Bottom CTA: "Discover your [topic] in your own chart — Begin with your birth data."

## Keyword Targets by Tier

<table><tr><td>Tier</td><td>Characteristics</td><td>Target Keywords</td></tr><tr><td>Tier 1</td><td>High volume, moderate competition — brand awareness</td><td>"birth chart calculator" · "what is my ascendant sign" · "moon sign meaning" · "astrology birth chart reading"</td></tr></table>

## Page 30

<table><tr><td>Tier</td><td>Characteristics</td><td>Target Keywords</td></tr><tr><td>Tier 2</td><td>Lower volume, lower competition, higher purchase intent</td><td>"personalized astrology book" · "printed birth chart book" · "astrobook custom" · "feng shui kua number calculator" · "chinese astrology chart reading"</td></tr><tr><td>Tier 3</td><td>Long-tail, highest conversion intent</td><td>"how to read my birth chart" · "what does my rising sign mean" · "astrology book gift personalized" · "birth chart interpretation service"</td></tr></table>

## **Content Calendar Rule**

<table><tr><td>📋 PUBLISHING CADENCE<br />Publish a minimum of 2 blog posts per month. Alternate between Tier 1 and Tier 2 keywords each post. Each post must link to at least one other existing blog post. Track publish dates in the content calendar and do not let two consecutive posts target the same keyword tier.</td></tr></table>

## **D.6 — Referral Program Implementation**

## **Referral Mechanics**

<table><tr><td>Mechanic</td><td>Implementation</td></tr><tr><td>Referral code</td><td>Unique code per user, stored in user_profiles.referral_code. Generated on account creation via DB trigger or application logic.</td></tr><tr><td>Referral link</td><td>https://zodaci.com?ref=[code]</td></tr><tr><td>Attribution</td><td>When a new user lands via referral link, capture ?ref= param and store in localStorage['zodaci_ref']</td></tr><tr><td>Signup</td><td>On account creation, read localStorage['zodaci_ref'] and write referring_user_id to the new user's profile</td></tr><tr><td>Reward trigger</td><td>When referred user completes first purchase (via payments-webhook), add $10 credit to referrer's user_profiles.credit_balance</td></tr></table>

## Page 31

<table><tr><td>Mechanic</td><td>Implementation</td></tr><tr><td>Reward limit</td><td>One reward per referred purchaser — not per click, not per signup, not per repeat purchase</td></tr></table>

# **Referral Dashboard (/referrals) — Required UI Elements**

- Unique referral link displayed with one-click copy button
- Referral count: total referred signups + total referred purchasers
- Pending credits (referred user signed up but hasn't purchased yet)
- Available credits (ready to apply at checkout)
- Share buttons: Copy Link · Email · Twitter/X · WhatsApp
- Visual progress indicator: "You're $X away from a free upgrade" (if credit threshold is defined)

# **Referral Implementation Checklist**

- ☐ `referral_code` generated on user creation (verify trigger exists in DB migrations)
- ☐ `<u>?ref=</u>` query param captured on landing page and stored in <mark>localStorage</mark>
- ☐ On signup, <mark>localStorage['zodaci_ref']</mark> read and <u>referring_user_id</u> written to new user profile
- ☐ On order webhook (<u>checkout.session.completed</u>), check <u>referring_user_id</u> and add credit to referrer
- ☐ <u>/referrals</u> page reads and displays correct credit balance
- ☐ Credit applied at checkout — reduce Stripe amount by credit balance, confirm with user before applying
- ☐ Credit application creates a <mark>credit_transactions</mark> record (for audit trail)

## **D.7 — Social Sharing**

Every reading, chart view, and public page must have a Share mechanism. Social sharing is the primary zero-cost growth driver for Zodaci.

# **Share Targets (Required on All Share Buttons)**

## Page 32

<table><tr><td>Target</td><td>Method</td><td>Prefilled Content</td></tr><tr><td>Twitter / X</td><td>Intent URL with text= param</td><td>Personalized text (see templates below)</td></tr><tr><td>Facebook</td><td>OG meta tag share (link-based)</td><td>OG image + title auto-populated</td></tr><tr><td>WhatsApp</td><td>WhatsApp share URL with text= param</td><td>Short personalized text + link</td></tr><tr><td>Copy Link</td><td>navigator.clipboard.writeText()</td><td>Direct URL with UTM source=share</td></tr></table>

## Share Text Templates

- **Birth chart share:** "I just discovered my chart on Zodaci — Sun in [sign], Moon in [sign], [ASC] rising. What's yours? 🌙✨ [link]"
- **Reading share:** "This reading about [topic] just described me perfectly. My [planet] in [sign] — [first sentence of reading]. Try it: [link]"
- **Book order share:** "My AstroBook just arrived and it's stunning 📖✨ [link to preview]"

## Dynamic OG Share Cards

<table><tr><td>📋 DYNAMIC OG IMAGE — HIGH-IMPACT GROWTH FEATURE<br />Use the generate-page edge function or a Satori-based server-side OG image generator to create personalized 1200×630px share images for each reading and chart view. The image should include the user's top planet placements (Sun, Moon, Rising) and the Zodaci brand mark. Personalized share images dramatically increase click-through rates on social platforms compared to generic OG images. This feature must be prioritized in the roadmap.</td></tr></table>

## D.8 — Community Growth (/community)

### Supported Content Types

- User chart shares (public natal chart views)
- Reading reactions (reaction emoji + optional comment)

## Page 33

- Book unboxing photos (image upload)
- Transit discussion threads (weekly auto-generated thread)

**Growth Mechanics (All Three Required)**

**15. "Chart of the Week"** — admin-curated featured post pinned at top of community feed each week

**16. Weekly Transit Thread** — auto-posted by a scheduled edge function every Monday at 9:00 AM ET; includes current week's major transits computed by <mark><u>astro.ts</u></mark>

**17. New User Welcome Post** — auto-generated for users who complete onboarding; introduces their Sun/Moon/Rising in the community feed

## Moderation Rules

- CommunityGuidelines page must be linked from the community join flow and from the community header
- Every post must have a Report button (one-click, with reason dropdown)
- Admin moderation panel must support: flag, hide, delete, warn, and ban (temp/perm)
- Community discussion pages must be set to <u>noindex</u> in robots meta tags — they are dynamic UGC, not keyword-optimized content

## D.9 — Analytics & Growth Metrics

### Events to Track (All Required)

<table><tr><td>Event Name</td><td>Trigger</td><td>Properties</td></tr><tr><td>page_view</td><td>Every route change</td><td>path, referrer, utm_source</td></tr><tr><td>cta_click</td><td>Any primary CTA button click</td><td>cta_label, page_path</td></tr><tr><td>onboarding_started</td><td>Birth data form opens</td><td>user_id</td></tr><tr><td>onboarding_completed</td><td>Birth data saved successfully</td><td>user_id, has_birth_time</td></tr><tr><td>chart_generated</td><td>First chart render completes</td><td>user_id, sun_sign, moon_sign, rising_sign</td></tr><tr><td>reading_started</td><td>User opens a topic reading</td><td>user_id, topic_id, planet, sign</td></tr></table>

## Page 34

<table><tr><td>Event Name</td><td>Trigger</td><td>Properties</td></tr><tr><td>reading_completed</td><td>User scrolls to end of reading or closes</td><td>user_id, topic_id, time_spent_seconds</td></tr><tr><td>pricing_page_viewed</td><td>User lands on /pricing</td><td>user_id, referrer</td></tr><tr><td>checkout_started</td><td>Checkout session created</td><td>user_id, product_key, amount</td></tr><tr><td>checkout_completed</td><td>Stripe webhook checkout.session.completed (server-side)</td><td>user_id, product_key, amount, order_id</td></tr><tr><td>referral_link_clicked</td><td>?ref= param detected on landing</td><td>referral_code</td></tr><tr><td>share_clicked</td><td>Share button tapped/clicked</td><td>target_platform, content_type, user_id</td></tr><tr><td>book_preview_viewed</td><td>Sample reader opened</td><td>user_id, edition_type, pages_viewed</td></tr></table>

# Admin Dashboard Required Displays

- Daily / weekly / monthly new signups (line chart)
- Onboarding completion rate — signups vs. charts generated (funnel %)
- Average readings per user (rolling 30-day)
- Pricing page → checkout started → completed (3-step funnel with drop-off %)
- Revenue by format: Standard / Expanded / Digital / Extras (bar chart)
- Top referrers by referral code (leaderboard table)
- Churn signal: users who generated a chart but never returned after Day 3 (cohort view)

<table><tr><td>DOMAIN E — QUALITY ASSURANCE PROTOCOLS</td></tr></table>

# Section E — Quality Assurance Protocols

## E.1 — Pre-Deploy Checklist

## Page 35

Every item below must be checked and confirmed before any code is deployed to production at zodaci.com. Do not deploy if any item fails — fix first.

## **Accuracy Checks**

- ☐ Shane's Sun, Moon, Ascendant verified against Astrodienst (Section A.2) — tolerance ±1°
- ☐ April's Sun, Moon, Ascendant verified against Astrodienst (Section A.3) — tolerance ±1°
- ☐ Today's planetary positions verified against Astro.com "Current Planets" — tolerance ±1°
- ☐ Retrograde badges correct for all currently retrograde planets (cross-check ephemeris)

## **Function Checks**

- ☐ payments-webhook: <mark><u>constructEvent</u></mark> validation present (Section B.3)
- ☐ create-checkout: server-side price validation present (Section B.4)
- ☐ All functions return CORS headers on every response path (Section B.2)
- ☐ Sandbox guard present in dispatch flow — no live orders from test events
- ☐ All functions return <mark><u>{ error: string }</u></mark> shape on error paths

## **Marketing Checks**

- ☐ All prices on /pricing match <mark>PRICE_MAP</mark> values exactly
- ☐ OG image present on all public pages — dimensions 1200×630
- ☐ All major CTAs use brand-approved copy (Section D.2)
- ☐ No generic button text: "Submit," "Click Here," "Sign Up" without context

## **Code Quality Checks**

- ☐ No hardcoded hex colors outside Tailwind token system
- ☐ No <mark><u>console.log</u></mark> in production code paths
- ☐ No <mark>any</mark> types in <mark><u>src/lib/</u></mark>
- ☐ All mutations invalidate relevant React Query cache keys after success
- ☐ TypeScript build passes without errors: <mark><u>bun run typecheck</u></mark>

## Page 36

# Routing Checks

- ☐ All new pages have a registered route in <u>App.tsx</u>
- ☐ All new routes have <u><Helmet></u> title and description tags
- ☐ <u>sitemap.xml</u> updated if public routes were added or removed

## E.2 — Chart Accuracy Regression Test

Run this test suite after ANY change to `<u>astro.ts</u>` or any calculation dependency. These tests must pass before chart-related code is deployed. Add to the CI pipeline.

```ts
// src/lib/astro.test.ts
import { describe, it, expect } from 'vitest';
import { computeNatalChart, computeCurrentPlanetPosition } from './astro';
import { SHANE_BIRTH_DATA, SHANE_REFERENCE } from './myBirth';
import { APRIL_BIRTH_DATA, APRIL_REFERENCE } from './aprilBirth';
import * as Astronomy from 'astronomy-engine';

describe('Shane Chart Regression', () => {
  const positions = computeNatalChart(SHANE_BIRTH_DATA);
  it('Sun within ±1° of reference', () => {
    expect(Math.abs(positions.sun.longitude - SHANE_REFERENCE.sun)).toBeLessThan(1.0);
  });
  it('Moon within ±1° of reference', () => {
    expect(Math.abs(positions.moon.longitude - SHANE_REFERENCE.moon)).toBeLessThan(1.0);
  });
  it('Ascendant within ±1° of reference', () => {
    expect(Math.abs(positions.ascendant - SHANE_REFERENCE.ascendant)).toBeLessThan(1.0);
  });
  it('Midheaven within ±1° of reference', () => {
    expect(Math.abs(positions.midheaven - SHANE_REFERENCE.midheaven)).toBeLessThan(1.0);
  });
  it('Mercury within ±1° of reference', () => {
    expect(Math.abs(positions.mercury.longitude - SHANE_REFERENCE.mercury)).toBeLessThan(1.0);
  });
  it('Venus within ±1° of reference', () => {
    expect(Math.abs(positions.venus.longitude - SHANE_REFERENCE.venus)).toBeLessThan(1.0);
  });
  it('Mars within ±1° of reference', () => {
    expect(Math.abs(positions.mars.longitude - SHANE_REFERENCE.mars)).toBeLessThan(1.0);
  });
  // ... repeat for Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron, North Node  // ... and all 12 house cusps at ±0.5° tolerance });
  describe('April Chart Regression', () => {
    const positions = computeNatalChart(APRIL_BIRTH_DATA);
    it('Sun within ±1° of reference', () => {
      expect(Math.abs(positions.sun.longitude - APRIL_REFERENCE.sun)).toBeLessThan(1.0);
    });
    // ... all 20 verification points from Section A.3 });
    describe('Transit Accuracy – Known Date', () => {
      it('Sun position within ±1° for known reference date', () => {
        const testDate = new Date('2026-10-20T17:00:00Z'); // Tuesday, October 20, 2026
        const sun = computeCurrentPlanetPosition(Astronomy.Body.Sun, testDate);
        // Expected: Sun in Libra ~27° at this date – update reference value from Astrodienst
        expect(sun.longitude).toBeGreaterThan(207); // Libra 27° = ~207°
        expect(sun.longitude).toBeLessThan(210);
      });
      it('Retrograde detection – correct for all current planets', () => {
        const testDate = new Date('2026-10-20T17:00:00Z'); // Verify retrograde status against known ephemeris for this date
        // Update expectedRetrogrades from Astro.com retrograde calendar
        // Example assertion – update with actual retrograde planets for this date: // const mars = isRetrograde(Astronomy.Body.Mars, testDate); //
        expect(mars).toBe(expectedRetrogrades.mars);
      });
    });
    describe('House System – Placidus', () => {
      it('House 1 cusp matches Ascendant within ±0.5°', () => {
        const positions = computeNatalChart(SHANE_BIRTH_DATA);
        expect(Math.abs(positions.houses[0] -

## Page 37

positions.ascendant)).toBeLessThan(0.5);  }));  it('House 10 cusp matches MC within ±0.5°', () => {    const positions =    <u>computeNatalChart(SHANE_BIRTH_DATA);    expect(Math.abs(positions.houses[9]</u> - positions.midheaven)).toBeLessThan(0.5);  }); });

# E.3 — Edge Function Integration Test

For each edge function, maintain a test file at <u>supabase/functions/[name]/test.ts</u>. Run locally with deno test <u>supabase/functions/[name]/test.ts</u>. Every function must have all four test cases below.

```typescript
// supabase/functions/[function-name]/test.ts  import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';  const BASE_URL = 'http://localhost:54321/functions/v1/[function-name]';  const VALID_TOKEN = Deno.env.get('TEST_USER_JWT') || '';  Deno.test(`[function-name] - valid request returns 200`, async () => {    const res = await fetch(BASE_URL, {      method: 'POST',      headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },      body: JSON.stringify({ /* valid test payload */ }),    });    assertEquals(res.status, 200);    const body = await res.json();    assertEquals(typeof body.data, 'object'); // Adjust to actual response shape  });  Deno.test(`[function-name] - missing auth returns 401`, async () => {    const res = await fetch(BASE_URL, {      method: 'POST',      headers: { 'Content-Type': 'application/json' },      body: JSON.stringify({ /* test payload */ }),    });    assertEquals(res.status, 401);    const body = await res.json();    assertEquals(typeof body.error, 'string');  });  Deno.test(`[function-name] - missing required field returns 400`, async () => {    const res = await fetch(BASE_URL, {      method: 'POST',      headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },      body: JSON.stringify({ /* incomplete payload */ }),    });    assertEquals(res.status, 400);    const body = await res.json();    assertEquals(typeof body.error, 'string');  });  Deno.test(`[function-name] - OPTIONS preflight returns 200 with CORS headers`, async () => {    const res = await fetch(BASE_URL, {      method: 'OPTIONS',      headers: { 'Origin': 'https://zodaci.com' },    });    assertEquals(res.status, 200);    assertEquals(res.headers.get('Access-Control-Allow-Origin') !== null, true);  });
```

## Appendix — Calculation Reference Tables

### A — Zodiac Sign Longitude Ranges

<table><tr><td>Sign</td><td>Symbol</td><td>Start°</td><td>End°</td><td>Element</td><td>Modality</td></tr><tr><td>Aries</td><td>♈</td><td>0°</td><td>30°</td><td>Fire</td><td>Cardinal</td></tr><tr><td>Taurus</td><td>♉</td><td>30°</td><td>60°</td><td>Earth</td><td>Fixed</td></tr></table>

## Page 38

<table><tr><td>Sign</td><td>Symbol</td><td>Start°</td><td>End°</td><td>Element</td><td>Modality</td></tr><tr><td>Gemini</td><td>♊</td><td>60°</td><td>90°</td><td>Air</td><td>Mutable</td></tr><tr><td>Cancer</td><td>♋</td><td>90°</td><td>120°</td><td>Water</td><td>Cardinal</td></tr><tr><td>Leo</td><td>♌</td><td>120°</td><td>150°</td><td>Fire</td><td>Fixed</td></tr><tr><td>Virgo</td><td>♍</td><td>150°</td><td>180°</td><td>Earth</td><td>Mutable</td></tr><tr><td>Libra</td><td>♎</td><td>180°</td><td>210°</td><td>Air</td><td>Cardinal</td></tr><tr><td>Scorpio</td><td>♏</td><td>210°</td><td>240°</td><td>Water</td><td>Fixed</td></tr><tr><td>Sagittarius</td><td>♐</td><td>240°</td><td>270°</td><td>Fire</td><td>Mutable</td></tr><tr><td>Capricorn</td><td>♑</td><td>270°</td><td>300°</td><td>Earth</td><td>Cardinal</td></tr><tr><td>Aquarius</td><td>♒</td><td>300°</td><td>330°</td><td>Air</td><td>Fixed</td></tr><tr><td>Pisces</td><td>♓</td><td>330°</td><td>360°</td><td>Water</td><td>Mutable</td></tr></table>

# **B — Planet Glyphs & astronomy-engine Body Keys**

<table><tr><td>Planet</td><td>Glyph</td><td>astronomy-engine Body Constant</td><td>Native to Library?</td></tr><tr><td>Sun</td><td>☉</td><td>Astronomy.Body.Sun</td><td>Yes</td></tr><tr><td>Moon</td><td>☽</td><td>Astronomy.Body.Moon</td><td>Yes</td></tr><tr><td>Mercury</td><td>☿</td><td>Astronomy.Body.Mercury</td><td>Yes</td></tr><tr><td>Venus</td><td>♀</td><td>Astronomy.Body.Venus</td><td>Yes</td></tr><tr><td>Mars</td><td>♂</td><td>Astronomy.Body.Mars</td><td>Yes</td></tr><tr><td>Jupiter</td><td>♃</td><td>Astronomy.Body.Jupiter</td><td>Yes</td></tr><tr><td>Saturn</td><td>♄</td><td>Astronomy.Body.Saturn</td><td>Yes</td></tr><tr><td>Uranus</td><td>♅</td><td>Astronomy.Body.Uranus</td><td>Yes</td></tr><tr><td>Neptune</td><td>♆</td><td>Astronomy.Body.Neptune</td><td>Yes</td></tr><tr><td>Pluto</td><td>♇</td><td>Astronomy.Body.Pluto</td><td>Yes</td></tr><tr><td>Chiron</td><td>⚷</td><td>Custom asteroid ephemeris (not native)</td><td>No — requires external ephemeris</td></tr><tr><td>North Node</td><td>☊</td><td>Computed from Moon orbital elements</td><td>Partial — use Mean Node formula</td></tr><tr><td>South Node</td><td>☋</td><td>North Node + 180° (mod 360)</td><td>Derived — not directly computed</td></tr></table>

## Page 39

# C — Kua Number Formula

<table><tr><td>Gender</td><td>Formula</td><td>Post-2000 Adjustment</td></tr><tr><td>Male (born pre-2000)</td><td>Kua = (10 − digit_sum(birth_year)) mod 9  ·  Use 9 if result is 0</td><td>N/A</td></tr><tr><td>Male (born 2000+)</td><td>Kua = (9 − digit_sum(birth_year)) mod 9  ·  Use 9 if result is 0</td><td>Subtract 1 from digit sum before applying formula</td></tr><tr><td>Female (born pre-2000)</td><td>Kua = (digit_sum(birth_year) + 5) mod 9  ·  Use 9 if result is 0</td><td>N/A</td></tr><tr><td>Female (born 2000+)</td><td>Kua = (digit_sum(birth_year) + 6) mod 9  ·  Use 9 if result is 0</td><td>Add 6 instead of 5 for post-2000 births</td></tr></table>

**digit_sum rule:** Reduce birth year to a 2-digit remainder by summing its digits repeatedly until a single or double digit under 10 remains. Example: 1987 → 1+9+8+7 = 25 → 2+5 = 7. Document in the UI which Feng Shui school's formula Zodaci uses, as minor variations exist between schools.

# D — Flying Stars Formula

<table><tr><td>Parameter</td><td>Rule</td></tr><tr><td>Annual center star</td><td>Cycle: 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1 → 9 → ... (descending each year)</td></tr><tr><td>Period reference</td><td>Period 9 began February 4, 2024. Star 9 = center for 2024. Star 8 = center for 2025. Star 7 = center for 2026.</td></tr><tr><td>Monthly star</td><td>Follows same 9→1 descending sequence, starting from the annual star's monthly sequence for that solar year</td></tr><tr><td>Verification source</td><td>Cross-check annual and monthly flying stars against the traditional Xuan Kong Flying Stars calendar for the current year before displaying</td></tr></table>

## Page 40

<mark>

<table><tr><td>⚠ FLYING STARS SOLAR YEAR NOTE<br />The Flying Stars calendar year begins at Li Chun (Start of Spring), typically around February 4 each year — not January 1. Verify the exact date for each year before computing annual star positions. Using January 1 as the year boundary is a calculation error.</td></tr></table>

</mark>

----

<table><tr><td>Zodaci Lovable Skills — Vol. 2
 Chart Accuracy · Calculations · Edge Functions · Cascading Fixes · Marketing &#x26; Growth
 Version 1.0  |  October 20, 2026  |  zodaci.com
 Prepared by Ashton, Galloway, OH</td><td>Living Document
 Update whenever: a verified reference value changes, a new calculation method is added, a marketing strategy is revised, or a new edge function is created.
 Always increment version number on update.</td></tr></table>


### Extracted images (40):
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_1.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_10.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_11.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_12.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_13.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_14.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_15.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_16.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_17.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_18.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_19.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_2.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_20.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_21.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_22.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_23.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_24.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_25.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_26.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_27.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_28.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_29.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_3.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_30.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_31.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_32.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_33.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_34.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_35.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_36.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_37.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_38.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_39.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_4.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_40.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_5.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_6.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_7.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_8.jpg`
- `parsed-documents://20261020-213930-064636/Zodaci_Lovable_Skills_-_Chart_Accuracy_Calculations_Edge_Functions_Marketing.docx/images/page_9.jpg`