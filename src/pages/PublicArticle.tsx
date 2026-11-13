import { Link, Navigate, useParams } from 'react-router-dom';
import { PUBLIC_ARTICLES } from '@/content/publicArticles';
import { Button } from '@/components/ui/button';
import { useJsonLd } from '@/hooks/useJsonLd';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function PublicArticle() {
  const { slug } = useParams(); const article = PUBLIC_ARTICLES.find(a => a.slug === slug);
  usePageMeta(article ? `${article.title} | Zodaci` : 'Reading not found | Zodaci', article?.summary ?? 'Zodaci editorial');
  useJsonLd('article-schema', article ? { '@type': 'Article', headline: article.title, description: article.summary, author: { '@type': 'Organization', name: 'Zodaci' }, publisher: { '@type': 'Organization', name: 'Zodaci' }, mainEntityOfPage: `https://zodaci.com/learn/${article.slug}` } : null);
  if (!article) return <><h1>Reading not found</h1><Link to="/learn#articles" className="underline">Back to Learn</Link></>;
  return <article className="max-w-3xl mx-auto"><p className="text-sm text-muted-foreground">{article.category} · Zodaci editorial</p><h1 className="text-4xl mt-3">{article.title}</h1><p className="text-lg mt-5 text-muted-foreground">{article.summary}</p><img loading="lazy" decoding="async" src={article.image} alt="" width={1024} height={768} className="rounded w-full aspect-[4/3] object-cover mt-8" /><p className="text-xs text-muted-foreground mt-2">Illustrative artwork, not a calculated chart diagram.</p><div className="space-y-8 mt-10">{article.sections.map(s => <section key={s.title}><h2 className="text-2xl">{s.title}</h2><p className="mt-4 leading-8 text-muted-foreground">{s.text}</p></section>)}</div><section className="border-t border-border pt-6 mt-10"><h2 className="text-xl">Check the sources</h2><ul className="mt-4 space-y-3">{article.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="underline text-accent">{s.label}</a></li>)}</ul><p className="text-xs text-muted-foreground mt-4">Sources support astronomical facts or explain psychological concepts, not the truth of an individual astrological interpretation.</p></section><div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link to="/start">Explore your own chart</Link></Button><Button asChild variant="outline"><Link to="/community">Discuss in the community</Link></Button></div></article>;
}
/** Old /blog/learn/:slug addresses keep working. */
export function LegacyArticleRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/learn/${slug ?? ''}`} replace />;
}
