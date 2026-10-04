import { Link } from 'react-router-dom';
import { VERIFY_GROUPS } from '@/content/verifySources';
import { VerifySourceList } from '@/components/common/VerifySources';

export default function Verify() {
  return (
    <article className="space-y-12">
      <header className="max-w-3xl">
        <div className="font-smallcaps text-xs text-gold">Check it yourself</div>
        <h1 className="font-display mt-2">Verify the Sources</h1>
        <p className="mt-4 text-lg text-muted-foreground">Every chart and system page links here. In plain words: the planet positions are real astronomy you can check with NASA. The meanings come from old books and traditions, which these links let you read. And the research links show what scientists found when they tested astrology.</p>
      </header>
      {VERIFY_GROUPS.map(g => (
        <section key={g.id} aria-labelledby={`v-${g.id}`}>
          <h2 id={`v-${g.id}`} className="text-2xl">{g.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{g.plain}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">{g.routes.filter(r => !r.includes('bagua-wheel')).map(r => <Link key={r} to={r} className="px-2 py-0.5 rounded-full border border-border hover:border-accent">{r}</Link>)}</div>
          <VerifySourceList group={g} />
        </section>
      ))}
    </article>
  );
}
