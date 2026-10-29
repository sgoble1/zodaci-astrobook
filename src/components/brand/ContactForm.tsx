import { useState } from 'react';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

const TOPICS = [['general', 'General question'], ['support', 'Help with my account'], ['astrobook', 'AstroBook'], ['astrocomic', 'AstroComic'], ['shop', 'Shop order'], ['press', 'Press']] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(120, 'Keep your name under 120 characters.'),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  topic: z.enum(['general', 'support', 'astrobook', 'astrocomic', 'shop', 'press']),
  message: z.string().trim().min(10, 'Write at least 10 characters.').max(4000, 'Keep your message under 4,000 characters.'),
});
type Errors = Partial<Record<'name' | 'email' | 'message' | 'form', string>>;

/** Public contact form. Messages land in the admin-only inbox; no booking widgets. */
export function ContactForm() {
  const [v, setV] = useState({ name: '', email: '', topic: 'general', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  if (state === 'done') return <p role="status" className="vellum flex items-center gap-2 p-6 text-foreground"><Check className="text-gold" />Thank you — your message has reached us. We’ll reply to the email you gave.</p>;
  const field = (k: 'name' | 'email' | 'message') => ({ value: v[k], onChange: (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value }), 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `contact-${k}-error` : undefined, id: `contact-${k}` });
  const err = (k: keyof Errors) => errors[k] && <p id={`contact-${k}-error`} className="text-sm text-destructive">{errors[k]}</p>;
  return (
    <form noValidate className="vellum space-y-4 p-6" onSubmit={async e => {
      e.preventDefault();
      const parsed = contactSchema.safeParse(v);
      if (!parsed.success) { const out: Errors = {}; parsed.error.issues.forEach(i => { out[i.path[0] as 'name'] ??= i.message; }); setErrors(out); return; }
      setErrors({}); setState('busy');
      const { data: s } = await supabase.auth.getSession();
      const { error } = await supabase.from('contact_messages').insert({ name: parsed.data.name, email: parsed.data.email, topic: parsed.data.topic, message: parsed.data.message, sender_id: s.session?.user.id ?? null, source_path: window.location.pathname.slice(0, 200) });
      if (error) { setErrors({ form: 'Your message could not be sent. Check your connection and try again.' }); setState('idle'); return; }
      setState('done');
    }}>
      <h3 className="text-2xl">Write to us</h3>
      <div className="space-y-1"><label htmlFor="contact-name" className="text-sm">Name</label><Input maxLength={120} autoComplete="name" {...field('name')} />{err('name')}</div>
      <div className="space-y-1"><label htmlFor="contact-email" className="text-sm">Email</label><Input type="email" maxLength={254} autoComplete="email" {...field('email')} />{err('email')}</div>
      <div className="space-y-1"><label htmlFor="contact-topic" className="text-sm">About</label>
        <select id="contact-topic" value={v.topic} onChange={e => setV({ ...v, topic: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{TOPICS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div className="space-y-1"><label htmlFor="contact-message" className="text-sm">Message</label><Textarea rows={5} maxLength={4000} {...field('message')} />{err('message')}</div>
      {err('form')}
      <Button type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send message'}</Button>
    </form>
  );
}
