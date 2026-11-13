import type { StaffId } from '@/lib/observatory';

/** Observatory consult: each staff member's quick questions. Chips only fill the question box; nothing is sent until the member presses Ask. */
export const STAFF_QUESTIONS: { staff: StaffId; questions: string[] }[] = [
  { staff: 'cartographer', questions: ['What does my Rising sign say about first impressions?', 'Which house holds most of my planets?'] },
  { staff: 'navigator', questions: ['What is my North Node asking me to grow toward?', 'Where is my Midheaven pointing my work?'] },
  { staff: 'historian', questions: ['What happens in my Saturn return?', 'Which long cycles am I in right now?'] },
  { staff: 'curator', questions: ['What does my Venus say about how I love?', 'What does my 7th house say about partners?'] },
  { staff: 'analyst', questions: ['Which element is strongest in my chart?', 'What does my Moon need to feel settled?'] },
];
