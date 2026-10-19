import { Link } from 'react-router-dom';
import { ALL_READINGS } from '@/lib/topicReadings';
import { BoxArt } from '@/components/common/BoxArt';
import { FounderSourcePanel } from '@/components/readings/FounderSourcePanel';
import { FounderAccuracy } from '@/components/readings/FounderAccuracy';

export default function FounderTopics() {
  return <article className="space-y-8" data-keep-wording>
    <header><h1 className="text-4xl">Shane’s themes & extended chapters</h1></header>
    <FounderAccuracy />
    <div className="grid gap-3 sm:grid-cols-2">{ALL_READINGS.map(t => <Link key={t.slug} to={t.slug.startsWith('sys-') ? `/other-systems/${t.slug.slice(4)}` : `/my-readings/topic/${t.slug}`} className="flex items-center gap-4 rounded border border-border bg-card p-4 hover:border-primary"><BoxArt seed={t.slug} label={t.title} className="h-16 w-20 shrink-0" /><h2 className="text-xl">{t.title}</h2></Link>)}</div>
    <FounderSourcePanel theme="recurring-themes" />
  </article>;
}