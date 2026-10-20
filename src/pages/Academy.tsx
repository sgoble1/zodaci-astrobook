import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACADEMY, ALL_LESSONS, lessonBySlug } from '@/content/academy';
import { PUBLIC_ARTICLES } from '@/content/publicArticles';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';

/** Public learning hub: four paths of short lessons, each ending in a link to try it on your own chart. */
export function AcademyHome() {
  usePageMeta('Zodaci Academy — learn to read your birth chart', 'Short, plain-language lessons on planets, signs, houses, aspects, transits, retrogrades, Ba Zi, numerology and Feng Shui.');
  useJsonLd('academy-schema', { '@type': 'Course', name: 'Zodaci Academy', description: 'Plain-language lessons on reading a birth chart.', provider: { '@type': 'Organization', name: 'Zodaci', sameAs: 'https://zodaci.com' }, hasPart: ALL_LESSONS.map(l => ({ '@type': 'LearningResource', name: l.title, url: `https://zodaci.com/academy/${l.slug}` })) });
  return (
    <article className="space-y-14">
      <header className="max-w-3xl"><p className="font-smallcaps text-xs text-gold">Zodaci Academy</p><h1 className="mt-3 font-display text-5xl">Learn to read your own sky.</h1><p className="mt-4 text-lg text-muted-foreground">{ALL_LESSONS.length} short lessons in four paths. Each one separates what is measured from what is interpreted, and ends with a way to try it on your chart.</p></header>
      {ACADEMY.map(path => (
        <section key={path.slug} aria-labelledby={`p-${path.slug}`}>
          <h2 id={`p-${path.slug}`} className="font-display text-3xl">{path.title}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{path.intro}</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{path.lessons.map(l => (
            <li key={l.slug}><Link to={`/academy/${l.slug}`} className="vellum flex h-full flex-col p-5"><h3 className="text-xl">{l.title}</h3><p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{l.summary}</p><p className="mt-4 flex items-center gap-1.5 text-xs text-gold"><Clock aria-hidden className="h-3.5 w-3.5" />{l.minutes} min read</p></Link></li>
          ))}</ol>
        </section>
      ))}
      <section aria-labelledby="rr-h" className="border-t border-border pt-10"><h2 id="rr-h" className="font-display text-3xl">From the Reading Room</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{PUBLIC_ARTICLES.map(a => <Link key={a.slug} to={`/blog/learn/${a.slug}`} className="vellum p-5"><p className="font-smallcaps text-[10px] text-gold">{a.category}</p><h3 className="mt-2 text-lg">{a.title}</h3><p className="mt-2 text-sm text-muted-foreground">{a.summary}</p></Link>)}</div></section>
      <section className="vellum p-6 text-center sm:p-10"><h2 className="font-display text-3xl">Ready to look at your own chart?</h2><p className="mt-3 text-muted-foreground">Free to begin. No birth time needed to start.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild><Link to="/start">Explore your chart</Link></Button><Button asChild variant="outline"><Link to="/compatibility">Try the compatibility score</Link></Button></div></section>
    </article>
  );
}

export function AcademyLesson() {
  const { slug } = useParams();
  const lesson = lessonBySlug(slug);
  usePageMeta(lesson ? `${lesson.title} — Zodaci Academy` : 'Lesson not found — Zodaci Academy', lesson?.summary ?? 'Zodaci Academy lessons');
  useJsonLd('lesson-schema', lesson ? { '@type': 'Article', headline: lesson.title, description: lesson.summary, isPartOf: { '@type': 'Course', name: 'Zodaci Academy' }, author: { '@type': 'Organization', name: 'Zodaci' }, mainEntityOfPage: `https://zodaci.com/academy/${lesson.slug}` } : null);
  if (!lesson) return <div className="space-y-4"><h1 className="text-3xl">Lesson not found</h1><Link to="/academy" className="underline">Back to the Academy</Link></div>;
  const i = ALL_LESSONS.findIndex(l => l.slug === lesson.slug);
  const prev = ALL_LESSONS[i - 1], next = ALL_LESSONS[i + 1];
  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/academy" className="inline-flex items-center gap-1.5 text-sm text-accent underline-offset-4 hover:underline"><ArrowLeft aria-hidden className="h-4 w-4" />Academy</Link>
      <p className="mt-8 text-sm text-muted-foreground">{lesson.path.title} · {lesson.minutes} min read</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{lesson.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{lesson.summary}</p>
      <div className="mt-10 space-y-8">{lesson.sections.map(s => <section key={s.title}><h2 className="text-2xl">{s.title}</h2><p className="mt-3 leading-8 text-muted-foreground">{s.text}</p></section>)}</div>
      <div className="vellum mt-10 flex flex-wrap items-center justify-between gap-4 p-5"><p>Try it on your own chart.</p><Button asChild><Link to={lesson.tryIt.to}>{lesson.tryIt.label}<ArrowRight /></Link></Button></div>
      <nav aria-label="Lessons" className="mt-10 flex flex-wrap justify-between gap-4 border-t border-border pt-6 text-sm">{prev ? <Link to={`/academy/${prev.slug}`} className="hover:underline">← {prev.title}</Link> : <span />}{next && <Link to={`/academy/${next.slug}`} className="hover:underline">{next.title} →</Link>}</nav>
    </article>
  );
}
