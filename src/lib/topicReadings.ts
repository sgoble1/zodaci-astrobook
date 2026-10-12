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
/** Other Systems chapters, written by the same queue from calculated system values. */
export const SYSTEM_READINGS: { slug: string; title: string; route: string }[] = [
  { slug: 'sys-vedic', title: 'Vedic · Jyotish', route: '/other-systems/vedic' }, { slug: 'sys-chinese', title: 'Chinese · Ba Zi', route: '/chinese' },
  { slug: 'sys-mayan-tzolkin', title: 'Maya · Tzolk’in', route: '/other-systems/mayan-tzolkin' }, { slug: 'sys-tibetan-mewa', title: 'Tibetan Mewa', route: '/other-systems/tibetan-mewa' },
  { slug: 'sys-nine-star-ki', title: 'Japanese Nine Star Ki', route: '/other-systems/nine-star-ki' }, { slug: 'sys-chaldean-numerology', title: 'Chaldean Numerology', route: '/other-systems/chaldean-numerology' },
  { slug: 'sys-tarot-birth-cards', title: 'Tarot Birth Cards', route: '/other-systems/tarot-birth-cards' }, { slug: 'sys-celtic-tree-calendar', title: 'Celtic Tree Calendar', route: '/other-systems/celtic-tree-calendar' },
];
/** Twelve general core themes every member gets, written from their own chart. */
export const CORE_THEMES: { slug: string; title: string }[] = [{ slug: 'core-personality', title: 'Personality & Strengths' }, { slug: 'core-emotions', title: 'Emotional World' }, { slug: 'core-friendship', title: 'Friendship & Community' }, { slug: 'core-creativity', title: 'Creativity & Self-Expression' }, { slug: 'core-work-style', title: 'Work Style & Daily Habits' }, { slug: 'core-leadership', title: 'Leadership & Ambition' }, { slug: 'core-self-worth', title: 'Self-Worth & Confidence' }, { slug: 'core-resilience', title: 'Stress & Resilience' }, { slug: 'core-learning', title: 'Learning & Wisdom' }, { slug: 'core-beliefs-travel', title: 'Beliefs, Travel & Adventure' }, { slug: 'core-freedom-change', title: 'Freedom & Change' }, { slug: 'core-legacy', title: 'Legacy & Life Direction' }];
/** Everything the writing queue produces for each member, in server order. */
export const ALL_READINGS = [...TOPIC_READINGS, ...SYSTEM_READINGS, ...CORE_THEMES];
export type TopicRow = { id: string; page_key: string; title: string; content: string; status: string; updated_at: string };

export async function loadMyTopicReadings(): Promise<TopicRow[]> {
  const { data } = await supabase.from('generated_pages').select('id,page_key,title,content,status,updated_at').eq('section', 'Topic Reading');
  return (data ?? []) as TopicRow[];
}
export async function writeTopicReading(slug: string, opts: { regenerate?: boolean; targetUserId?: string; chain?: boolean } = {}): Promise<void> {
  let res;
  try { res = await supabase.functions.invoke('topic-readings', { body: { slug, ...opts } }); } catch { throw new Error('This reading could not be written right now.'); }
  const { data, error } = res;
  if (error || data?.error) {
    let message = data?.error as string | undefined;
    const ctx = (error as { context?: unknown } | null)?.context;
    if (!message && ctx instanceof Response) message = (await ctx.json().catch(() => null))?.error;
    if ((ctx as Response | undefined)?.status === 429 && !message) message = 'Daily writing limit reached. Your remaining readings continue tomorrow.';
    if ((ctx as Response | undefined)?.status === 402) message = 'Writing is paused because the AI credits have run out. It will continue once credits are added.';
    if ((ctx as Response | undefined)?.status === 401) message = 'Please sign in again to keep writing your readings.';
    throw new Error(message || 'This reading could not be written right now.');
  }
}
