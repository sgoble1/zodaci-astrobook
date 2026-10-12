// Builds the chart context a counselor speaks from: April's verified profile in the private
// edition, otherwise the signed-in member's own saved chart.
import { APRIL_CHART, APRIL_CONTEXT_RULES, APRIL_PSYCHOLOGY } from "./april-profile.ts";

// deno-lint-ignore no-explicit-any
export async function counselorContext(sb: any, admin: any, userId: string, email = ""): Promise<{ ok: true; context: string; name: string; privateEdition: boolean } | { ok: false; error: string }> {
  const { data: p } = await admin.from("profiles").select("display_name,birth_date,birth_time,place_label,house_system,sex,chart").eq("id", userId).maybeSingle();
  // April's approved account uses her verified profile; everyone else (Shane included) uses their own saved chart.
  if (email.toLowerCase() === "babybluepuppet@gmail.com") {
    return { ok: true, privateEdition: true, name: "April", context: `${APRIL_CHART}\n\n${APRIL_PSYCHOLOGY}\n\n${APRIL_CONTEXT_RULES}` };
  }
  if (!p?.birth_date || !p.chart) return { ok: false, error: "Save your birth details first so the counselor can work from your chart." };
  // deno-lint-ignore no-explicit-any
  const bodies = (p.chart.bodies ?? []).map((b: any) => `${b.name}: ${b.sign} ${b.deg}°${String(b.min).padStart(2, "0")}′${p.birth_time && b.house ? ` house ${b.house}` : ""}${b.retro ? " retrograde" : ""}`).join("\n");
  // deno-lint-ignore no-explicit-any
  const asp = (p.chart.aspects ?? []).slice(0, 25).map((a: any) => `${a.a} ${a.type} ${a.b} (orb ${Number(a.orb).toFixed(1)}°)`).join("\n");
  const name = p.display_name || "the member";
  return {
    ok: true, privateEdition: false, name,
    context: `The person you are speaking with: ${name}${p.sex ? ` (${p.sex}; use only for respectful wording, never to assume orientation)` : ""}. Born ${p.birth_date}${p.birth_time ? ` ${p.birth_time}` : " (birth time unknown: never mention houses, Ascendant or Midheaven)"}, ${p.place_label}. House system ${p.house_system}.
Calculated placements (the only chart facts you may use):
${bodies}
Major aspects:
${asp}
Rules: use only these placements; never invent placements, relatives, ancestry or life events; treat the chart as a reflective language, not proof or destiny.`,
  };
}
