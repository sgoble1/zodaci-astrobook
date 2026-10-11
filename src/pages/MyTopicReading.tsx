import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { loadMyTopicReadings, TOPIC_READINGS, type TopicRow } from '@/lib/topicReadings';

export default function MyTopicReading() {
  const { slug } = useParams();
  const meta = TOPIC_READINGS.find(t => t.slug === slug);
  const [row, setRow] = useState<TopicRow | null | undefined>(undefined);
  useEffect(() => { loadMyTopicReadings().then(rs => setRow(rs.find(r => r.page_key === `topic-${slug}`) ?? null)); }, [slug]);
  if (row === undefined) return <p role="status">Loading…</p>;
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link to="/my-readings" className="text-sm underline">← My readings</Link>
      <h1 className="font-display text-4xl">{meta?.title ?? 'Reading'}</h1>
      {row ? <div className="prose prose-invert max-w-none [&_table]:block [&_table]:overflow-x-auto"><ReactMarkdown remarkPlugins={[remarkGfm]}>{row.content}</ReactMarkdown></div>
        : <p className="text-muted-foreground">This reading hasn’t been written yet. Open My readings and it will be written automatically.</p>}
    </article>
  );
}
