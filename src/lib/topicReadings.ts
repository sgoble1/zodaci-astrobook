import { supabase } from '@/integrations/supabase/client';

/** In-depth topic readings, written from each member's own chart (same themes as the original edition). */
export const TOPIC_READINGS: { slug: string; title: string }[] = [
  { slug: 'big-three', title: 'Your Big Three' }, { slug: 'chart-shape', title: 'Chart Shape & Balance' },
  { slug: 'purpose', title: 'Life Purpose & Mission' }, { slug: 'love', title: 'Love & Relationships' },
  { slug: 'career', title: 'Career & Calling' }, { slug: 'money', title: 'Money & Resources' },
  { slug: 'mind', title: 'Mind & Communication' }, { slug: 'health', title: 'Health & Wellness' },
  { slug: 'family-home', title: 'Family & Home' }, { slug: 'recurring-themes', title: 'Recurring Themes' },
  { slug: 'obstacles', title: 'Obstacles & Challenges' }, { slug: 'shadow-work', title: 'Shadow Work & Healing' },
  { slug: 'past-lives', title: 'Past Lives & Karma' }, { slug: 'spiritual-gifts', title: 'Spiritual Gifts & Intuition' },
  { slug: 'practices', title: 'Rituals, Tarot, Chakras & Affirmations' }, { slug: 'numerology', title: 'Numerology' },
  { slug: 'timing', title: 'Key Years & Turning Points' }, { slug: 'sex-attraction', title: 'Sex & Attraction' },
];
export type TopicRow = { id: string; page_key: string; title: string; content: string; status: string; updated_at: string };

export async function loadMyTopicReadings(): Promise<TopicRow[]> {
  const { data } = await supabase.from('generated_pages').select('id,page_key,title,content,status,updated_at').eq('section', 'Topic Reading');
  return (data ?? []) as TopicRow[];
}
export async function writeTopicReading(slug: string): Promise<void> {
  let res;
  try { res = await supabase.functions.invoke('topic-readings', { body: { slug } }); } catch { throw new Error('This reading could not be written right now.'); }
  const { data, error } = res;
  if (error || data?.error) {
    let message = data?.error as string | undefined;
    const ctx = (error as { context?: unknown } | null)?.context;
    if (!message && ctx instanceof Response) message = (await ctx.json().catch(() => null))?.error;
    if ((ctx as Response | undefined)?.status === 401) message = 'Please sign in again to keep writing your readings.';
    throw new Error(message || 'This reading could not be written right now.');
  }
}
