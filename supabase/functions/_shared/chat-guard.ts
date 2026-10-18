// Server-owned chat history and paid-plan checks for counselor chats.
// The caller only supplies its newest message text; earlier turns (and their
// roles) are always reloaded from the database, so past replies can't be rewritten.
import type { UIMessage } from "npm:ai@7.0.127";

export async function hasFullAccess(admin: any, userId: string): Promise<boolean> {
  const [{ data: paid }, { data: isAdmin }, { data: shared }] = await Promise.all([
    admin.rpc("has_paid_plan", { _user_id: userId }),
    admin.rpc("has_role", { _user_id: userId, _role: "admin" }),
    admin.rpc("is_shared_space_user_id", { _user_id: userId }),
  ]);
  return !!(paid || isAdmin || shared);
}

/** Returns only the text of the caller's newest message, or null if it isn't a valid user turn. */
export function latestUserText(messages: unknown[]): { id: string; text: string } | null {
  const last = messages[messages.length - 1] as any;
  if (!last || last.role !== "user" || !Array.isArray(last.parts)) return null;
  const text = last.parts.filter((p: any) => p?.type === "text" && typeof p.text === "string").map((p: any) => p.text).join("\n").trim();
  if (!text || text.length > 8000) return null;
  return { id: typeof last.id === "string" ? last.id.slice(0, 100) : crypto.randomUUID(), text };
}

/** Loads the saved conversation with database roles only (user/assistant, text parts only). */
export async function savedHistory(sb: any, table: string, sessionId: string): Promise<UIMessage[]> {
  const { data } = await sb.from(table).select("ui_id,role,parts").eq("session_id", sessionId).order("created_at", { ascending: true }).limit(200);
  return (data ?? []).filter((m: any) => m.role === "user" || m.role === "assistant").map((m: any) => ({
    id: m.ui_id || crypto.randomUUID(),
    role: m.role,
    parts: (Array.isArray(m.parts) ? m.parts : []).filter((p: any) => p?.type === "text" && typeof p.text === "string").map((p: any) => ({ type: "text", text: p.text })),
  })).filter((m: UIMessage) => m.parts.length);
}
