import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import scene from '@/assets/voyager/home-cosmos.png.asset.json';

/** Shared editorial opening; chart facts arrive from the authorized parent, never a fixture. */
export function VoyagerOpening({ title, script, text, lines = [], primary, secondary, heading = 'h1', kicker = 'Zodaci · Astral Research Authority' }: {
  title: ReactNode; script: string; text: string; lines?: string[];
  primary: { to: string; label: string }; secondary?: { to: string; label: string };
  heading?: 'h1' | 'h2'; kicker?: string;
}) {
  const H = heading;
  return <div className="voyager-opening">
    <img src={scene.url} alt="Engraved celestial portals, Saturn and astronomers studying the sky" width={1672} height={941} className="voyager-opening-art" />
    <div className="voyager-opening-copy">
      <p className="voyager-opening-kicker">{kicker}</p>
      <H>{title}</H>
      <p className="voyager-opening-script">{script}</p>
      <p className="voyager-opening-text">{text}</p>
      {lines.length > 0 && <ul className="voyager-opening-chart">{lines.map(line => <li key={line}>{line}</li>)}</ul>}
      <div className="voyager-opening-actions">
        <Button asChild variant="primary" size="lg"><Link to={primary.to}>{primary.label}<ArrowRight aria-hidden /></Link></Button>
        {secondary && <Button asChild variant="outline" size="lg"><Link to={secondary.to}>{secondary.label}</Link></Button>}
      </div>
    </div>
  </div>;
}