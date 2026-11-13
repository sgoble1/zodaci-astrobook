import { CREDIT_ALLOWANCE, type Tier } from '@/lib/plans';

const PAID_POINTS = ['Every section of every reading', 'Your Masterbook to read online', 'Custom chapters, podcasts and Cosmic Studio', 'Chiron, the Nodes and deeper timing'];

/** The demo compares reading access; paid plans differ only in monthly credits. */
export const DEMO_PLANS: Record<Tier, { sections: number; points: string[] }> = {
  free: { sections: 1, points: ['Your calculated chart', 'The opening section of each core-theme reading', `${CREDIT_ALLOWANCE.free} monthly AI credits`] },
  full: { sections: 7, points: [...PAID_POINTS, `${CREDIT_ALLOWANCE.full} monthly AI credits`] },
  creator: { sections: 7, points: [...PAID_POINTS, `${CREDIT_ALLOWANCE.creator} monthly AI credits`] },
};