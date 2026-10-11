import { registerPrivateValue } from '@/lib/privateEditionStore';
// Theme pages that gather every matching chapter and passage across the source documents.
export type Topic = {
  slug: string; label: string; intro: string;
  /** Regex matched against Masterbook / Birth Chart Book chapter and section titles. */
  chapters: RegExp;
  /** Exact Masterbook sections that belong here even when the title is not an obvious keyword match. */
  sourceIds?: string[];
  /** Search query for pulling passages from all documents. */
  query: string;
  /** Hand-picked in-app pages that cover this topic. */
  pages?: { to: string; label: string }[];
  questions: string[];
  /** Key facts quoted or summarised from the sources, each with where it comes from. */
  facts?: { text: string; cite: string; to: string }[];
  /** Editorial interpretations stay separate from recorded chart facts and protected source text. */
  guide?: { title: string; text: string; to: string; cite: string }[];
  reflection?: string[];
};

export let TOPICS: Topic[] = [];

registerPrivateValue("topics", "TOPICS", value => { TOPICS = value as typeof TOPICS; }, []);
