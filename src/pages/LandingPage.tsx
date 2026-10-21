import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PromoVideo } from '@/components/brand/PromoVideo';
import { splitOnFilm } from '@/content/promoVideo';

type Page = { title: string; headline: string; subheadline: string; body: string; cta_label: string; cta_link: string };

/** Admin-managed marketing landing page at /lp/:slug. */
export default function LandingPage() {
  const { slug } = useParams();
  const [p, setP] = useState<Page | null | undefined>(undefined);
  usePageMeta(`${p?.title || p?.headline || 'Explore your chart'} · Zodaci`, p?.subheadline || 'Explore your calculated birth chart and personal, plain-language readings with Zodaci.');
  useEffect(() => {
    let active = true;
    setP(undefined);
    supabase.from('marketing_pages').select('*').eq('slug', slug ?? '').maybeSingle().then(({ data }) => { if (active) setP(data as Page | null); });
    return () => { active = false; };
  }, [slug]);
  if (p === undefined) return <p role="status" className="text-muted-foreground">Loading…</p>;
  if (!p) return <p className="text-center text-muted-foreground py-20">This page isn’t available.</p>;
  const cta = <Button asChild size="lg"><Link to={p.cta_link.startsWith('/') ? p.cta_link : '/auth'}>{p.cta_label}</Link></Button>;
  return (
    <article className="space-y-14">
      <motion.header initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="mx-auto max-w-3xl text-center space-y-5 py-10">
        <h1 className="font-display text-4xl sm:text-6xl leading-tight">{p.headline}</h1>
        {p.subheadline && <p className="text-lg text-muted-foreground">{p.subheadline}</p>}
        {cta}
      </motion.header>
      {p.body && splitOnFilm(p.body).map((part, i) => <div key={i} className="space-y-14">
        {i > 0 && <div className="mx-auto max-w-4xl"><PromoVideo /></div>}
        {part && <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="prose prose-invert mx-auto max-w-3xl"><ReactMarkdown>{part}</ReactMarkdown></motion.section>}
      </div>)}
      <div className="text-center">{cta}</div>
    </article>
  );
}
