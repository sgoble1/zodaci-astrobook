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

/** Readings the free plan writes automatically; everything else needs a paid plan. */
export const FREE_READINGS = ['big-three', 'core-personality'];
/** Paid plans write only these upfront; every other reading is written the first time it is opened. */
export const FLAGSHIP_READINGS = ['big-three', 'core-personality', 'purpose', 'love', 'career'];


/** Always scoped to the signed-in member, even for admins who can read every row. */
export async function loadMyTopicReadings(): Promise<TopicRow[]> {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) return [];
  const { data, error } = await supabase.from('generated_pages').select('id,page_key,title,content,status,updated_at').eq('section', 'Topic Reading').eq('owner_id', uid);
  if (error) throw new Error('Your readings could not load. Please try again.');
  return (data ?? []) as TopicRow[];
}

/** True when the member may have every reading written (paid plan, admin or private shared space). */
export async function canWriteAllReadings(): Promise<boolean> {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) return false;
  const [paid, admin, shared] = await Promise.all([
    supabase.rpc('has_paid_plan', { _user_id: uid }),
    supabase.rpc('has_role', { _user_id: uid, _role: 'admin' }),
    supabase.rpc('is_shared_space_member'),
  ]);
  return !!(paid.data || admin.data || shared.data);
}
export async function writeTopicReading(slug: string, opts: { regenerate?: boolean; targetUserId?: string; chain?: boolean; lane?: number; lanes?: number } = {}): Promise<void> {
  let res;
  try { res = await supabase.functions.invoke('topic-readings', { body: { slug, ...opts } }); }
  catch (e) {
    // The client surfaces non-2xx responses by throwing; recover the real message (e.g. "writing stopped") from the body.
    const ctx = (e as { context?: unknown }).context;
    const body = ctx instanceof Response ? await ctx.json().catch(() => null) as { error?: string } | null : null;
    throw new Error(body?.error || 'This reading could not be written right now.');
  }
  const { data, error } = res;
  if (error || data?.error) {
    let message = data?.error as string | undefined;
    const ctx = (error as { context?: unknown } | null)?.context;
    if (!message && ctx instanceof Response) message = (await ctx.json().catch(() => null))?.error;
    if ((ctx as Response | undefined)?.status === 429 && !message) message = 'Daily writing limit reached. Try again tomorrow.';
    if ((ctx as Response | undefined)?.status === 402) message = 'Writing is paused because AI credits have run out. Retry after credits are available.';
    if ((ctx as Response | undefined)?.status === 401) message = 'Please sign in again to keep writing your readings.';
    throw new Error(message || 'This reading could not be written right now.');
  }
}

/** Reading filters on My Readings: every topic and core theme belongs to at least one; nothing is hidden by default. */
export const READING_FILTERS = ['Personal', 'Relationships', 'Timing', 'Career', 'Spiritual'] as const;
export type ReadingFilter = typeof READING_FILTERS[number];
const FILTER_OF: Record<string, ReadingFilter[]> = {
  'big-three': ['Personal'], 'chart-shape': ['Personal'], purpose: ['Spiritual', 'Career'], love: ['Relationships'], career: ['Career'], money: ['Career'],
  mind: ['Personal'], health: ['Personal'], 'family-home': ['Relationships'], 'recurring-themes': ['Personal'], obstacles: ['Personal'], 'shadow-work': ['Spiritual'],
  'past-lives': ['Spiritual'], 'spiritual-gifts': ['Spiritual'], practices: ['Spiritual'], numerology: ['Spiritual'], timing: ['Timing'], 'sex-attraction': ['Relationships'],
  'core-personality': ['Personal'], 'core-emotions': ['Personal'], 'core-friendship': ['Relationships'], 'core-creativity': ['Personal'], 'core-work-style': ['Career'],
  'core-leadership': ['Career'], 'core-self-worth': ['Personal'], 'core-resilience': ['Personal'], 'core-learning': ['Spiritual'], 'core-beliefs-travel': ['Spiritual'],
  'core-freedom-change': ['Timing', 'Personal'], 'core-legacy': ['Career', 'Spiritual'],
};
export const readingMatches = (slug: string, filter: ReadingFilter | null) => !filter || (FILTER_OF[slug] ?? ['Personal']).includes(filter);
