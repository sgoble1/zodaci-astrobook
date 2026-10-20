// deno-lint-ignore-file no-explicit-any
const COST: Record<string, number> = { "book-cover-request": 3, "creator-chapter": 2, "creator-podcast": 5 };
export const creditCost = (feature: string) => COST[feature] ?? 1;

/** Returns an error message when the member's monthly credits can't cover this feature, else null. Mirrors credit_status() in the database. */
export async function creditShortfall(admin: any, userId: string, feature: string): Promise<string | null> {
  const { data, error } = await admin.rpc("credit_status", { _user_id: userId });
  if (error) { console.error("credit_status failed", error); return null; }
  const s = Array.isArray(data) ? data[0] : data;
  if (!s || s.unlimited) return null;
  if (s.used + creditCost(feature) > s.allowance) return `You've used this month's ${s.allowance} AI credits. They refresh on the 1st, or upgrade for more.`;
  return null;
}
