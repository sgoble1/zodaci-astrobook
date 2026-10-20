import { Link } from 'react-router-dom';
import { ZodaciLogo } from './ZodaciLogo';

const COLUMNS: { heading: string; links: [string, string][] }[] = [
  { heading: 'Zodaci', links: [['/auth', 'Free chart'], ['/pricing', 'Pro'], ['/pricing', 'Cosmic'], ['/pricing', 'Pricing'], ['/astrobook', 'AstroBook']] },
  { heading: 'Reading Room', links: [['/blog/learn/reading-your-birth-chart', 'Reading your birth chart'], ['/blog/learn/moon-phases-explained', 'Moon phases'], ['/blog/learn/reflection-not-prediction', 'Reflection practice'], ['/blog', 'All articles']] },
  { heading: 'Company', links: [['/about', 'About'], ['/faq', 'FAQ'], ['/demo', 'Interactive demo'], ['/themes', 'Core themes'], ['/community', 'Community'], ['/privacy', 'Privacy Policy'], ['/terms', 'Terms of Service']] },
];

/** One footer for every public page: crawlable links, brand line and the reflection disclaimer. */
export function GlobalFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
        <div className="space-y-3">
          <Link to="/welcome" aria-label="Zodaci home"><ZodaciLogo compact /></Link>
          <p className="text-sm text-muted-foreground">Your sky. Your story.</p>
          <p className="text-xs text-muted-foreground">Zodaci is the platform. AstroBook is our printed book.</p>
        </div>
        {COLUMNS.map(col => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="mb-3 text-sm font-semibold">{col.heading}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map(([to, label]) => <li key={label}><Link to={to} className="hover:text-foreground">{label}</Link></li>)}
              {col.heading === 'Company' && <li><a href="mailto:hello@zodaci.com" className="hover:text-foreground">Contact</a></li>}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-5 text-xs text-muted-foreground sm:px-10">
          <p>© {new Date().getFullYear()} Zodaci. All rights reserved.</p>
          <p>Astrology is a tool for reflection, not prediction.</p>
          <p>Made with care for curious people.</p>
        </div>
      </div>
    </footer>
  );
}
