/** Resend email through the connector gateway. Sender comes from RESEND_FROM (must be on a domain verified in Resend). */
const GATEWAY = 'https://connector-gateway.lovable.dev/resend';
export const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export async function sendEmail(msg: { to: string; subject: string; html: string; replyTo?: string }): Promise<{ ok: boolean; status?: number; error?: string }> {
  const lk = Deno.env.get('LOVABLE_API_KEY'); const rk = Deno.env.get('RESEND_API_KEY');
  if (!lk || !rk) return { ok: false, error: 'email not configured' };
  const from = Deno.env.get('RESEND_FROM') || 'Zodaci <onboarding@resend.dev>';
  const res = await fetch(`${GATEWAY}/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lk}`, 'X-Connection-Api-Key': rk },
    body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, ...(msg.replyTo ? { reply_to: msg.replyTo } : {}) }),
  });
  if (!res.ok) { const t = await res.text(); console.error(`Resend failed [${res.status}]: ${t}`); return { ok: false, status: res.status, error: t }; }
  return { ok: true };
}

export const layout = (title: string, body: string) => `<div style="background:#ffffff;padding:24px;font-family:Arial,sans-serif;color:#1a1530"><div style="max-width:560px;margin:auto;border-top:4px solid #D4A853;padding-top:16px"><h1 style="font-family:Georgia,serif;font-weight:normal;color:#0D1028">${title}</h1>${body}<p style="color:#6b6385;font-size:12px;margin-top:32px">Zodaci · zodaci.com</p></div></div>`;
